import math
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.all_models import Sighting, Species, RiskAlert
from app.core.database import haversine_distance_km
from app.schemas.schemas import RiskStatusResponse

class RiskIntelligenceService:
    """
    Computes spatial pest pressure, beneficial insect buffer index,
    and pollinator activity windows based on real-time observations and weather simulation.
    """

    def compute_field_risk(self, db: Session, latitude: float, longitude: float, village: str = "Warangal Rural") -> RiskStatusResponse:
        # Fetch sightings within 15 km
        all_sightings = db.query(Sighting).all()
        nearby = []
        for s in all_sightings:
            dist = haversine_distance_km(latitude, longitude, s.latitude, s.longitude)
            if dist <= 20.0:
                nearby.append(s)

        pest_count = 0
        beneficial_count = 0
        species_counts = {}

        for s in nearby:
            cat = (s.category or "uncertain").lower()
            if cat == "harmful":
                pest_count += 1
            elif cat == "helpful":
                beneficial_count += 1

            sp_name = s.species.common_name_en if s.species else "Unknown"
            species_counts[sp_name] = species_counts.get(sp_name, 0) + 1

        dominant_species = max(species_counts, key=species_counts.get) if species_counts else "Indian Honeybee"

        # Calculate risk score (0 to 100)
        # More pests increase risk; beneficial insects act as natural predators/buffers
        raw_score = (pest_count * 18) - (beneficial_count * 8) + 25
        risk_score = max(10, min(95, raw_score))

        if risk_score >= 65:
            risk_level = "HIGH"
            pest_alert = f"High pest density observed in {village} ({pest_count} harmful sightings). Bio-control interventions recommended."
            spray_window = "DO NOT SPRAY TOXIC CHEMICALS: Beneficial pollinators active in 3km perimeter."
        elif risk_score >= 40:
            risk_level = "MEDIUM"
            pest_alert = f"Moderate insect activity in {village}. Beneficial predator population is currently keeping pests in check."
            spray_window = "If spraying biological remedies, apply only after 5:30 PM to safeguard foraging bees."
        else:
            risk_level = "LOW"
            pest_alert = f"Healthy agro-ecosystem! High beneficial pollinator & predator count ({beneficial_count} sightings) protecting crops."
            spray_window = "No pesticide treatment necessary. Natural predators active."

        # Active village alerts
        active_db_alerts = db.query(RiskAlert).filter(RiskAlert.is_active == True).limit(5).all()
        alerts_list = [
            {
                "id": a.id,
                "title": a.alert_title,
                "level": a.risk_level,
                "message_en": a.alert_message_en,
                "message_te": a.alert_message_te,
                "message_hi": a.alert_message_hi,
                "recommendation": a.recommendation
            }
            for a in active_db_alerts
        ]

        # Simulated hyper-local agro-weather
        weather = {
            "temperature_c": 31.5,
            "humidity_pct": 74,
            "wind_speed_kmh": 11.2,
            "condition": "Partly Cloudy - High Pollinator Foraging Activity",
            "forecast_next_48h": "Favorable conditions for predator wasps and ladybird beetles."
        }

        return RiskStatusResponse(
            village=village,
            latitude=latitude,
            longitude=longitude,
            risk_level=risk_level,
            risk_score=risk_score,
            beneficial_count_nearby=beneficial_count,
            harmful_pest_count_nearby=pest_count,
            recent_dominant_species=dominant_species,
            pest_pressure_alert=pest_alert,
            pollinator_safe_window=spray_window,
            active_alerts=alerts_list,
            weather_context=weather
        )

    def trigger_sms_or_whatsapp(self, phone: str, alert_message: str, channel: str = "whatsapp") -> Dict[str, Any]:
        """
        Mock / webhook handler for Twilio or WhatsApp Business API farmer broadcast.
        """
        # In a production environment with TWILIO_ACCOUNT_SID or WhatsApp API keys,
        # this would invoke the vendor SDK. Here it logs and returns delivery confirmation.
        return {
            "status": "QUEUED_AND_DELIVERED",
            "channel": channel,
            "recipient": phone,
            "character_count": len(alert_message),
            "gateway_ref": f"KM-MSG-{abs(hash(phone + alert_message)) % 1000000}",
            "message": alert_message
        }

risk_service = RiskIntelligenceService()
