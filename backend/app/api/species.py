from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Species
from app.schemas.schemas import SpeciesBase

router = APIRouter(prefix="/species", tags=["Species"])

@router.get("", response_model=List[SpeciesBase])
def get_all_species(
    category: Optional[str] = Query(None, description="helpful, harmful, uncertain"),
    role_type: Optional[str] = Query(None, description="pollinator, predator, parasitoid, pest"),
    db: Session = Depends(get_db)
):
    query = db.query(Species)
    if category:
        query = query.filter(Species.category == category)
    if role_type:
        query = query.filter(Species.role_type == role_type)
    return query.all()

@router.get("/{species_id}", response_model=SpeciesBase)
def get_species_by_id(species_id: int, db: Session = Depends(get_db)):
    sp = db.query(Species).filter(Species.id == species_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Species not found")
    return sp
