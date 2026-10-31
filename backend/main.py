import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.db.seed_data import seed_database
from app.api.auth import router as auth_router
from app.api.sightings import router as sightings_router
from app.api.species import router as species_router
from app.api.classify import router as classify_router
from app.api.expert import router as expert_router
from app.api.plant_doctor import router as plant_doctor_router
from app.api.risk import router as risk_router
from app.api.assistant import router as assistant_router
from app.api.export import router as export_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    # Seed database with master species & 30+ sightings
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Community platform for farmers to photograph beneficial pollinators & pests, get AI guesses, monitor seasonal maps, and expert verifications.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for photos
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.STORAGE_DIR), name="uploads")

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(sightings_router, prefix=settings.API_V1_STR)
app.include_router(species_router, prefix=settings.API_V1_STR)
app.include_router(classify_router, prefix=settings.API_V1_STR)
app.include_router(expert_router, prefix=settings.API_V1_STR)
app.include_router(plant_doctor_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(export_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
