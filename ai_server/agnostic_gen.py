"""
═══════════════════════════════════════════════════════
PIPELINE B — STEP 5: AGNOSTIC MASK + POSE MAP GENERATION
═══════════════════════════════════════════════════════
Generates:
  1. Agnostic Image — user photo with clothing region erased (filled with
     neutral gray), preserving face, hair, hands, legs
  2. Agnostic Mask — binary mask showing WHERE the new garment should be placed
  3. Pose Map — skeleton overlay (from pose_estimation.py)

These outputs define the "canvas" for virtual try-on synthesis:
  - The agnostic mask tells the model WHERE to paint the garment
  - The pose map tells the model HOW to orient/deform the garment
"""

import numpy as np
from PIL import Image, ImageFilter
from io import BytesIO
import cloudinary
import cloudinary.uploader

from human_parsing import ATR_LABELS


# ── Labels that represent CLOTHING to be REMOVED ────
CLOTHING_LABEL_INDICES = set()
for i, label in enumerate(ATR_LABELS):
    if label in ("Upper-clothes", "Dress", "Scarf", "Belt"):
        CLOTHING_LABEL_INDICES.add(i)

# ── Labels to PRESERVE (not erase) ──────────────────
PRESERVE_LABELS = {"Background", "Hat", "Hair", "Sunglasses", "Face",
                   "Left-shoe", "Right-shoe", "Pants", "Skirt",
                   "Left-leg", "Right-leg", "Bag"}

# Neutral fill color for erased clothing region
AGNOSTIC_FILL_COLOR = (192, 192, 192)  # Light gray


def generate_agnostic_mask(label_map: np.ndarray) -> Image.Image:
    """
    Generate a binary mask indicating WHERE the new garment should be placed.

    White (255) = garment placement zone (clothing region)
    Black (0)   = keep original (face, hair, legs, background)

    Args:
        label_map: 2D numpy array of SCHP label indices (H x W)

    Returns:
        PIL Image (mode "L") — binary mask
    """
    h, w = label_map.shape
    mask = np.zeros((h, w), dtype=np.uint8)

    for label_idx in CLOTHING_LABEL_INDICES:
        mask[label_map == label_idx] = 255

    # Also include arm regions in the mask (they overlap with clothing)
    left_arm_idx = ATR_LABELS.index("Left-arm")
    right_arm_idx = ATR_LABELS.index("Right-arm")
    mask[label_map == left_arm_idx] = 255
    mask[label_map == right_arm_idx] = 255

    mask_image = Image.fromarray(mask, mode="L")

    # Slight dilation to ensure full coverage (prevents edge artifacts)
    mask_image = mask_image.filter(ImageFilter.MaxFilter(size=5))

    print(f"[AGNOSTIC] Mask generated: {w}x{h}, clothing pixels: {np.sum(mask > 0)}")
    return mask_image


def generate_agnostic_image(
    user_image: Image.Image,
    label_map: np.ndarray,
) -> Image.Image:
    """
    Generate the "agnostic" user image — clothing region erased and
    filled with neutral gray, while preserving face, hair, hands, legs.

    Args:
        user_image: Original user photo (PIL RGB)
        label_map: 2D numpy array of SCHP label indices

    Returns:
        PIL Image (RGB) — user with clothing erased
    """
    agnostic = np.array(user_image).copy()
    h, w = label_map.shape

    # Erase clothing regions
    for label_idx in CLOTHING_LABEL_INDICES:
        agnostic[label_map == label_idx] = AGNOSTIC_FILL_COLOR

    # Also erase arms (they'll be re-synthesized with the garment)
    left_arm_idx = ATR_LABELS.index("Left-arm")
    right_arm_idx = ATR_LABELS.index("Right-arm")
    agnostic[label_map == left_arm_idx] = AGNOSTIC_FILL_COLOR
    agnostic[label_map == right_arm_idx] = AGNOSTIC_FILL_COLOR

    agnostic_image = Image.fromarray(agnostic)
    print(f"[AGNOSTIC] Agnostic image generated: {w}x{h}")
    return agnostic_image


def upload_image_to_cloudinary(
    image: Image.Image,
    folder: str,
    public_id: str,
    fmt: str = "png",
) -> str:
    """
    Upload a PIL Image to Cloudinary and return the secure URL.

    Args:
        image: PIL Image to upload
        folder: Cloudinary folder name
        public_id: Unique identifier for the image
        fmt: Image format (default: png for transparency support)

    Returns:
        str: Cloudinary secure URL
    """
    buffer = BytesIO()
    image.save(buffer, format=fmt.upper())
    buffer.seek(0)

    print(f"[UPLOAD] Uploading {public_id} to Cloudinary/{folder}...")
    result = cloudinary.uploader.upload(
        buffer,
        folder=folder,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
        format=fmt,
    )
    url = result.get("secure_url") or result.get("url")
    print(f"[UPLOAD] Done: {url}")
    return url


def generate_all_agnostic_outputs(
    user_image: Image.Image,
    label_map: np.ndarray,
    parsing_mask_image: Image.Image,
    pose_map_image: Image.Image,
    session_id: str,
) -> dict:
    """
    Master function: generate all agnostic outputs and upload to Cloudinary.

    Args:
        user_image: Original user photo (PIL RGB)
        label_map: SCHP label map (numpy array)
        parsing_mask_image: Color-coded parsing visualization
        pose_map_image: Skeleton overlay pose map
        session_id: Unique session ID for naming uploads

    Returns:
        dict with keys:
            - agnostic_mask_url: Binary mask URL
            - agnostic_image_url: User with clothing erased URL
            - human_parsing_url: Color-coded segmentation URL
            - pose_map_url: Skeleton overlay URL
    """
    folder = "tryon_pipeline"

    # 1. Generate agnostic mask (binary — where garment goes)
    agnostic_mask = generate_agnostic_mask(label_map)
    agnostic_mask_url = upload_image_to_cloudinary(
        agnostic_mask, folder, f"mask_{session_id}"
    )

    # 2. Generate agnostic image (user with clothing removed)
    agnostic_image = generate_agnostic_image(user_image, label_map)
    agnostic_image_url = upload_image_to_cloudinary(
        agnostic_image, folder, f"agnostic_{session_id}"
    )

    # 3. Upload human parsing visualization
    human_parsing_url = upload_image_to_cloudinary(
        parsing_mask_image, folder, f"parsing_{session_id}"
    )

    # 4. Upload pose map
    pose_map_url = upload_image_to_cloudinary(
        pose_map_image, folder, f"pose_{session_id}"
    )

    print(f"[AGNOSTIC] All outputs generated and uploaded for session: {session_id}")

    return {
        "agnostic_mask_url": agnostic_mask_url,
        "agnostic_image_url": agnostic_image_url,
        "human_parsing_url": human_parsing_url,
        "pose_map_url": pose_map_url,
    }
