import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.plant_doctor_service import plant_doctor_service
from app.schemas.schemas import PlantDoctorResponse

router = APIRouter(prefix="/plant-doctor", tags=["AI Plant Doctor"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("/diagnose", response_model=PlantDoctorResponse)
async def diagnose_crop_problem(
    file: Optional[UploadFile] = File(None),
    crop_name: str = Form("Paddy"),
    symptoms: Optional[str] = Form("")
):
    """
    AI Plant Doctor: Uploads a leaf or crop photo and receives:
    - likely disease or nutrient issue
    - simple explanation in 3 languages
    - low-cost eco-friendly remedies (Neem oil, Jeevamrutha, Agniastra)
    - strict warning if chemical pesticides would harm bees/pollinators
    Validates file extension and size (max 10MB).
    """
    if file and file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext and ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Invalid image format. Only JPEG, PNG, and WebP leaf photos are accepted."
            )
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds 10MB limit. Please upload a smaller leaf photo."
            )

    filename = file.filename if file else ""
    return plant_doctor_service.diagnose_crop(
        crop_name=crop_name,
        symptoms=symptoms,
        filename=filename
    )
