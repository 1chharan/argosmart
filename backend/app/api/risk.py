from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.risk_service import risk_service
from app.schemas.schemas import RiskStatusResponse

router = APIRouter(prefix="/risk", tags=["Risk Intelligence"])

@router.get("/status", response_model=RiskStatusResponse)
def get_risk_status(
    lat: float = Query(18.0673, description="Field latitude"),
    lon: float = Query(79.5484, description="Field longitude"),
    village: str = Query("Hasanparthy, Warangal", description="Village name"),
    db: Session = Depends(get_db)
):
    """
    Computes real-time field pest risk, predator-to-pest ratio,
    safe spraying time window, and weather forecast.
    """
    return risk_service.compute_field_risk(db, latitude=lat, longitude=lon, village=village)

@router.post("/broadcast")
def send_risk_broadcast(
    phone: str = Body(..., embed=True),
    alert_message: str = Body(..., embed=True),
    channel: str = Body("whatsapp", embed=True)
):
    """
    Simulated SMS / WhatsApp alert hook for instant outreach to local farmer groups.
    """
    result = risk_service.trigger_sms_or_whatsapp(phone=phone, alert_message=alert_message, channel=channel)
    return result
