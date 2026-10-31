from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.ml_service import ml_classifier
from app.schemas.schemas import ClassificationResult

router = APIRouter(prefix="/classify", tags=["AI Classification"])

@router.post("", response_model=ClassificationResult)
async def classify_insect_image(
    file: UploadFile = File(...),
    crop_name: Optional[str] = Form("Cotton")
):
    """
    Direct AI prediction endpoint.
    Accepts an insect photo and returns top-3 predictions, confidence %,
    category (helpful/harmful/uncertain), and farmer-friendly advice.
    """
    result = ml_classifier.classify_image(file.filename, crop_name=crop_name)
    return result
