"""
Inference API for Mongolian-English Translation
FastAPI wrapper for trained LoRA model
"""

import os
import torch
from typing import Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from peft import PeftModel


app = FastAPI(title="Mongolian-English Translation API", version="1.0.0")

# Global model and tokenizer
model = None
tokenizer = None
pipe = None


class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "mn"  # 'mn' or 'en'
    max_new_tokens: int = 256
    temperature: float = 0.7


class TranslationResponse(BaseModel):
    translation: str
    source: str
    target_lang: str


def load_model(model_path: str, base_model_name: str = "unsloth/llama-3.2-1b-instruct"):
    """Load the fine-tuned LoRA model"""
    global model, tokenizer, pipe
    
    print(f"Loading model from: {model_path}")
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    
    # Load base model
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    # Load LoRA adapter
    model = PeftModel.from_pretrained(base_model, model_path)
    model = model.merge_and_unload()
    
    # Create pipeline
    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    print("✅ Model loaded successfully")


def translate_mn_en(text: str, source_lang: str = "mn", **generation_kwargs) -> str:
    """
    Translate between Mongolian and English
    
    Args:
        text: Text to translate
        source_lang: 'mn' for Mongolian to English, 'en' for English to Mongolian
        **generation_kwargs: Additional generation parameters
    
    Returns:
        Translated text
    """
    if source_lang == "mn":
        instruction = "Translate the following Mongolian text to English:"
        target_lang = "en"
    else:
        instruction = "Translate the following English text to Mongolian:"
        target_lang = "mn"
    
    # Format prompt
    prompt = f"""<|system|>
You are a professional translator specializing in Mongolian and English translation. Provide accurate, natural-sounding translations.<|end|>
<|user|>
{instruction}

{text}<|end|>
<|assistant|>"""
    
    # Generate translation
    outputs = pipe(
        prompt,
        max_new_tokens=generation_kwargs.get('max_new_tokens', 256),
        temperature=generation_kwargs.get('temperature', 0.7),
        do_sample=True,
        top_p=0.9,
        return_full_text=False,
    )
    
    # Extract translation
    translation = outputs[0]['generated_text'].strip()
    
    return translation, target_lang


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
    }


@app.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    """Translate text between Mongolian and English"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        translation, target_lang = translate_mn_en(
            request.text,
            request.source_lang,
            max_new_tokens=request.max_new_tokens,
            temperature=request.temperature,
        )
        
        return TranslationResponse(
            translation=translation,
            source=request.text,
            target_lang=target_lang,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")


@app.post("/translate/mn-to-en")
async def translate_mn_to_en(text: str, max_tokens: int = 256):
    """Quick endpoint for Mongolian to English"""
    return await translate(TranslationRequest(text=text, source_lang="mn", max_new_tokens=max_tokens))


@app.post("/translate/en-to-mn")
async def translate_en_to_mn(text: str, max_tokens: int = 256):
    """Quick endpoint for English to Mongolian"""
    return await translate(TranslationRequest(text=text, source_lang="en", max_new_tokens=max_tokens))


def main():
    """CLI interface for translation"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Mongolian-English Translation")
    parser.add_argument("--model", type=str, required=True, help="Path to trained model")
    parser.add_argument("--text", type=str, help="Text to translate")
    parser.add_argument("--source", type=str, default="mn", choices=["mn", "en"], help="Source language")
    parser.add_argument("--serve", action="store_true", help="Start API server")
    parser.add_argument("--port", type=int, default=8000, help="Port for API server")
    
    args = parser.parse_args()
    
    # Load model
    load_model(args.model)
    
    if args.serve:
        # Start API server
        import uvicorn
        print(f"Starting API server on port {args.port}")
        uvicorn.run(app, host="0.0.0.0", port=args.port)
    elif args.text:
        # Single translation
        translation, target = translate_mn_en(args.text, args.source)
        print(f"\nSource ({args.source}): {args.text}")
        print(f"Translation ({target}): {translation}")
    else:
        # Interactive mode
        print("\n=== Mongolian-English Translator ===")
        print("Commands: 'quit' to exit, 'mn' or 'en' to switch direction")
        
        direction = "mn"
        while True:
            user_input = input(f"\n[{direction.upper()}] > ")
            
            if user_input.lower() == 'quit':
                break
            elif user_input.lower() in ['mn', 'en']:
                direction = user_input.lower()
                print(f"Switched to {direction.upper()}-to-{'EN' if direction == 'mn' else 'MN'} mode")
                continue
            
            if not user_input.strip():
                continue
            
            try:
                translation, target = translate_mn_en(user_input, direction)
                print(f"[{target.upper()}] {translation}")
            except Exception as e:
                print(f"Error: {e}")


if __name__ == "__main__":
    main()
