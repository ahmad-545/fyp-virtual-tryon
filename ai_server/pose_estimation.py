"""
═══════════════════════════════════════════════════════
PIPELINE B — STEP 4: POSE ESTIMATION
═══════════════════════════════════════════════════════
Maps body pose/orientation using MediaPipe Pose.

Detects 33 body keypoints (shoulders, elbows, wrists,
hips, knees, ankles, etc.) and generates:
  - Keypoint coordinates dictionary
  - Visual pose map overlay image

This is a lightweight alternative to DensePose (which
requires Detectron2 + heavy GPU setup).
"""

import numpy as np
from PIL import Image, ImageDraw
import mediapipe as mp

# ── MediaPipe Pose setup ────────────────────────────
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# ── Keypoint names for the 33 MediaPipe landmarks ───
POSE_LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer",
    "right_eye_inner", "right_eye", "right_eye_outer",
    "left_ear", "right_ear",
    "mouth_left", "mouth_right",
    "left_shoulder", "right_shoulder",
    "left_elbow", "right_elbow",
    "left_wrist", "right_wrist",
    "left_pinky", "right_pinky",
    "left_index", "right_index",
    "left_thumb", "right_thumb",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
    "left_heel", "right_heel",
    "left_foot_index", "right_foot_index",
]

# ── Skeleton connections for drawing ────────────────
SKELETON_CONNECTIONS = [
    # Torso
    ("left_shoulder", "right_shoulder"),
    ("left_shoulder", "left_hip"),
    ("right_shoulder", "right_hip"),
    ("left_hip", "right_hip"),
    # Left arm
    ("left_shoulder", "left_elbow"),
    ("left_elbow", "left_wrist"),
    # Right arm
    ("right_shoulder", "right_elbow"),
    ("right_elbow", "right_wrist"),
    # Left leg
    ("left_hip", "left_knee"),
    ("left_knee", "left_ankle"),
    # Right leg
    ("right_hip", "right_knee"),
    ("right_knee", "right_ankle"),
]

# ── Color scheme for pose map ───────────────────────
LIMB_COLORS = {
    "torso": (0, 255, 128),       # Green
    "left_arm": (255, 100, 100),  # Red
    "right_arm": (100, 100, 255), # Blue
    "left_leg": (255, 200, 50),   # Yellow
    "right_leg": (200, 50, 255),  # Purple
}

KEYPOINT_COLOR = (255, 255, 255)  # White dots
KEYPOINT_RADIUS = 4


def _get_limb_color(name_a: str, name_b: str) -> tuple:
    """Determine limb color based on connection names."""
    joint = f"{name_a}_{name_b}"
    if "shoulder" in joint and "hip" not in joint and "elbow" not in joint:
        return LIMB_COLORS["torso"]
    if "left_shoulder" in name_a and "left_hip" in name_b:
        return LIMB_COLORS["torso"]
    if "right_shoulder" in name_a and "right_hip" in name_b:
        return LIMB_COLORS["torso"]
    if "left_hip" in name_a and "right_hip" in name_b:
        return LIMB_COLORS["torso"]
    if "left" in name_a and ("elbow" in joint or "wrist" in joint) and "leg" not in joint:
        return LIMB_COLORS["left_arm"]
    if "right" in name_a and ("elbow" in joint or "wrist" in joint) and "leg" not in joint:
        return LIMB_COLORS["right_arm"]
    if "left" in name_a and ("knee" in joint or "ankle" in joint):
        return LIMB_COLORS["left_leg"]
    if "right" in name_a and ("knee" in joint or "ankle" in joint):
        return LIMB_COLORS["right_leg"]
    return LIMB_COLORS["torso"]


def run_pose_estimation(image: Image.Image) -> tuple:
    """
    Run MediaPipe Pose on a PIL Image.

    Args:
        image: PIL RGB Image of the user

    Returns:
        tuple: (pose_map_image: PIL.Image, keypoints: dict)
            - pose_map_image: Black canvas with skeleton overlay
            - keypoints: dict of {landmark_name: (x_px, y_px, visibility)}
    """
    img_array = np.array(image)
    h, w = img_array.shape[:2]

    print(f"[POSE] Running MediaPipe Pose on {w}x{h} image...")

    # Run MediaPipe Pose detection
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,          # Most accurate model
        enable_segmentation=False,
        min_detection_confidence=0.5,
    ) as pose:
        results = pose.process(img_array)

    if not results.pose_landmarks:
        print("[POSE] WARNING: No pose detected in image!")
        # Return blank pose map if no pose found
        blank = Image.new("RGB", (w, h), (0, 0, 0))
        return blank, {}

    # Extract keypoints as pixel coordinates
    keypoints = {}
    landmarks = results.pose_landmarks.landmark

    for idx, lm in enumerate(landmarks):
        if idx < len(POSE_LANDMARK_NAMES):
            name = POSE_LANDMARK_NAMES[idx]
            px = int(lm.x * w)
            py = int(lm.y * h)
            keypoints[name] = (px, py, round(lm.visibility, 3))

    detected_count = sum(1 for _, _, v in keypoints.values() if v > 0.5)
    print(f"[POSE] Detected {detected_count}/{len(keypoints)} keypoints with high confidence")

    # ── Generate pose map image (black background + skeleton) ──
    pose_map = Image.new("RGB", (w, h), (0, 0, 0))
    draw = ImageDraw.Draw(pose_map)

    # Draw skeleton connections
    for name_a, name_b in SKELETON_CONNECTIONS:
        if name_a in keypoints and name_b in keypoints:
            xa, ya, va = keypoints[name_a]
            xb, yb, vb = keypoints[name_b]
            # Only draw if both keypoints are reasonably visible
            if va > 0.3 and vb > 0.3:
                color = _get_limb_color(name_a, name_b)
                draw.line([(xa, ya), (xb, yb)], fill=color, width=3)

    # Draw keypoints
    important_keypoints = [
        "left_shoulder", "right_shoulder",
        "left_elbow", "right_elbow",
        "left_wrist", "right_wrist",
        "left_hip", "right_hip",
        "left_knee", "right_knee",
        "left_ankle", "right_ankle",
    ]

    for name in important_keypoints:
        if name in keypoints:
            px, py, vis = keypoints[name]
            if vis > 0.3:
                draw.ellipse(
                    [px - KEYPOINT_RADIUS, py - KEYPOINT_RADIUS,
                     px + KEYPOINT_RADIUS, py + KEYPOINT_RADIUS],
                    fill=KEYPOINT_COLOR,
                    outline=(200, 200, 200),
                )

    print("[POSE] Pose map generated successfully")
    return pose_map, keypoints
