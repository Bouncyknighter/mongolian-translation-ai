"""
Mongolian-English Translation Dataset Pipeline
Prepares parallel corpus for LoRA fine-tuning
"""

import json
import random
from typing import Dict, List, Tuple, Optional
from datasets import Dataset, DatasetDict
from transformers import PreTrainedTokenizer


# Default instruction templates
TRANSLATION_INSTRUCTIONS = [
    "Translate the following Mongolian text to English:",
    "Convert this Mongolian sentence to English:",
    "What is the English translation of this Mongolian text?",
    "Translate from Mongolian to English:",
    "Provide the English equivalent of the following Mongolian:",
]

REVERSE_INSTRUCTIONS = [
    "Translate the following English text to Mongolian:",
    "Convert this English sentence to Mongolian:",
    "What is the Mongolian translation of this text?",
    "Translate from English to Mongolian:",
    "Provide the Mongolian equivalent of the following English:",
]


def create_alpaca_format(
    mongolian_text: str,
    english_text: str,
    direction: str = "mn_to_en",
    system_prompt: Optional[str] = None
) -> Dict[str, str]:
    """
    Convert parallel text to Alpaca instruction format
    
    Args:
        mongolian_text: Text in Mongolian
        english_text: Text in English
        direction: 'mn_to_en' or 'en_to_mn'
        system_prompt: Optional system-level instruction
    
    Returns:
        Dictionary with instruction, input, output keys
    """
    if direction == "mn_to_en":
        instruction = random.choice(TRANSLATION_INSTRUCTIONS)
        input_text = mongolian_text
        output_text = english_text
    else:
        instruction = random.choice(REVERSE_INSTRUCTIONS)
        input_text = english_text
        output_text = mongolian_text
    
    return {
        "instruction": instruction,
        "input": input_text,
        "output": output_text,
        "system": system_prompt or "You are a professional translator specializing in Mongolian and English.",
    }


def format_for_training(example: Dict[str, str]) -> Dict[str, str]:
    """
    Format Alpaca example into training text
    """
    text = f"""<|system|>
{example['system']}<|end|>
<|user|>
{example['instruction']}

{example['input']}<|end|>
<|assistant|>
{example['output']}<|end|>"""
    
    return {"text": text}


def load_parallel_corpus(
    file_path: str,
    mn_col: str = "mn",
    en_col: str = "en",
    split_ratio: float = 0.9
) -> DatasetDict:
    """
    Load Mongolian-English parallel corpus from JSON/JSONL/CSV
    
    Args:
        file_path: Path to dataset file
        mn_col: Column name for Mongolian text
        en_col: Column name for English text
        split_ratio: Train/validation split ratio
    
    Returns:
        DatasetDict with train and validation splits
    """
    if file_path.endswith('.jsonl'):
        dataset = Dataset.from_json(file_path)
    elif file_path.endswith('.json'):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        dataset = Dataset.from_list(data)
    elif file_path.endswith('.csv'):
        dataset = Dataset.from_csv(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")
    
    # Create bilingual training examples (both directions)
    examples = []
    for item in dataset:
        mn_text = item.get(mn_col, '').strip()
        en_text = item.get(en_col, '').strip()
        
        if not mn_text or not en_text:
            continue
        
        # Mongolian to English
        examples.append(create_alpaca_format(mn_text, en_text, "mn_to_en"))
        
        # English to Mongolian (50% of data for bidirectional training)
        if random.random() < 0.5:
            examples.append(create_alpaca_format(mn_text, en_text, "en_to_mn"))
    
    # Shuffle and split
    random.shuffle(examples)
    split_idx = int(len(examples) * split_ratio)
    
    train_data = examples[:split_idx]
    val_data = examples[split_idx:]
    
    # Format for training
    train_dataset = Dataset.from_list(train_data).map(format_for_training)
    val_dataset = Dataset.from_list(val_data).map(format_for_training)
    
    return DatasetDict({
        "train": train_dataset,
        "validation": val_dataset
    })


def create_sample_dataset(output_dir: str = "./data", num_samples: int = 1000):
    """
    Create sample dataset for testing (placeholder data)
    In production, replace with real Mongolian-English parallel corpus
    """
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    # Sample parallel sentences (replace with real data)
    sample_pairs = [
        {"mn": "Сайн уу, та юу хийж байна вэ?", "en": "Hello, what are you doing?"},
        {"mn": "Өнөөдөр хэдэн градус вэ?", "en": "What is the temperature today?"},
        {"mn": "Би Монголоос ирсэн.", "en": "I am from Mongolia."},
        {"mn": "Таалагдсанд баярлалаа.", "en": "Thank you for your help."},
        {"mn": "Миний нэр Мишээл.", "en": "My name is Misheel."},
    ]
    
    # Generate more synthetic data by repeating with variations
    data = []
    for i in range(num_samples):
        pair = sample_pairs[i % len(sample_pairs)]
        data.append(pair)
    
    output_path = os.path.join(output_dir, "sample_mn_en.jsonl")
    with open(output_path, 'w', encoding='utf-8') as f:
        for item in data:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')
    
    print(f"Created sample dataset: {output_path}")
    print(f"Total samples: {len(data)}")
    return output_path


if __name__ == "__main__":
    # Create sample dataset for testing
    dataset_path = create_sample_dataset()
    
    # Load and verify
    dataset = load_parallel_corpus(dataset_path)
    print(f"\nDataset splits:")
    print(f"  Train: {len(dataset['train'])} examples")
    print(f"  Validation: {len(dataset['validation'])} examples")
    print(f"\nSample training example:")
    print(dataset['train'][0]['text'][:500] + "...")
