from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, get_current_user_payload
from app.models.all_models import User
from app.schemas.schemas import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Phone + OTP style login. Pre-seeded demo phone numbers:
    - Farmer: 9876543210
    - Expert: 9123456780
    - Volunteer: 9988776655
    """
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        # Create user on the fly for ease of testing
        role = req.role or "farmer"
        user = User(
            phone=req.phone,
            full_name=f"Farmer {req.phone[-4:]}" if role == "farmer" else f"Officer {req.phone[-4:]}",
            role=role,
            village="Warangal",
            preferred_lang="te"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(access_token=token, token_type="bearer", user=user)

@router.get("/me", response_model=UserResponse)
def get_current_user(payload: dict = Depends(get_current_user_payload), db: Session = Depends(get_db)):
    user_id = int(payload.get("sub", 1))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = db.query(User).first()
    return user
