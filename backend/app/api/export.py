import csv
import io
from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Sighting

router = APIRouter(prefix="/export", tags=["Data Export"])

@router.get("/geojson")
def export_geojson(db: Session = Depends(get_db)):
    """
    Exports all geotagged sightings as standard GeoJSON FeatureCollection.
    """
    sightings = db.query(Sighting).all()
    features = []
    for s in sightings:
        sp_name = s.species.common_name_en if s.species else "Unknown"
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s.longitude, s.latitude]
            },
            "properties": {
                "id": s.id,
                "species": sp_name,
                "category": s.category,
                "crop": s.crop_name,
                "village": s.village,
                "confidence": s.ai_confidence,
                "status": s.status,
                "date": s.created_at.isoformat() if s.created_at else None
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    """
    Streams CSV export of all observations for agronomists and researchers.
    """
    sightings = db.query(Sighting).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "species_id", "species_name", "category", "crop", "village", "latitude", "longitude", "confidence", "status", "date"])

    for s in sightings:
        sp_name = s.species.common_name_en if s.species else "Unknown"
        writer.writerow([
            s.id,
            s.species_id,
            sp_name,
            s.category,
            s.crop_name,
            s.village,
            s.latitude,
            s.longitude,
            s.ai_confidence,
            s.status,
            s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else ""
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=agrosmart_sightings.csv"}
    )
