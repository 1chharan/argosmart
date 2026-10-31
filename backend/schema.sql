-- ============================================================================
-- AgroSmart AI: Pollinator & Beneficial Insect Network
-- Production PostgreSQL + PostGIS Database Schema
-- Optimized for spatial queries, high concurrency, and offline-sync reconciliation
-- ============================================================================

-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('farmer', 'volunteer', 'expert', 'admin');
CREATE TYPE insect_category AS ENUM ('helpful', 'harmful', 'uncertain');
CREATE TYPE insect_role_type AS ENUM ('pollinator', 'predator', 'parasitoid', 'pest', 'neutral');
CREATE TYPE verification_status AS ENUM ('pending', 'ai_suggested', 'expert_verified', 'rejected');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'farmer',
    village VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Telangana',
    preferred_lang VARCHAR(10) DEFAULT 'te', -- 'te' (Telugu), 'hi' (Hindi), 'en' (English)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_village ON users(village);

-- 4. Species Master Catalog
CREATE TABLE IF NOT EXISTS species (
    id SERIAL PRIMARY KEY,
    scientific_name VARCHAR(150) NOT NULL UNIQUE,
    common_name_en VARCHAR(100) NOT NULL,
    common_name_te VARCHAR(100) NOT NULL,
    common_name_hi VARCHAR(100) NOT NULL,
    category insect_category NOT NULL,
    role_type insect_role_type NOT NULL,
    description_en TEXT,
    description_te TEXT,
    description_hi TEXT,
    eco_tip_en TEXT NOT NULL,
    eco_tip_te TEXT NOT NULL,
    eco_tip_hi TEXT NOT NULL,
    seasonal_peak_months VARCHAR(50), -- e.g. "8,9,10,11" (Aug-Nov)
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_species_category ON species(category);
CREATE INDEX idx_species_role ON species(role_type);

-- 5. Insect Sightings with PostGIS Geometry
CREATE TABLE IF NOT EXISTS sightings (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    species_id INTEGER REFERENCES species(id) ON DELETE RESTRICT,
    ai_top_species_id INTEGER REFERENCES species(id) ON DELETE SET NULL,
    ai_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- e.g. 94.50
    category insect_category NOT NULL DEFAULT 'uncertain',
    crop_name VARCHAR(100),
    photo_url TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326), -- PostGIS Spatial Point (SRID 4326 - WGS 84)
    village VARCHAR(100),
    accuracy_meters NUMERIC(6, 2) DEFAULT 10.0,
    status verification_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    voice_note_url TEXT,
    is_synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PostGIS Spatial Index (GIST) for rapid spatial queries
CREATE INDEX idx_sightings_geom ON sightings USING GIST(geom);
CREATE INDEX idx_sightings_status ON sightings(status);
CREATE INDEX idx_sightings_species ON sightings(species_id);
CREATE INDEX idx_sightings_village ON sightings(village);
CREATE INDEX idx_sightings_created_at ON sightings(created_at);

-- Trigger to automatically populate geom from lat/lon
CREATE OR REPLACE FUNCTION set_sighting_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_sighting_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON sightings
FOR EACH ROW
EXECUTE FUNCTION set_sighting_geom();

-- 6. Expert Validations & Audit Log
CREATE TABLE IF NOT EXISTS validations (
    id SERIAL PRIMARY KEY,
    sighting_id INTEGER NOT NULL REFERENCES sightings(id) ON DELETE CASCADE,
    expert_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    previous_species_id INTEGER REFERENCES species(id),
    confirmed_species_id INTEGER NOT NULL REFERENCES species(id),
    expert_notes TEXT,
    is_model_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validations_sighting ON validations(sighting_id);
CREATE INDEX idx_validations_expert ON validations(expert_id);

-- 7. Risk Intelligence Alerts
CREATE TABLE IF NOT EXISTS risk_alerts (
    id SERIAL PRIMARY KEY,
    village VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    radius_km NUMERIC(5, 2) DEFAULT 10.0,
    risk_level risk_level NOT NULL DEFAULT 'LOW',
    alert_title VARCHAR(150) NOT NULL,
    alert_message_en TEXT NOT NULL,
    alert_message_te TEXT NOT NULL,
    alert_message_hi TEXT NOT NULL,
    pest_species_id INTEGER REFERENCES species(id),
    recommendation TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_risk_alerts_geom ON risk_alerts USING GIST(geom);
CREATE INDEX idx_risk_alerts_village ON risk_alerts(village);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- USEFUL POSTGIS SPATIAL QUERIES
-- ============================================================================

-- Query 1: Find all Bee / Pollinator sightings within 5 km of a farmer's field
-- SELECT s.id, sp.common_name_en, s.crop_name, s.latitude, s.longitude,
--        ST_Distance(s.geom::geography, ST_SetSRID(ST_MakePoint(79.5941, 17.9689), 4326)::geography) / 1000.0 AS distance_km
-- FROM sightings s
-- JOIN species sp ON s.species_id = sp.id
-- WHERE sp.role_type = 'pollinator'
--   AND ST_DWithin(s.geom::geography, ST_SetSRID(ST_MakePoint(79.5941, 17.9689), 4326)::geography, 5000)
-- ORDER BY distance_km ASC;

-- Query 2: Compute village-level pest vs beneficial ratio for Risk Intelligence
-- SELECT s.village,
--        COUNT(*) FILTER (WHERE sp.category = 'harmful') AS pest_count,
--        COUNT(*) FILTER (WHERE sp.category = 'helpful') AS beneficial_count,
--        COUNT(*) AS total_sightings
-- FROM sightings s
-- JOIN species sp ON s.species_id = sp.id
-- WHERE s.created_at >= NOW() - INTERVAL '14 days'
-- GROUP BY s.village;
