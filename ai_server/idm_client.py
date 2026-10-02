"""
═══════════════════════════════════════════════════════
PIPELINE B — STEP 5: IDM-VTON GPU WORKER CLIENT  (v2, polling)
═══════════════════════════════════════════════════════
Talks to the IDM-VTON worker running on Kaggle (CELL 4).

WHY POLLING
-----------
Free cloudflared tunnels close any request held open longer than ~100
seconds, and generation takes ~150s. The old single-request design hit
that limit every time and got HTTP 524 back even though the image had
been produced.

Now: submit the job, get a job_id, then poll every few seconds. Each
request finishes in well under a second, so the tunnel limit never
applies regardless of how slow the GPU is.

Public API is unchanged:
    get_gpu_worker_status() -> dict
    generate_tryon(...)     -> dict with result_url / engine / ...

main.py and models.py do NOT need to change.
"""

import os
import time
import uuid
import random
from typing import Optional, Dict, Any

import requests
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

DEFAULT_KEY = "trylo-fyp-change-me-2026"

# Each individual HTTP call is tiny now, so these can be short.
SUBMIT_TIMEOUT = 60
POLL_TIMEOUT = 30
POLL_INTERVAL = 3.0


def _worker_url() -> str:
    return os.getenv("GPU_WORKER_URL", "").strip().rstrip("/")


def _api_key() -> str:
    return os.getenv("GPU_WORKER_KEY", DEFAULT_KEY).strip()


def _total_budget() -> int:
    """Overall seconds to wait for a job before giving up."""
    return int(os.getenv("GPU_WORKER_TIMEOUT", "600"))


def _headers() -> Dict[str, str]:
    # Header name MUST match what Kaggle CELL 4 checks.
    return {"X-API-Key": _api_key(), "Content-Type": "application/json"}


def _upload_b64(b64: Optional[str], folder: str, public_id: str, fmt: str = "png") -> Optional[str]:
    """Push a base64 image to Cloudinary. Returns None on failure."""
    if not b64:
        return None
    try:
        mime = "jpeg" if fmt in ("jpg", "jpeg") else "png"
        result = cloudinary.uploader.upload(
            f"data:image/{mime};base64,{b64}",
            folder=folder,
            public_id=public_id,
            overwrite=True,
            resource_type="image",
        )
        url = result.get("secure_url") or result.get("url")
        print(f"[IDM-CLIENT] Uploaded {public_id} -> {url}")
        return url
    except Exception as e:
        print(f"[IDM-CLIENT] [WARNING] Cloudinary upload failed for {public_id}: {e}")
        return None


def _fallback(caption: str, elapsed: float, message: str) -> Dict[str, Any]:
    return {
        "result_url": None,
        "engine": "agnostic-fallback",
        "densepose_url": None,
        "idm_mask_url": None,
        "garment_caption": caption,
        "elapsed_sec": elapsed,
        "status": "degraded",
        "message": message,
    }


# ───────────────────────────────────────────────────────────────
# HEALTH
# ───────────────────────────────────────────────────────────────

def get_gpu_worker_status() -> Dict[str, Any]:
    worker_url = _worker_url()
    if not worker_url:
        return {
            "online": False,
            "status": "offline",
            "message": "GPU_WORKER_URL is not configured in ai_server/.env",
            "worker_url": None,
        }
    try:
        resp = requests.get(f"{worker_url}/health", headers=_headers(), timeout=15)
        if resp.status_code == 200:
            return {
                "online": True,
                "status": "online",
                "message": "GPU worker is active and reachable",
                "worker_url": worker_url,
                "details": resp.json(),
            }
        return {
            "online": False,
            "status": "unhealthy",
            "message": f"GPU worker returned HTTP {resp.status_code}",
            "worker_url": worker_url,
        }
    except Exception as e:
        return {
            "online": False,
            "status": "offline",
            "message": f"Failed to reach GPU worker: {e}",
            "worker_url": worker_url,
        }


# ───────────────────────────────────────────────────────────────
# CAPTION
# ───────────────────────────────────────────────────────────────

def build_caption(
    product_name: Optional[str] = None,
    description: Optional[str] = None,
    subcategory: Optional[str] = None,
    style_type: Optional[str] = None,
    product_category: Optional[str] = None,
) -> str:
    """Build the garment prompt from catalog fields instead of BLIP."""
    gender = {"men": "men's", "women": "women's", "kids": "kids"}.get(
        (product_category or "").lower(), ""
    )
    parts = [p for p in [gender, (style_type or "").lower(), subcategory, product_name] if p]
    caption = ", ".join(dict.fromkeys(parts))

    if description:
        short = description.strip().split(".")[0][:120]
        if short:
            caption = f"{caption}, {short}" if caption else short

    return caption or "a piece of clothing"


# ───────────────────────────────────────────────────────────────
# GENERATION
# ───────────────────────────────────────────────────────────────

def generate_tryon(
    user_photo_url: str,
    clean_garment_url: str,
    garment_caption: Optional[str] = None,
    category: Optional[str] = "upper_body",
    steps: Optional[int] = 20,
    guidance_scale: Optional[float] = 2.0,
    seed: Optional[int] = -1,
    product_name: Optional[str] = None,
    description: Optional[str] = None,
    subcategory: Optional[str] = None,
    style_type: Optional[str] = None,
    product_category: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Submit a try-on job to the worker, poll until it finishes, upload the
    result to Cloudinary and return URLs.

    Never raises. On any failure returns engine="agnostic-fallback".
    """
    started = time.time()
    session_id = uuid.uuid4().hex[:12]

    if not garment_caption:
        garment_caption = build_caption(
            product_name=product_name,
            description=description,
            subcategory=subcategory,
            style_type=style_type,
            product_category=product_category,
        )

    worker_url = _worker_url()
    if not worker_url:
        print("[IDM-CLIENT] GPU_WORKER_URL not configured. Using agnostic preview fallback.")
        return _fallback(garment_caption, round(time.time() - started, 2),
                         "GPU worker URL not configured. Returned agnostic preview.")

    resolved_seed = random.randint(0, 2**31 - 1) if (seed is None or seed < 0) else int(seed)

    # Field names MUST match the TryOnJob model in Kaggle CELL 4.
    payload = {
        "human_image_url": str(user_photo_url),
        "garment_image_url": str(clean_garment_url),
        "garment_description": garment_caption,
        "category": category or "upper_body",
        "steps": int(steps or 20),
        "guidance_scale": float(guidance_scale or 2.0),
        "seed": resolved_seed,
        "crop": True,
        "return_intermediates": False,
    }

    print(f"[IDM-CLIENT] POST {worker_url}/tryon")
    print(f"[IDM-CLIENT] category={payload['category']} steps={payload['steps']} seed={resolved_seed}")
    print(f"[IDM-CLIENT] caption: {garment_caption}")

    # ── 1. submit ───────────────────────────────────────────────
    try:
        resp = requests.post(f"{worker_url}/tryon", json=payload,
                             headers=_headers(), timeout=SUBMIT_TIMEOUT)
    except Exception as err:
        return _fallback(garment_caption, round(time.time() - started, 2),
                         f"GPU worker connection failed: {err}")

    if resp.status_code != 200:
        hint = ""
        if resp.status_code == 401:
            hint = " (GPU_WORKER_KEY does not match API_KEY in Kaggle CELL 4)"
        elif resp.status_code == 404:
            hint = " (worker is running the OLD CELL 4 — paste the async version)"
        elif resp.status_code == 422:
            hint = " (payload mismatch — CELL 3/4 on Kaggle are out of date)"
        print(f"[IDM-CLIENT] [WARNING] submit failed HTTP {resp.status_code}{hint}")
        return _fallback(garment_caption, round(time.time() - started, 2),
                         f"GPU worker error {resp.status_code}{hint}.")

    job_id = resp.json().get("job_id")
    if not job_id:
        return _fallback(garment_caption, round(time.time() - started, 2),
                         "Worker did not return a job_id (old CELL 4 still running?).")

    print(f"[IDM-CLIENT] job {job_id} queued, polling every {POLL_INTERVAL:.0f}s...")

    # ── 2. poll ─────────────────────────────────────────────────
    budget = _total_budget()
    deadline = started + budget
    data = None
    misses = 0
    last_stage = None

    while time.time() < deadline:
        time.sleep(POLL_INTERVAL)
        try:
            r = requests.get(f"{worker_url}/job/{job_id}",
                             headers=_headers(), timeout=POLL_TIMEOUT)
        except Exception as e:
            # A dropped poll is not fatal; the job keeps running on Kaggle.
            misses += 1
            if misses >= 10:
                return _fallback(garment_caption, round(time.time() - started, 2),
                                 f"Lost contact with GPU worker while polling: {e}")
            continue

        misses = 0

        if r.status_code == 404:
            return _fallback(garment_caption, round(time.time() - started, 2),
                             "Worker forgot the job (kernel restarted mid-generation?).")
        if r.status_code != 200:
            continue

        body = r.json()
        state = body.get("status")

        if state in ("queued", "running"):
            stage = body.get("stage")
            if stage != last_stage:
                print(f"[IDM-CLIENT] job {job_id}: {stage}")
                last_stage = stage
            continue

        if state == "error":
            detail = body.get("detail", "unknown")
            print(f"[IDM-CLIENT] [WARNING] worker error: {detail}")
            return _fallback(garment_caption, round(time.time() - started, 2),
                             f"GPU worker failed: {detail}")

        if state == "success":
            data = body
            break

    if data is None:
        return _fallback(garment_caption, round(time.time() - started, 2),
                         f"Job did not finish within {budget}s. Raise GPU_WORKER_TIMEOUT.")

    # ── 3. upload ───────────────────────────────────────────────
    result_url = _upload_b64(data.get("result_b64"), "tryon_results",
                             f"tryon_{session_id}", fmt=data.get("result_format", "png"))
    if not result_url:
        return _fallback(garment_caption, round(time.time() - started, 2),
                         "Try-on generated but Cloudinary upload failed.")

    densepose_url = _upload_b64(data.get("densepose_b64"), "tryon_pipeline", f"densepose_{session_id}")
    idm_mask_url = _upload_b64(data.get("mask_b64"), "tryon_pipeline", f"idmmask_{session_id}")

    elapsed = round(time.time() - started, 2)
    gpu_time = data.get("elapsed_sec")
    print(f"[IDM-CLIENT] Success — GPU {gpu_time}s, total {elapsed}s")

    return {
        "result_url": result_url,
        "engine": "idm-vton",
        "densepose_url": densepose_url,
        "idm_mask_url": idm_mask_url,
        "garment_caption": garment_caption,
        "elapsed_sec": gpu_time if gpu_time is not None else elapsed,
        "status": "success",
        "message": "IDM-VTON synthesis completed successfully",
    }