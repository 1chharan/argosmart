from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.all_models import User, Species, Sighting, RiskAlert, ValidationLog
from app.services.ml_service import SPECIES_CATALOG

DEMO_USERS = [
    {
        "id": 1,
        "phone": "9876543210",
        "full_name": "Ramesh Goud",
        "role": "farmer",
        "village": "Hasanparthy, Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "preferred_lang": "te"
    },
    {
        "id": 2,
        "phone": "9123456780",
        "full_name": "Dr. Sunita Kulkarni (Entomologist)",
        "role": "expert",
        "village": "KVK Regional Station, Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "preferred_lang": "en"
    },
    {
        "id": 3,
        "phone": "9988776655",
        "full_name": "Suresh Patel",
        "role": "volunteer",
        "village": "Dharmasagar, Warangal",
        "district": "Warangal",
        "state": "Telangana",
        "preferred_lang": "hi"
    }
]

VILLAGE_COORDS = [
    ("Hasanparthy", 18.0673, 79.5484),
    ("Dharmasagar", 17.9892, 79.4673),
    ("Wardhannapet", 17.7654, 79.6231),
    ("Narsampet", 17.9254, 79.8976),
    ("Geesugonda", 17.9621, 79.6841),
    ("Atmakur", 18.1251, 79.7210),
    ("Parkal", 18.2045, 79.7123),
    ("Guntur Rural", 16.3067, 80.4365),
    ("Tenali", 16.2430, 80.6400),
    ("Nizamabad Agrico", 18.6725, 78.0941),
    ("Armoor", 18.7900, 78.2900),
    ("Nashik Dindori", 20.2010, 73.8340),
]

CROPS = ["Cotton", "Chilli", "Paddy", "Maize", "Groundnut", "Mustard", "Tomato", "Turmeric"]

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("🌱 Seeding AgroSmart AI database with users, species, sightings, and risk alerts...")

    # 1. Seed Users
    users_dict = {}
    for u_data in DEMO_USERS:
        u = User(**u_data)
        db.add(u)
        db.flush()
        users_dict[u.id] = u

    # 2. Seed Species
    species_dict = {}
    for s_data in SPECIES_CATALOG:
        sp = Species(
            id=s_data["id"],
            scientific_name=s_data["scientific_name"],
            common_name_en=s_data["common_name_en"],
            common_name_te=s_data["common_name_te"],
            common_name_hi=s_data["common_name_hi"],
            category=s_data["category"],
            role_type=s_data["role_type"],
            description_en=f"{s_data['common_name_en']} observed commonly across Indian agro-climatic zones.",
            description_te=f"{s_data['common_name_te']} తెలుగు రాష్ట్రాల పంట పొలాలలో సహజంగా కనిపిస్తుంది.",
            description_hi=f"{s_data['common_name_hi']} भारतीय कृषि क्षेत्रों में व्यापक रूप से पाया जाता है।",
            eco_tip_en=s_data["eco_tip_en"],
            eco_tip_te=s_data["eco_tip_te"],
            eco_tip_hi=s_data["eco_tip_hi"],
            seasonal_peak_months="6,7,8,9,10,11",
            image_url=s_data["image_url"]
        )
        db.add(sp)
        db.flush()
        species_dict[sp.id] = sp

    # 3. Seed 32 Realistic Sightings across villages and months
    now = datetime.now(timezone.utc)
    sightings_data = [
        # (species_id, crop, village_idx, month_offset_days, confidence, status, notes)
        (1, "Cotton", 0, 1, 95.2, "expert_verified", "Huge cluster of honeybees visiting flowering cotton. Flowers setting well."),
        (2, "Chilli", 1, 3, 91.0, "expert_verified", "Ladybird beetles actively consuming black aphids on lower leaves."),
        (4, "Maize", 2, 5, 94.5, "ai_suggested", "Severe whorl damage spotted. Need recommendation on bio-spray."),
        (1, "Mustard", 3, 8, 96.8, "expert_verified", "Excellent pollination activity in early morning hours."),
        (5, "Cotton", 4, 10, 89.2, "pending", "Whiteflies observed on underside of leaves."),
        (3, "Tomato", 5, 12, 92.1, "expert_verified", "Green lacewing larvae found near tomato fruit clusters."),
        (6, "Turmeric", 6, 15, 88.4, "ai_suggested", "Hoverflies hovering over intercropped marigolds."),
        (7, "Paddy", 7, 18, 93.0, "expert_verified", "Pod borer larvae noticed. Trichocards recommended."),
        (8, "Paddy", 8, 22, 96.0, "expert_verified", "Beneficial micro-wasp parasitizing stem borer eggs."),
        (1, "Chilli", 9, 25, 94.2, "expert_verified", "Pollinators buzzing around chilli flowers."),
        (2, "Cotton", 10, 28, 90.5, "ai_suggested", "Seven spotted beetle keeping jassids under control."),
        (4, "Maize", 11, 32, 92.3, "pending", "Armyworm caterpillar inside young maize cob."),
        (1, "Groundnut", 0, 45, 95.0, "expert_verified", "Honeybees on groundnut blossoms."),
        (2, "Tomato", 1, 60, 93.4, "expert_verified", "Ladybird feeding on mites."),
        (3, "Cotton", 2, 75, 89.0, "ai_suggested", "Lacewing eggs laid on silky stalks."),
        (5, "Chilli", 3, 90, 87.5, "pending", "Whitefly infestation spreading from neighboring field."),
        (1, "Paddy", 4, 110, 96.1, "expert_verified", "Healthy bee population along paddy bunds."),
        (4, "Maize", 5, 130, 95.8, "expert_verified", "Pest damage caught early, neem spray applied successfully."),
        (6, "Turmeric", 6, 150, 91.2, "ai_suggested", "Flower flies active during sunny noon."),
        (7, "Chilli", 7, 180, 89.6, "pending", "Fruit borer holes in green chillies."),
        (8, "Cotton", 8, 210, 94.0, "expert_verified", "Trichogramma released 2 weeks ago showing great suppression."),
        (1, "Mustard", 9, 240, 97.1, "expert_verified", "Winter peak bee foraging."),
        (2, "Groundnut", 10, 270, 92.0, "ai_suggested", "Predator beetle in mulch layer."),
        (5, "Cotton", 11, 300, 86.4, "pending", "Sucking pest outbreak after heavy drizzle."),
        (1, "Chilli", 0, 320, 94.8, "expert_verified", "High bee count recorded."),
        (3, "Tomato", 1, 340, 93.2, "expert_verified", "Green lacewings plentiful."),
        (4, "Maize", 2, 2, 91.5, "pending", "Fresh whorl leaf cuts visible."),
        (1, "Cotton", 3, 4, 96.2, "expert_verified", "Apis cerana pollinating white cotton flowers."),
        (2, "Chilli", 4, 6, 92.8, "expert_verified", "Ladybirds devouring yellow aphids."),
        (7, "Paddy", 5, 9, 88.0, "pending", "Pest caterpillar on flag leaf."),
        (8, "Maize", 6, 11, 95.4, "expert_verified", "Parasitoid wasp active against stem borers."),
        (1, "Groundnut", 7, 14, 93.7, "expert_verified", "Bee cluster observed near field boundary.")
    ]

    for item in sightings_data:
        sp_id, crop, v_idx, day_offset, conf, st, note = item
        v_name, lat, lon = VILLAGE_COORDS[v_idx % len(VILLAGE_COORDS)]
        # Add slight jitter to coordinates so pins don't overlap exactly
        lat_jitter = lat + ((hash(note) % 100) - 50) * 0.0004
        lon_jitter = lon + ((hash(note) % 80) - 40) * 0.0004

        sp = species_dict[sp_id]
        created_time = now - timedelta(days=day_offset, hours=(hash(note) % 24))

        s = Sighting(
            user_id=1 if (v_idx % 2 == 0) else 3,
            species_id=sp_id,
            ai_top_species_id=sp_id,
            ai_confidence=conf,
            category=sp.category,
            crop_name=crop,
            photo_url=sp.image_url,
            latitude=round(lat_jitter, 5),
            longitude=round(lon_jitter, 5),
            village=v_name,
            accuracy_meters=8.5,
            status=st,
            notes=note,
            is_synced=True,
            created_at=created_time,
            updated_at=created_time
        )
        db.add(s)
        db.flush()

        if st == "expert_verified":
            val = ValidationLog(
                sighting_id=s.id,
                expert_id=2,  # Dr. Sunita Kulkarni
                previous_species_id=sp_id,
                confirmed_species_id=sp_id,
                expert_notes="Confirmed species morphological identification from high-resolution wing venation.",
                is_model_corrected=False,
                created_at=created_time + timedelta(hours=4)
            )
            db.add(val)

    # 4. Seed Risk Alerts
    alerts = [
        RiskAlert(
            village="Hasanparthy, Warangal",
            latitude=18.0673,
            longitude=79.5484,
            radius_km=12.0,
            risk_level="MEDIUM",
            alert_title="Moderate Whitefly Alert & Bee Foraging Period",
            alert_message_en="Slight increase in sucking pest activity in cotton. High honeybee foraging reported between 8 AM and 11 AM.",
            alert_message_te="పత్తి పంటలో తెల్లదోమల ఉధృతి కొద్దిగా పెరిగింది. ఉదయం 8 నుండి 11 వరకు తేనెటీగలు ఎక్కువగా సంచరిస్తున్నాయి.",
            alert_message_hi="कपास में सफेद मक्खी की हल्की वृद्धि देखी गई है। सुबह 8 से 11 बजे तक मधुमक्खियां अधिक सक्रिय हैं।",
            pest_species_id=5,
            recommendation="Do not spray toxic synthetic insecticides. Install yellow sticky traps and apply 5% neem extract strictly after 5:30 PM.",
            is_active=True,
            created_at=now - timedelta(days=1),
            expires_at=now + timedelta(days=6)
        ),
        RiskAlert(
            village="Wardhannapet, Warangal",
            latitude=17.7654,
            longitude=79.6231,
            radius_km=15.0,
            risk_level="HIGH",
            alert_title="Fall Armyworm (FAW) Alert in Maize",
            alert_message_en="Fall armyworm cluster identified in young maize crops across 3 adjoining blocks. Immediate biological intervention required.",
            alert_message_te="మొక్కజొన్న పంటలో కత్తెర పురుగు దాడి గుర్తించబడింది. రైతులు వెంటనే లింగాకర్షక బుట్టలు అమర్చండి.",
            alert_message_hi="मक्के में फॉल आर्मीवॉर्म का प्रकोप देखा गया है। तुरंत फेरोमोन ट्रैप लगाएं और जैविक उपचार करें।",
            pest_species_id=4,
            recommendation="Release Trichogramma egg parasitoids @ 50,000/acre. Spray bio-pesticide Bacillus thuringiensis (Bt) @ 2g/L.",
            is_active=True,
            created_at=now - timedelta(days=2),
            expires_at=now + timedelta(days=5)
        )
    ]
    for a in alerts:
        db.add(a)

    db.commit()
    print("✅ Database successfully seeded with 32 realistic sightings and master data!")
