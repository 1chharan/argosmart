from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field

# User Schemas
class UserBase(BaseModel):
    phone: str
    full_name: str
    role: str = "farmer"
    village: str
    district: Optional[str] = "Warangal"
    state: Optional[str] = "Telangana"
    preferred_lang: Optional[str] = "te"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    phone: str
    otp: Optional[str] = "1234"
    role: Optional[str] = "farmer"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Species Schemas
class SpeciesBase(BaseModel):
    id: int
    scientific_name: str
    common_name_en: str
    common_name_te: str
    common_name_hi: str
    category: str  # helpful, harmful, uncertain
    role_type: str  # pollinator, predator, parasitoid, pest, neutral
    description_en: Optional[str] = None
    description_te: Optional[str] = None
    description_hi: Optional[str] = None
    eco_tip_en: str
    eco_tip_te: str
    eco_tip_hi: str
    seasonal_peak_months: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# Classification Result Schemas
class PredictionItem(BaseModel):
    species_id: int
    scientific_name: str
    common_name_en: str
    common_name_te: str
    common_name_hi: str
    confidence: float
    category: str # helpful, harmful, uncertain
    role_type: str
    eco_tip_en: str
    eco_tip_te: str
    eco_tip_hi: str

class ClassificationResult(BaseModel):
    top_predictions: List[PredictionItem]
    primary_category: str # helpful, harmful, uncertain
    recommended_action: str
    requires_expert_review: bool
    voice_announcement_text: dict # en, te, hi texts for TTS
    is_mixed_detection: bool = False
    no_insect_detected: bool = False
    detected_insects: Optional[List[PredictionItem]] = None
    mixed_ecological_advice_en: Optional[str] = None
    mixed_ecological_advice_te: Optional[str] = None
    mixed_ecological_advice_hi: Optional[str] = None
    disclaimer_note_en: str = "AI suggestion based on transfer learning. An agricultural expert will verify this record."
    disclaimer_note_te: str = "ఏఐ సూచన మాత్రమే. వ్యవసాయ నిపుణులు పరిశీలించి ధృవీకరిస్తారు."
    disclaimer_note_hi: str = "एआई सुझाव मात्र है। कृषि विशेषज्ञ इसकी जांच व पुष्टि करेंगे।"

# Sighting Schemas
class SightingCreate(BaseModel):
    species_id: Optional[int] = None
    crop_name: Optional[str] = None
    latitude: float
    longitude: float
    village: Optional[str] = "Warangal Rural"
    accuracy_meters: Optional[float] = 10.0
    notes: Optional[str] = None
    voice_note_url: Optional[str] = None

class SightingResponse(BaseModel):
    id: int
    uuid: str
    user_id: Optional[int] = None
    species_id: Optional[int] = None
    ai_top_species_id: Optional[int] = None
    ai_confidence: float
    category: str
    crop_name: Optional[str] = None
    photo_url: str
    latitude: float
    longitude: float
    village: Optional[str] = None
    accuracy_meters: Optional[float] = None
    status: str
    notes: Optional[str] = None
    voice_note_url: Optional[str] = None
    is_synced: bool
    created_at: datetime
    species: Optional[SpeciesBase] = None
    ai_species: Optional[SpeciesBase] = None

    class Config:
        from_attributes = True

# Expert Verification Request
class VerificationRequest(BaseModel):
    confirmed_species_id: int
    expert_notes: Optional[str] = None
    is_approved: bool = True

# Plant Doctor Schemas
class PlantDoctorRequest(BaseModel):
    crop_name: Optional[str] = "Paddy"
    symptoms: Optional[str] = None
    image_data_base64: Optional[str] = None

class PlantDoctorResponse(BaseModel):
    diagnosis_name_en: str
    diagnosis_name_te: str
    diagnosis_name_hi: str
    confidence: float
    explanation_en: str
    explanation_te: str
    explanation_hi: str
    organic_treatment_steps: List[str]
    pollinator_warning_en: str
    pollinator_warning_te: str
    pollinator_warning_hi: str
    severity: str # Low, Medium, High

# Risk Intelligence Schemas
class RiskStatusResponse(BaseModel):
    village: str
    latitude: float
    longitude: float
    risk_level: str # LOW, MEDIUM, HIGH
    risk_score: int # 0-100
    beneficial_count_nearby: int
    harmful_pest_count_nearby: int
    recent_dominant_species: Optional[str] = None
    pest_pressure_alert: str
    pollinator_safe_window: str
    active_alerts: List[Any] = []
    weather_context: dict

# Assistant Schemas
class AssistantChatRequest(BaseModel):
    message: str
    language: str = "te" # te, hi, en
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    crop_context: Optional[str] = None

class AssistantChatResponse(BaseModel):
    reply_text: str
    audio_tts_text: str
    suggested_actions: List[str]
    detected_intent: str
    language: str
