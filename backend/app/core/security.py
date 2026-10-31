from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings

security = HTTPBearer(auto_error=False)

def create_access_token(subject: str | Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user_payload(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> dict:
    if not credentials:
        # For demo simplicity when farmers use the app anonymously, return a default farmer guest
        return {"sub": "1", "role": "farmer", "is_guest": True}
    return decode_token(credentials.credentials)

def require_role(allowed_roles: list[str]):
    def role_checker(payload: dict = Depends(get_current_user_payload)):
        role = payload.get("role", "farmer")
        if role not in allowed_roles and "admin" not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role '{role}' is not in allowed roles {allowed_roles}"
            )
        return payload
    return role_checker
