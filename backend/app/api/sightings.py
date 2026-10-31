import os
import shutil
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.core.database import get_db, haversine_distance_km
from app.core.config import settings
from app.core.security import get_current_user_payload
from app.models.all_models import Sighting, Species, User, AuditLog
from app.schemas.schemas import SightingResponse, ClassificationResult
from app.services.ml_service import ml_classifier

router = APIRouter(prefix="/sightings", tags=["Sightings"])

os.makedirs(settings.STORAGE_DIR, exist_ok=True)

@router.get("", response_model=List[SightingResponse])
def get_sightings(
    category: Optional[str] = Query(None, description="helpful, harmful, uncertain"),
    status: Optional[str] = Query(None, description="pending, ai_suggested, expert_verified"),
    crop_name: Optional[str] = None,
    village: Optional[str] = None,
    month: Optional[int] = Query(None, ge=1, le=12),
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Sighting)
    if category:
        query = query.filter(Sighting.category == category)
    if status:
        query = query.filter(Sighting.status == status)
    if crop_name:
        query = query.filter(Sighting.crop_name.ilike(f"%{crop_name}%"))
    if village:
        query = query.filter(Sighting.village.ilike(f"%{village}%"))
    if month:
        query = query.filter(extract('month', Sighting.created_at) == month)

    return query.order_by(Sighting.created_at.desc()).offset(offset).limit(limit).all()

@router.get("/nearby", response_model=List[SightingResponse])
def get_nearby_sightings(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius_km: float = Query(15.0, description="Radius in km"),
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    all_items = db.query(Sighting).all()
    results = []
    for s in all_items:
        dist = haversine_distance_km(lat, lon, s.latitude, s.longitude)
        if dist <= radius_km:
            if category and s.category != category:
                continue
            results.append(s)
    return results

@router.get("/stats/seasonal")
def get_seasonal_stats(species_id: Optional[int] = None, crop_name: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Returns month-by-month sighting frequencies for seasonal calendar charts.
    """
    query = db.query(Sighting)
    if species_id:
        query = query.filter(Sighting.species_id == species_id)
    if crop_name:
        query = query.filter(Sighting.crop_name.ilike(f"%{crop_name}%"))

    sightings = query.all()
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = [{"month": m, "helpful": 0, "harmful": 0, "uncertain": 0, "total": 0} for m in months]

    for s in sightings:
        if s.created_at:
            m_idx = s.created_at.month - 1
            cat = s.category or "uncertain"
            if cat in ["helpful", "harmful", "uncertain"]:
                data[m_idx][cat] += 1
            data[m_idx]["total"] += 1

    return {"seasonal_distribution": data, "total_records": len(sightings)}

@router.get("/{sighting_id}", response_model=SightingResponse)
def get_sighting_by_id(sighting_id: int, db: Session = Depends(get_db)):
    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=404, detail="Sighting record not found")
    return sighting

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post("/upload")
async def upload_sighting(
    file: UploadFile = File(...),
    crop_name: Optional[str] = Form("Cotton"),
    latitude: float = Form(17.9689),
    longitude: float = Form(79.5941),
    village: Optional[str] = Form("Warangal Rural"),
    notes: Optional[str] = Form(None),
    voice_note_url: Optional[str] = Form(None),
    is_offline_sync: bool = Form(False),
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    """
    Farmer photo upload endpoint. Stores photo, executes AI classification,
    assigns category, saves sighting record, and flags low confidence for expert queue.
    Validates file type (JPEG, PNG, WebP) and maximum file size (10MB).
    """
    # 1. Validate File Extension & Type
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only JPEG, PNG, and WebP photos are accepted."
        )

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size exceeds 10MB limit. Please upload a smaller photo."
        )

    # 2. Save File to uploads folder
    safe_filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    file_path = os.path.join(settings.STORAGE_DIR, safe_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    photo_web_url = f"/uploads/{safe_filename}"

    # 3. Run ML Classification
    ai_result = ml_classifier.classify_image(file.filename, crop_name=crop_name)

    # Case: No insect detected in photo
    if ai_result.no_insect_detected:
        return {
            "sighting": {
                "id": 0,
                "uuid": "unidentified",
                "category": "uncertain",
                "ai_confidence": 0.0,
                "photo_url": photo_web_url,
                "status": "no_insect_detected",
                "crop_name": crop_name,
                "latitude": latitude,
                "longitude": longitude,
                "village": village,
                "notes": notes,
                "is_synced": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            "ai_analysis": ai_result
        }

    top_pred = ai_result.top_predictions[0]

    # Status: pending if confidence < 60%, otherwise ai_suggested
    status_val = "pending" if ai_result.requires_expert_review else "ai_suggested"

    # 4. Save to database
    user_id = int(user_payload.get("sub", 1))
    sighting = Sighting(
        user_id=user_id,
        species_id=top_pred.species_id,
        ai_top_species_id=top_pred.species_id,
        ai_confidence=top_pred.confidence,
        category=ai_result.primary_category,
        crop_name=crop_name,
        photo_url=photo_web_url,
        latitude=latitude,
        longitude=longitude,
        village=village,
        status=status_val,
        notes=notes,
        voice_note_url=voice_note_url,
        is_synced=True
    )
    db.add(sighting)
    db.commit()
    db.refresh(sighting)

    # 5. Create Audit Log
    audit = AuditLog(
        user_id=user_id,
        action="SIGHTING_UPLOAD",
        entity_type="sighting",
        entity_id=sighting.id,
        details=f"Uploaded photo {file.filename}, identified as {top_pred.common_name_en} ({top_pred.confidence}%)"
    )
    db.add(audit)
    db.commit()

    return {
        "sighting": SightingResponse.model_validate(sighting),
        "ai_analysis": ai_result
    }
