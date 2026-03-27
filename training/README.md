# Mongolian-English Translation LoRA Training

Fine-tune Llama 3.2 on Mongolian-English translation using LoRA and NVIDIA GPU Cloud.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Prepare Dataset

Place your Mongolian-English parallel corpus in `data/`:

```jsonl
// data/mn-en-parallel.jsonl
{"mn": "Сайн уу", "en": "Hello"}
{"mn": "Баярлалаа", "en": "Thank you"}
```

Or generate sample data:

```bash
python dataset.py
```

### 3. Train

```bash
python train_lora.py \
    --dataset data/mn-en-parallel.jsonl \
    --output outputs/lora-run-1 \
    --epochs 3 \
    --r 16
```

### 4. Inference

```bash
# Interactive mode
python inference.py --model outputs/lora-run-1/final --text "Сайн уу"

# API server
python inference.py --model outputs/lora-run-1/final --serve --port 8000
```

## NVIDIA Cloud Deployment

### Generate Scripts

```bash
python deploy_nvidia.py --generate-scripts --estimate-costs
```

### Deploy to NVIDIA Cloud

1. Spin up GPU instance (A100/H100 recommended)
2. Upload `scripts/nvidia_startup.sh`
3. Run: `./nvidia_startup.sh`
4. Run training: `./run_training.sh`

## Configuration

### LoRA Config

- **Rank (r):** 16 (increase for better quality, slower training)
- **Alpha:** 32
- **Dropout:** 0.05
- **Target Modules:** q_proj, v_proj, k_proj, o_proj, gate_proj, up_proj, down_proj

### Training Config

- **Epochs:** 3
- **Batch Size:** 4
- **Gradient Accumulation:** 4
- **Learning Rate:** 2e-4
- **Max Sequence Length:** 512

## API Endpoints

When running inference server:

```bash
# Health check
curl http://localhost:8000/health

# Translate
curl -X POST http://localhost:8000/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Сайн уу", "source_lang": "mn"}'

# Quick translate (MN -> EN)
curl -X POST "http://localhost:8000/translate/mn-to-en?text=Сайн%20уу"
```

## Project Structure

```
training/
├── requirements.txt          # Dependencies
├── dataset.py               # Dataset loading and preprocessing
├── train_lora.py            # Main training script
├── inference.py             # Inference API
├── deploy_nvidia.py         # NVIDIA cloud deployment helper
├── data/                    # Dataset storage
├── outputs/                 # Model checkpoints
└── scripts/                 # Deployment scripts
```

## Monitoring

Training logs to Weights & Biases. View at:
https://wandb.ai/your-username/mongolian-translation-lora

## License

MIT - See LICENSE in parent directory.

## Credits

- Base model: unsloth/llama-3.2-1b-instruct
- Training: Hugging Face PEFT, TRL
- GPU: NVIDIA Inception Program
