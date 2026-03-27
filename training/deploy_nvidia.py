"""
NVIDIA Cloud Deployment Helper
Automates GPU instance setup for training
"""

import os
import subprocess
import argparse
from pathlib import Path


# NVIDIA Cloud configuration (placeholder - update with actual API)
NVIDIA_CLOUD_CONFIG = {
    "instance_type": "g5.xlarge",  # or NVIDIA-specific GPU instance
    "gpu": "A100",  # or H100, A10G, etc.
    "region": "us-west-2",
    "ssh_key": "~/.ssh/nvidia-cloud",
    "user": "ubuntu",
}


def setup_nvidia_environment():
    """Setup steps for NVIDIA cloud instance"""
    commands = [
        # System updates
        "sudo apt update && sudo apt upgrade -y",
        
        # Install NVIDIA drivers and CUDA
        "sudo apt install -y nvidia-driver-535 nvidia-cuda-toolkit",
        
        # Install Python and pip
        "sudo apt install -y python3 python3-pip python3-venv",
        
        # Install git
        "sudo apt install -y git",
        
        # Clone repo (manual step)
        # "git clone https://github.com/Bouncyknighter/mongolian-translation-ai.git",
        
        # Setup Python environment
        "cd mongolian-translation-ai/training && python3 -m venv venv",
        "source venv/bin/activate && pip install -r requirements.txt",
        
        # Install Flash Attention (for faster training)
        "pip install flash-attn --no-build-isolation",
        
        # Verify GPU
        "nvidia-smi",
        
        # Start training
        # "python train_lora.py --dataset data/your_dataset.jsonl --output outputs/lora-run-1",
    ]
    
    return commands


def generate_startup_script(output_path: str = "./scripts/nvidia_startup.sh"):
    """Generate startup script for NVIDIA cloud instance"""
    
    script = """#!/bin/bash
# NVIDIA Cloud Startup Script for Mongolian Translation LoRA Training
# Run this on a fresh NVIDIA GPU instance

set -e

echo "=== Setting up NVIDIA GPU Environment ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install NVIDIA drivers (if not already installed)
if ! command -v nvidia-smi &> /dev/null; then
    echo "Installing NVIDIA drivers..."
    sudo apt install -y nvidia-driver-535
    sudo reboot  # Reboot required after driver install
fi

# Install CUDA
sudo apt install -y nvidia-cuda-toolkit

# Install Python dependencies
sudo apt install -y python3 python3-pip python3-venv git

# Create working directory
mkdir -p ~/training-workspace
cd ~/training-workspace

# Clone repository (update with your repo)
if [ ! -d "mongolian-translation-ai" ]; then
    git clone https://github.com/Bouncyknighter/mongolian-translation-ai.git
fi

cd mongolian-translation-ai/training

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate

# Install PyTorch with CUDA support
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Install other requirements
pip install -r requirements.txt

# Install Flash Attention for speedup (optional, may take time)
# pip install flash-attn --no-build-isolation

# Verify installation
echo "=== Verification ==="
nvidia-smi
python3 -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA version: {torch.version.cuda}')"

echo "=== Setup Complete ==="
echo "To start training:"
echo "  cd ~/training-workspace/mongolian-translation-ai/training"
echo "  source venv/bin/activate"
echo "  python3 train_lora.py --dataset data/your_dataset.jsonl"
"""
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(script)
    
    # Make executable
    os.chmod(output_path, 0o755)
    
    print(f"✅ Startup script created: {output_path}")
    return output_path


def generate_training_script(
    dataset_url: str = None,
    output_dir: str = "./outputs/lora-run-$(date +%Y%m%d-%H%M%S)",
    wandb_key: str = None
) -> str:
    """Generate training execution script"""
    
    script = f"""#!/bin/bash
# Training execution script for NVIDIA Cloud

set -e

# Configuration
DATASET_URL="{dataset_url or 'https://your-dataset-url.com/mn-en-parallel.jsonl'}"
OUTPUT_DIR="{output_dir}"
WANDB_KEY="{wandb_key or '$WANDB_API_KEY'}"

echo "=== Starting LoRA Training ==="
echo "Output: $OUTPUT_DIR"

# Download dataset if URL provided
if [ -n "$DATASET_URL" ]; then
    echo "Downloading dataset..."
    mkdir -p data
    curl -L "$DATASET_URL" -o data/mn-en-parallel.jsonl
fi

# Set W&B key
if [ -n "$WANDB_KEY" ]; then
    export WANDB_API_KEY="$WANDB_KEY"
fi

# Run training
python3 train_lora.py \\
    --dataset data/mn-en-parallel.jsonl \\
    --output "$OUTPUT_DIR" \\
    --epochs 3 \\
    --r 16 \\
    --alpha 32 \\
    --batch-size 4

# Upload results to S3 (optional)
# aws s3 sync "$OUTPUT_DIR" s3://your-bucket/lora-results/

echo "=== Training Complete ==="
echo "Results saved to: $OUTPUT_DIR"
"""
    
    output_path = "./scripts/run_training.sh"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(script)
    os.chmod(output_path, 0o755)
    
    print(f"✅ Training script created: {output_path}")
    return output_path


def estimate_costs():
    """Estimate training costs on various NVIDIA platforms"""
    
    configs = [
        {
            "platform": "NVIDIA Cloud (A100 40GB)",
            "hourly_rate": 2.50,  # Approximate, update with actual
            "training_hours": 4,  # For small dataset
            "estimated_cost": 10.00,
        },
        {
            "platform": "AWS g5.xlarge (A10G)",
            "hourly_rate": 1.20,
            "training_hours": 6,
            "estimated_cost": 7.20,
        },
        {
            "platform": "RunPod GPU Cloud (A40)",
            "hourly_rate": 0.70,
            "training_hours": 5,
            "estimated_cost": 3.50,
        },
    ]
    
    print("\n=== Training Cost Estimates ===")
    print(f"{'Platform':<35} {'Hourly':<10} {'Hours':<8} {'Total':<10}")
    print("-" * 65)
    for cfg in configs:
        print(f"{cfg['platform']:<35} ${cfg['hourly_rate']:<9.2f} {cfg['training_hours']:<8} ${cfg['estimated_cost']:<10.2f}")
    
    print("\nNote: Actual costs may vary based on dataset size and training duration.")
    print("NVIDIA Inception credits should cover these costs.")


def main():
    parser = argparse.ArgumentParser(description="NVIDIA Cloud Deployment Helper")
    parser.add_argument("--generate-scripts", action="store_true", help="Generate deployment scripts")
    parser.add_argument("--estimate-costs", action="store_true", help="Show cost estimates")
    parser.add_argument("--dataset-url", type=str, help="URL to download dataset")
    parser.add_argument("--wandb-key", type=str, help="Weights & Biases API key")
    
    args = parser.parse_args()
    
    if args.generate_scripts:
        startup = generate_startup_script()
        training = generate_training_script(args.dataset_url, wandb_key=args.wandb_key)
        print(f"\nGenerated scripts:")
        print(f"  - {startup}")
        print(f"  - {training}")
        print("\nUpload these to your NVIDIA Cloud instance and run:")
        print("  ./scripts/nvidia_startup.sh")
    
    if args.estimate_costs:
        estimate_costs()
    
    if not any([args.generate_scripts, args.estimate_costs]):
        parser.print_help()


if __name__ == "__main__":
    main()
