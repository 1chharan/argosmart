import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="farmer", nullable=False) # farmer, volunteer, expert, admin
    village = Column(String(100), index=True, nullable=False)
    district = Column(String(100), default="Warangal")
    state = Column(String(100), default="Telangana")
    preferred_lang = Column(String(10), default="te") # te, hi, en
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    sightings = relationship("Sighting", back_populates="user")
    validations = relationship("ValidationLog", back_populates="expert")

class Species(Base):
    __tablename__ = "species"

    id = Column(Integer, primary_key=True, index=True)
    scientific_name = Column(String(150), unique=True, nullable=False)
    common_name_en = Column(String(100), nullable=False)
    common_name_te = Column(String(100), nullable=False)
    common_name_hi = Column(String(100), nullable=False)
    category = Column(String(20), nullable=False) # helpful, harmful, uncertain
    role_type = Column(String(30), nullable=False) # pollinator, predator, parasitoid, pest, neutral
    description_en = Column(Text)
    description_te = Column(Text)
    description_hi = Column(Text)
    eco_tip_en = Column(Text, nullable=False)
    eco_tip_te = Column(Text, nullable=False)
    eco_tip_hi = Column(Text, nullable=False)
    seasonal_peak_months = Column(String(50)) # e.g. "7,8,9,10"
    image_url = Column(Text)
    created_at = Column(DateTime, default=utcnow)

    sightings = relationship("Sighting", foreign_keys="[Sighting.species_id]", back_populates="species")

class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), default=lambda: str(uuid.uuid4()), unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    species_id = Column(Integer, ForeignKey("species.id", ondelete="RESTRICT"), nullable=True)
    ai_top_species_id = Column(Integer, ForeignKey("species.id", ondelete="SET NULL"), nullable=True)
    ai_confidence = Column(Float, default=0.0) # e.g. 92.5
    category = Column(String(20), default="uncertain") # helpful, harmful, uncertain
    crop_name = Column(String(100), nullable=True)
    photo_url = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    village = Column(String(100), index=True, default="Warangal Rural")
    accuracy_meters = Column(Float, default=5.0)
    status = Column(String(30), default="pending") # pending, ai_suggested, expert_verified, rejected
    notes = Column(Text, nullable=True)
    voice_note_url = Column(Text, nullable=True)
    is_synced = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="sightings")
    species = relationship("Species", foreign_keys=[species_id], back_populates="sightings")
    ai_species = relationship("Species", foreign_keys=[ai_top_species_id])
    validations = relationship("ValidationLog", back_populates="sighting", cascade="all, delete-orphan")

class ValidationLog(Base):
    __tablename__ = "validations"

    id = Column(Integer, primary_key=True, index=True)
    sighting_id = Column(Integer, ForeignKey("sightings.id", ondelete="CASCADE"), nullable=False)
    expert_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    previous_species_id = Column(Integer, ForeignKey("species.id"), nullable=True)
    confirmed_species_id = Column(Integer, ForeignKey("species.id"), nullable=False)
    expert_notes = Column(Text, nullable=True)
    is_model_corrected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    sighting = relationship("Sighting", back_populates="validations")
    expert = relationship("User", back_populates="validations")
    confirmed_species = relationship("Species", foreign_keys=[confirmed_species_id])

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(Integer, primary_key=True, index=True)
    village = Column(String(100), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=10.0)
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    alert_title = Column(String(150), nullable=False)
    alert_message_en = Column(Text, nullable=False)
    alert_message_te = Column(Text, nullable=False)
    alert_message_hi = Column(Text, nullable=False)
    pest_species_id = Column(Integer, ForeignKey("species.id"), nullable=True)
    recommendation = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    expires_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=utcnow)
