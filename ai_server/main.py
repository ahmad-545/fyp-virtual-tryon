from fastapi import FastAPI, HTTPException
import asyncio
from models import ProcessGarmentRequest, ProcessGarmentResponse, TryOnRequest, TryOnResponse

app = FastAPI(
    title="Virtual Try-On AI Server",
    description="API for Garment Segmentation and Virtual Try-On",
    version="1.0.0"
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
        print(f"[{request.product_id}] Starting garment segmentation...")
        print(f"[{request.product_id}] Downloading raw image from {request.raw_image_url}")
        
        # MOCK: Simulate model processing time (e.g., 2 seconds)
        await asyncio.sleep(2)
        
        print(f"[{request.product_id}] SAM segmentation complete. Uploading to Cloudinary...")
        
        # MOCK: In production, upload the processed image and get a real URL
        dummy_clean_garment_url = f"https://res.cloudinary.com/demo/image/upload/mock_clean_{request.product_id}.png"
        
        return ProcessGarmentResponse(
            product_id=request.product_id,
            clean_garment_url=dummy_clean_garment_url,
            status="success",
            message="Garment processed and segmented successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on", response_model=TryOnResponse)
async def try_on(request: TryOnRequest):
    """
    Pipeline B - User Try-On Request
    This endpoint mocks SCHP, DensePose, and IDM-VTON processing.
    """
    try:
        print(f"[User: {request.user_id} | Product: {request.product_id}] Starting Virtual Try-On pipeline...")
        print(f"1. Downloading user photo from {request.user_photo_url}")
        print(f"2. Downloading clean garment from {request.clean_garment_url}")
        
        # MOCK: Simulate model processing time (e.g., 5 seconds)
        print("3. Running Human Parsing (SCHP)...")
        await asyncio.sleep(1)
        
        print("4. Running Pose Estimation (DensePose)...")
        await asyncio.sleep(1)
        
        print("5. Generating Agnostic Mask + Pose Map...")
        await asyncio.sleep(1)
        
        print("6. Running IDM-VTON model (Generating try-on result)...")
        await asyncio.sleep(2)
        
        print("7. Processing complete. Uploading result to Cloudinary...")
        
        # MOCK: In production, this would be the final generated result URL
        dummy_result_url = f"https://res.cloudinary.com/demo/image/upload/mock_tryon_{request.user_id}_{request.product_id}.png"
        
        return TryOnResponse(
            user_id=request.user_id,
            product_id=request.product_id,
            result_url=dummy_result_url,
            status="success",
            message="Virtual Try-On completed successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
