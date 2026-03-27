"""
LoRA Training Script for Mongolian-English Translation
Optimized for NVIDIA GPU Cloud
"""

import os
import sys
import argparse
import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
    Trainer
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training, TaskType
from datasets import load_dataset
import wandb

from dataset import load_parallel_corpus


# Configuration
DEFAULT_CONFIG = {
    "model_name": "unsloth/llama-3.2-1b-instruct",
    "dataset_path": "./data/sample_mn_en.jsonl",
    "output_dir": "./outputs/lora-mongolian-translator",
    "r": 16,
    "lora_alpha": 32,
    "lora_dropout": 0.05,
    "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    "num_epochs": 3,
    "per_device_batch_size": 4,
    "gradient_accumulation_steps": 4,
    "learning_rate": 2e-4,
    "max_seq_length": 512,
    "warmup_steps": 100,
    "logging_steps": 10,
    "save_steps": 500,
    "eval_steps": 500,
}


def setup_model_and_tokenizer(config: dict):
    """Load model and tokenizer with 4-bit quantization"""
    print(f"Loading model: {config['model_name']}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(config['model_name'])
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"
    
    # Load model with 4-bit quantization for memory efficiency
    model = AutoModelForCausalLM.from_pretrained(
        config['model_name'],
        load_in_4bit=True,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    # Prepare model for LoRA training
    model = prepare_model_for_kbit_training(model)
    
    return model, tokenizer


def setup_lora_config(config: dict):
    """Configure LoRA"""
    lora_config = LoraConfig(
        r=config['r'],
        lora_alpha=config['lora_alpha'],
        target_modules=config['target_modules'],
        lora_dropout=config['lora_dropout'],
        bias="none",
        task_type=TaskType.CAUSAL_LM,
    )
    return lora_config


def train(config: dict):
    """Main training function"""
    
    # Setup W&B logging
    wandb.init(
        project="mongolian-translation-lora",
        name=f"llama-3.2-1b-r{config['r']}",
        config=config
    )
    
    # Load model and tokenizer
    model, tokenizer = setup_model_and_tokenizer(config)
    
    # Setup LoRA
    lora_config = setup_lora_config(config)
    model = get_peft_model(model, lora_config)
    
    print("\nLoRA Configuration:")
    model.print_trainable_parameters()
    
    # Load dataset
    print(f"\nLoading dataset from: {config['dataset_path']}")
    if not os.path.exists(config['dataset_path']):
        print("Dataset not found. Creating sample dataset...")
        from dataset import create_sample_dataset
        config['dataset_path'] = create_sample_dataset()
    
    dataset = load_parallel_corpus(config['dataset_path'])
    
    # Tokenize dataset
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            truncation=True,
            max_length=config['max_seq_length'],
            padding="max_length",
        )
    
    tokenized_datasets = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names,
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=config['output_dir'],
        num_train_epochs=config['num_epochs'],
        per_device_train_batch_size=config['per_device_batch_size'],
        per_device_eval_batch_size=config['per_device_batch_size'],
        gradient_accumulation_steps=config['gradient_accumulation_steps'],
        learning_rate=config['learning_rate'],
        warmup_steps=config['warmup_steps'],
        logging_steps=config['logging_steps'],
        save_steps=config['save_steps'],
        eval_steps=config['eval_steps'],
        evaluation_strategy="steps",
        save_strategy="steps",
        logging_strategy="steps",
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        greater_is_better=False,
        report_to="wandb",
        run_name=f"lora-mn-en-r{config['r']}",
        fp16=True,
        optim="paged_adamw_8bit",
        lr_scheduler_type="cosine",
        group_by_length=True,
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_datasets["train"],
        eval_dataset=tokenized_datasets["validation"],
        data_collator=data_collator,
    )
    
    # Train
    print("\n" + "="*50)
    print("Starting training...")
    print("="*50)
    
    trainer.train()
    
    # Save final model
    final_output_dir = os.path.join(config['output_dir'], 'final')
    trainer.save_model(final_output_dir)
    tokenizer.save_pretrained(final_output_dir)
    
    print(f"\n✅ Training complete! Model saved to: {final_output_dir}")
    
    # Merge and save for inference
    print("\nMerging LoRA weights with base model...")
    merged_model = model.merge_and_unload()
    merged_output_dir = os.path.join(config['output_dir'], 'merged')
    merged_model.save_pretrained(merged_output_dir)
    print(f"✅ Merged model saved to: {merged_output_dir}")
    
    wandb.finish()


def main():
    parser = argparse.ArgumentParser(description="Train LoRA for Mongolian-English translation")
    parser.add_argument("--dataset", type=str, default=DEFAULT_CONFIG['dataset_path'], help="Path to dataset")
    parser.add_argument("--output", type=str, default=DEFAULT_CONFIG['output_dir'], help="Output directory")
    parser.add_argument("--r", type=int, default=DEFAULT_CONFIG['r'], help="LoRA rank")
    parser.add_argument("--alpha", type=int, default=DEFAULT_CONFIG['lora_alpha'], help="LoRA alpha")
    parser.add_argument("--epochs", type=int, default=DEFAULT_CONFIG['num_epochs'], help="Number of epochs")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_CONFIG['per_device_batch_size'], help="Batch size")
    
    args = parser.parse_args()
    
    config = DEFAULT_CONFIG.copy()
    config['dataset_path'] = args.dataset
    config['output_dir'] = args.output
    config['r'] = args.r
    config['lora_alpha'] = args.alpha
    config['num_epochs'] = args.epochs
    config['per_device_batch_size'] = args.batch_size
    
    # Create output directory
    os.makedirs(config['output_dir'], exist_ok=True)
    
    train(config)


if __name__ == "__main__":
    main()
