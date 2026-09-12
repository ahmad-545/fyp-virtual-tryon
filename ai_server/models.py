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

class TryOnResponse(BaseModel):
    user_id: str
    product_id: str
    result_url: str
    status: str
    message: str
