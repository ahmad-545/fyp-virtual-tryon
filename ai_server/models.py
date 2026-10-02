from pydantic import BaseModel, HttpUrl
from typing import Optional

class ProcessGarmentRequest(BaseModel):
    product_id: str
    raw_image_url: HttpUrl

class ProcessGarmentResponse(BaseModel):
    product_id: str
    clean_garment_url: str
    status: str
    message: str

class TryOnRequest(BaseModel):
    user_id: Optional[str] = "guest_user"
    product_id: str
    user_photo_url: HttpUrl
    clean_garment_url: HttpUrl
    product_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    styleType: Optional[str] = None
    tryon_category: Optional[str] = "upper_body"
    steps: Optional[int] = 30
    guidance_scale: Optional[float] = 2.0
    seed: Optional[int] = -1

class TryOnResponse(BaseModel):
    user_id: str
    product_id: str
    result_url: str
    status: str
    message: str
    # Pipeline B intermediate outputs
    human_parsing_url: Optional[str] = None
    pose_map_url: Optional[str] = None
    agnostic_mask_url: Optional[str] = None
    agnostic_image_url: Optional[str] = None
    # IDM-VTON diffusion fields
    engine: Optional[str] = None
    densepose_url: Optional[str] = None
    idm_mask_url: Optional[str] = None
    garment_caption: Optional[str] = None
    elapsed_sec: Optional[float] = None
