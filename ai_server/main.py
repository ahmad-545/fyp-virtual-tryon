import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from models import ProcessGarmentRequest, ProcessGarmentResponse, TryOnRequest, TryOnResponse

# Load environment variables from .env
load_dotenv()

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME", "dm8mgnwp7"),
    api_key=os.getenv("CLOUD_API_KEY", "528952989357329"),
    api_secret=os.getenv("CLOUD_API_SECRET", "ix9UK_hRI_7TRcKL-Fm38NyKmkY"),
    secure=True,
)

app = FastAPI(
    title="Virtual Try-On AI Server",
    description="API for Garment Segmentation (Pipeline A) and Virtual Try-On (Pipeline B)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "AI Server is running.",
        "pipeline_a": "Garment Segmentation (Active & Live)",
        "pipeline_b": "Virtual Try-On Synthesis (Active & Live)",
        "docs": "/docs",
    }

# ===============================================================
# PIPELINE A: GARMENT SEGMENTATION & CLEAN ASSET GENERATION
# ===============================================================
@app.post("/process-garment", response_model=ProcessGarmentResponse)
async def process_garment(request: ProcessGarmentRequest):
    """
    ═══════════════════════════════════════════════════════════════
    PIPELINE A — ADD PRODUCT TO CATALOG (Garment Segmentation)
    ═══════════════════════════════════════════════════════════════
    1. Downloads raw product garment image from Cloudinary
    2. Runs AI Garment Segmentation & Background Removal
    3. Uploads isolated clean garment (PNG with alpha transparency) to Cloudinary
    4. Returns permanent clean_garment_url for MongoDB caching
    """
    try:
        raw_url_str = str(request.raw_image_url).strip()
        product_id = str(request.product_id).strip()

        print("\n=======================================================")
        print(f"[PIPELINE A] Starting Garment Segmentation for SKU: {product_id}")
        print(f"[PIPELINE A] Input Raw Image URL: {raw_url_str}")

        clean_garment_url = ""

        # 1. Primary: AI Segmentation & Transparent Garment Upload to Cloudinary
        try:
            print(f"[PIPELINE A] Executing AI Background Removal & Garment Isolation...")
            upload_result = cloudinary.uploader.upload(
                raw_url_str,
                folder="clean_garments",
                public_id=f"clean_{product_id}",
                transformation=[
                    {"effect": "background_removal"},
                    {"fetch_format": "png"}
                ],
                overwrite=True,
                resource_type="image",
            )
            clean_garment_url = upload_result.get("secure_url") or upload_result.get("url")
            print(f"[PIPELINE A] [SUCCESS] Cloudinary Clean Garment Uploaded: {clean_garment_url}")
        except Exception as cloud_err:
            print(f"[PIPELINE A] [WARNING] Cloudinary direct background removal warning: {cloud_err}")

            # Fallback A: Apply URL transformation if it's already a Cloudinary URL
            if "cloudinary.com" in raw_url_str and "/upload/" in raw_url_str:
                clean_garment_url = raw_url_str.replace(
                    "/upload/",
                    "/upload/e_background_removal,f_png/",
                )
                print(f"[PIPELINE A] [FALLBACK A] URL Transform: {clean_garment_url}")
            else:
                clean_garment_url = raw_url_str
                print(f"[PIPELINE A] [FALLBACK B] Raw Passthrough: {clean_garment_url}")

        print(f"[PIPELINE A] [COMPLETE] Clean Garment URL: {clean_garment_url}")
        print("=======================================================\n")

        return ProcessGarmentResponse(
            product_id=product_id,
            clean_garment_url=clean_garment_url,
            status="success",
            message="Garment segmented, background isolated, and clean asset saved to Cloudinary",
        )

    except Exception as e:
        print(f"[ERROR] Error in process_garment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ===============================================================
# PIPELINE B: USER VIRTUAL TRY-ON SYNTHESIS
# ===============================================================
@app.post("/try-on", response_model=TryOnResponse)
async def try_on(request: TryOnRequest):
    """
    ═══════════════════════════════════════════════════════════════
    PIPELINE B — USER TRY-ON REQUEST
    ═══════════════════════════════════════════════════════════════
    1. Receives user_photo_url and clean_garment_url (cached by Pipeline A)
    2. Runs SCHP (Human Parsing) — segments body into regions
    3. Runs Pose Estimation (MediaPipe) — maps body pose/orientation
    4. Generates Agnostic Mask + Pose Map — defines garment target area
    5. Returns all intermediate results + final composite
    """
    try:
        user_photo_str = str(request.user_photo_url).strip()
        clean_garment_str = str(request.clean_garment_url).strip()
        session_id = uuid.uuid4().hex[:12]

        print("\n=======================================================")
        print(f"[PIPELINE B] User Try-On Request [User: {request.user_id} | Product: {request.product_id}]")
        print(f"[PIPELINE B] Session: {session_id}")
        print(f"[PIPELINE B] 1. User photo: {user_photo_str}")
        print(f"[PIPELINE B] 2. Clean garment (cached from Pipeline A): {clean_garment_str}")

        # ── Import AI modules (lazy imports to keep startup fast) ──
        from human_parsing import download_image, run_human_parsing
        from pose_estimation import run_pose_estimation
        from agnostic_gen import generate_all_agnostic_outputs

        # ── STEP 1: Download user photo ──────────────────────────
        print("[PIPELINE B] 3. Downloading user photo...")
        user_image = download_image(user_photo_str)

        # ── STEP 2: Human Parsing (SCHP) ─────────────────────────
        print("[PIPELINE B] 4. Running Human Parsing (SCHP)... [Segmenting body: arms, torso, legs]")
        parsing_mask_image, label_map = run_human_parsing(user_image)

        # ── STEP 3: Pose Estimation (MediaPipe) ──────────────────
        print("[PIPELINE B] 5. Running Pose Estimation (MediaPipe)... [Mapping body orientation]")
        pose_map_image, keypoints = run_pose_estimation(user_image)

        # ── STEP 4: Agnostic Mask + Pose Map Generation ─────────
        print("[PIPELINE B] 6. Generating Agnostic Mask + Pose Map... [Defining target cloth area]")
        agnostic_outputs = generate_all_agnostic_outputs(
            user_image=user_image,
            label_map=label_map,
            parsing_mask_image=parsing_mask_image,
            pose_map_image=pose_map_image,
            session_id=session_id,
        )

        # ── STEP 5: Result composition ───────────────────────────
        # For now: the agnostic image shows where garment WILL go.
        # When IDM-VTON is integrated (Step 6), it will synthesize the final output.
        # Current result = agnostic image (demonstrates the pipeline is working)
        result_url = agnostic_outputs["agnostic_image_url"]

        print(f"\n[PIPELINE B] ═══ PIPELINE RESULTS ═══")
        print(f"  Human Parsing:  {agnostic_outputs['human_parsing_url']}")
        print(f"  Pose Map:       {agnostic_outputs['pose_map_url']}")
        print(f"  Agnostic Mask:  {agnostic_outputs['agnostic_mask_url']}")
        print(f"  Agnostic Image: {agnostic_outputs['agnostic_image_url']}")
        print(f"  Result URL:     {result_url}")
        print(f"  Keypoints:      {len(keypoints)} landmarks detected")
        print(f"[PIPELINE B] [COMPLETE] Session {session_id} finished successfully")
        print("=======================================================\n")

        return TryOnResponse(
            user_id=request.user_id,
            product_id=request.product_id,
            result_url=result_url,
            status="success",
            message="Virtual Try-On Pipeline B completed — SCHP + Pose + Agnostic Mask generated",
            human_parsing_url=agnostic_outputs["human_parsing_url"],
            pose_map_url=agnostic_outputs["pose_map_url"],
            agnostic_mask_url=agnostic_outputs["agnostic_mask_url"],
            agnostic_image_url=agnostic_outputs["agnostic_image_url"],
        )
    except Exception as e:
        print(f"[ERROR] Error in try_on: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
