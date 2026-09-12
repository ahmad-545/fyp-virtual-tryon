from fastapi import FastAPI, HTTPException
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from models import ProcessGarmentRequest, ProcessGarmentResponse, TryOnRequest, TryOnResponse

app = FastAPI(
    title="Virtual Try-On AI Server",
    description="API for Garment Segmentation and Virtual Try-On",
    version="1.0.0"
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
    return {"message": "AI Server is running. Use /docs to test endpoints."}

@app.post("/process-garment", response_model=ProcessGarmentResponse)
async def process_garment(request: ProcessGarmentRequest):
    """
    Pipeline A - Add Product to Catalog (Garment Segmentation)
    This endpoint mocks the SAM garment segmentation.
    """
    try:
        raw_url_str = str(request.raw_image_url)
        print(f"[{request.product_id}] Starting garment segmentation...")
        print(f"[{request.product_id}] Downloading raw image from {raw_url_str}")
        
        # MOCK: Simulate model processing time (e.g., 2 seconds)
        await asyncio.sleep(2)
        
        print(f"[{request.product_id}] SAM segmentation complete. Isolating garment background...")
        print(f"[{request.product_id}] Uploading clean garment to Cloudinary...")
        
        # In production, replace with real SAM output uploaded to Cloudinary
        clean_garment_url = raw_url_str
        
        return ProcessGarmentResponse(
            product_id=request.product_id,
            clean_garment_url=clean_garment_url,
            status="success",
            message="Garment processed and segmented successfully (SAM)"
        )
    except Exception as e:
        print(f"Error in process_garment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on", response_model=TryOnResponse)
async def try_on(request: TryOnRequest):
    """
    Pipeline B - User Try-On Request
    This endpoint mocks SCHP, DensePose, and IDM-VTON processing.
    """
    try:
        user_photo_str = str(request.user_photo_url)
        clean_garment_str = str(request.clean_garment_url)
        
        print(f"[User: {request.user_id} | Product: {request.product_id}] Starting Virtual Try-On pipeline...")
        print(f"1. Downloading user photo: {user_photo_str}")
        print(f"2. Downloading clean garment (cached): {clean_garment_str}")
        
        # MOCK: Simulate model processing stages
        print("3. Running Human Parsing (SCHP)... [Segmenting body: arms, torso, legs]")
        await asyncio.sleep(1)
        
        print("4. Running Pose Estimation (DensePose)... [Mapping body pose/orientation]")
        await asyncio.sleep(1)
        
        print("5. Generating Agnostic Mask + Pose Map... [Defining target cloth area]")
        await asyncio.sleep(1)
        
        print("6. Running IDM-VTON model... [Synthesizing virtual fitting]")
        await asyncio.sleep(2)
        
        print("7. AI Try-On generation complete. Uploading result to Cloudinary...")
        
        # In production, this will be the IDM-VTON generated image uploaded to Cloudinary.
        # For mock demo purposes, returning the user photo URL ensures an immediate valid preview in the browser.
        result_url = user_photo_str
        
        return TryOnResponse(
            user_id=request.user_id,
            product_id=request.product_id,
            result_url=result_url,
            status="success",
            message="Virtual Try-On completed successfully (IDM-VTON)"
        )
    except Exception as e:
        print(f"Error in try_on: {e}")
        raise HTTPException(status_code=500, detail=str(e))
