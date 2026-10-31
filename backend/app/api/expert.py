from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user_payload, require_role
from app.models.all_models import Sighting, Species, ValidationLog, AuditLog, User
from app.schemas.schemas import SightingResponse, VerificationRequest

router = APIRouter(prefix="/expert", tags=["Expert Verification"])

@router.get("/queue", response_model=List[SightingResponse])
def get_expert_queue(
    status: Optional[str] = Query("pending", description="Filter by pending, ai_suggested, expert_verified"),
    db: Session = Depends(get_db)
):
    query = db.query(Sighting)
    if status == "all":
        pass
    elif status:
        query = query.filter(Sighting.status == status)
    return query.order_by(Sighting.ai_confidence.asc(), Sighting.created_at.desc()).limit(50).all()

@router.post("/verify/{sighting_id}")
def verify_sighting(
    sighting_id: int,
    req: VerificationRequest,
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user_payload)
):
    """
    Expert confirms or corrects an insect sighting.
    Records validation log, model correction flag, and updates status to 'expert_verified'.
    Corrections feed future model retraining pipelines.
    """
    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=404, detail="Sighting record not found")

    confirmed_sp = db.query(Species).filter(Species.id == req.confirmed_species_id).first()
    if not confirmed_sp:
        raise HTTPException(status_code=400, detail="Invalid confirmed species ID")

    expert_id = int(user_payload.get("sub", 2)) # Default to Dr. Sunita Kulkarni (ID 2) if anonymous/guest
    is_correction = (sighting.species_id != req.confirmed_species_id)

    # 1. Update Sighting
    sighting.previous_species_id = sighting.species_id
    sighting.species_id = confirmed_sp.id
    sighting.category = confirmed_sp.category
    sighting.status = "expert_verified" if req.is_approved else "rejected"

    # 2. Record Validation Log
    validation = ValidationLog(
        sighting_id=sighting.id,
        expert_id=expert_id,
        previous_species_id=sighting.ai_top_species_id,
        confirmed_species_id=confirmed_sp.id,
        expert_notes=req.expert_notes or "Verified via expert inspection",
        is_model_corrected=is_correction
    )
    db.add(validation)

    # 3. Record Audit Log
    audit = AuditLog(
        user_id=expert_id,
        action="EXPERT_VERIFICATION",
        entity_type="sighting",
        entity_id=sighting.id,
        details=f"Expert confirmed as {confirmed_sp.common_name_en}. Model correction: {is_correction}"
    )
    db.add(audit)

    db.commit()
    db.refresh(sighting)

    return {
        "status": "SUCCESS",
        "message": f"Sighting #{sighting.id} successfully verified as '{confirmed_sp.common_name_en}'",
        "sighting": SightingResponse.model_validate(sighting),
        "is_model_corrected": is_correction
    }

@router.get("/metrics")
def get_expert_metrics(db: Session = Depends(get_db)):
    total = db.query(Sighting).count()
    pending = db.query(Sighting).filter(Sighting.status == "pending").count()
    ai_suggested = db.query(Sighting).filter(Sighting.status == "ai_suggested").count()
    verified = db.query(Sighting).filter(Sighting.status == "expert_verified").count()
    corrections = db.query(ValidationLog).filter(ValidationLog.is_model_corrected == True).count()

    accuracy_rate = round(((verified - corrections) / max(1, verified)) * 100, 1)

    return {
        "total_sightings": total,
        "pending_review": pending,
        "ai_suggested": ai_suggested,
        "expert_verified": verified,
        "model_corrections_logged": corrections,
        "ai_agreement_accuracy_rate": accuracy_rate
    }
