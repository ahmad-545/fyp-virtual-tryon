"""
═══════════════════════════════════════════════════════
PIPELINE B — STEP 3: HUMAN PARSING (SCHP)
═══════════════════════════════════════════════════════
Segments the user's body into semantic regions:
  - Arms, torso, legs, face, hair, shoes, etc.

Uses SegFormer (mattmdjaga/segformer_b2_clothes) pre-trained
on ATR dataset for robust clothing segmentation.

Output: Color-coded segmentation mask (PIL Image) + raw label map
"""

import numpy as np
from PIL import Image
from io import BytesIO
import requests
import torch
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation

# ── ATR Label Map (18 classes) ──────────────────────
ATR_LABELS = [
    "Background",     # 0
    "Hat",             # 1
    "Hair",            # 2
    "Sunglasses",      # 3
    "Upper-clothes",   # 4
    "Skirt",           # 5
    "Pants",           # 6
    "Dress",           # 7
    "Belt",            # 8
    "Left-shoe",       # 9
    "Right-shoe",      # 10
    "Face",            # 11
    "Left-leg",        # 12
    "Right-leg",       # 13
    "Left-arm",        # 14
    "Right-arm",       # 15
    "Bag",             # 16
    "Scarf",           # 17
]

# ── Color palette for visualization (RGB) ───────────
ATR_PALETTE = np.array([
    [0,   0,   0],     # 0  Background     — Black
    [128, 0,   0],     # 1  Hat             — Maroon
    [255, 255, 0],     # 2  Hair            — Yellow
    [128, 128, 0],     # 3  Sunglasses      — Olive
    [0,   128, 0],     # 4  Upper-clothes   — Green
    [128, 0,   128],   # 5  Skirt           — Purple
    [0,   128, 128],   # 6  Pants           — Teal
    [0,   0,   128],   # 7  Dress           — Navy
    [64,  0,   0],     # 8  Belt            — Dark Red
    [192, 0,   0],     # 9  Left-shoe       — Red
    [64,  128, 0],     # 10 Right-shoe      — Olive Green
    [255, 200, 180],   # 11 Face            — Skin
    [0,   0,   192],   # 12 Left-leg        — Blue
    [128, 128, 192],   # 13 Right-leg       — Light Blue
    [0,   64,  128],   # 14 Left-arm        — Dark Cyan
    [128, 64,  128],   # 15 Right-arm       — Mauve
    [64,  64,  0],     # 16 Bag             — Dark Olive
    [255, 128, 0],     # 17 Scarf           — Orange
], dtype=np.uint8)

# ── Global model cache (lazy loaded) ───────────────
_processor = None
_model = None
_device = None


def _load_model():
    """Lazy-load SegFormer model on first call. Cached for subsequent requests."""
    global _processor, _model, _device

    if _model is not None:
        return

    print("[SCHP] Loading SegFormer B2 Clothes model...")
    model_name = "mattmdjaga/segformer_b2_clothes"

    _processor = SegformerImageProcessor.from_pretrained(model_name)
    _model = SegformerForSemanticSegmentation.from_pretrained(model_name)

    # Use GPU if available, else CPU
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _model = _model.to(_device)
    _model.eval()

    print(f"[SCHP] Model loaded on device: {_device}")


def download_image(url: str) -> Image.Image:
    """Download image from URL and return as PIL RGB Image."""
    print(f"[SCHP] Downloading image from: {url[:80]}...")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content)).convert("RGB")
    print(f"[SCHP] Image downloaded: {img.size[0]}x{img.size[1]}")
    return img


def run_human_parsing(image: Image.Image) -> tuple:
    """
    Run SCHP human parsing on a PIL Image.

    Args:
        image: PIL RGB Image of the user

    Returns:
        tuple: (colored_mask_image: PIL.Image, label_map: np.ndarray)
            - colored_mask_image: Color-coded segmentation visualization
            - label_map: 2D numpy array of label indices (H x W)
    """
    _load_model()

    original_size = image.size  # (W, H)
    print(f"[SCHP] Running segmentation on {original_size[0]}x{original_size[1]} image...")

    # Preprocess
    inputs = _processor(images=image, return_tensors="pt").to(_device)

    # Inference
    with torch.no_grad():
        outputs = _model(**inputs)

    # Post-process: resize logits to original image size
    logits = outputs.logits  # (1, num_classes, H/4, W/4)
    upsampled = torch.nn.functional.interpolate(
        logits,
        size=(original_size[1], original_size[0]),  # (H, W)
        mode="bilinear",
        align_corners=False,
    )

    # Get label map (argmax over classes)
    label_map = upsampled.argmax(dim=1).squeeze().cpu().numpy().astype(np.uint8)

    # Generate color-coded visualization
    colored_mask = ATR_PALETTE[label_map]
    colored_mask_image = Image.fromarray(colored_mask)

    # Log detected regions
    unique_labels = np.unique(label_map)
    detected = [ATR_LABELS[l] for l in unique_labels if l < len(ATR_LABELS)]
    print(f"[SCHP] Detected regions: {', '.join(detected)}")

    return colored_mask_image, label_map
