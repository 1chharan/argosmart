import sys
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from starlette.testclient import TestClient
from main import app

def run_tests():
    with TestClient(app) as client:
        print("🚀 Starting AgroSmart AI End-to-End API Test Suite...")

        # 1. Root & Health
        r = client.get("/")
        assert r.status_code == 200, f"Root failed: {r.text}"
        print("✅ Root endpoint: OK")

        r = client.get("/health")
        assert r.status_code == 200
        print("✅ Health endpoint: OK")

        # 2. Auth Login
        r = client.post("/api/v1/auth/login", json={"phone": "9876543210", "role": "farmer"})
        assert r.status_code == 200
        token_data = r.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        print(f"✅ Auth Login: OK (Farmer: {token_data['user']['full_name']})")

        # 3. Species Catalog
        r = client.get("/api/v1/species")
        assert r.status_code == 200
        species = r.json()
        assert len(species) >= 8
        print(f"✅ Species Master: OK ({len(species)} agricultural species verified)")

        # 4. Sightings Seed Verification
        r = client.get("/api/v1/sightings")
        assert r.status_code == 200
        sightings = r.json()
        assert len(sightings) >= 30, f"Expected 30+ seed sightings, got {len(sightings)}"
        print(f"✅ Seed Sightings: OK ({len(sightings)} realistic sightings loaded)")

        # 5. Seasonal Trends
        r = client.get("/api/v1/sightings/stats/seasonal")
        assert r.status_code == 200
        seasonal = r.json()
        assert len(seasonal["seasonal_distribution"]) == 12
        print(f"✅ Seasonal Distribution: OK (12 months mapped)")

        # 6. Sighting Upload & AI Classifier
        test_file = ("bee_specimen.jpg", b"fake_jpeg_bytes_content_for_test", "image/jpeg")
        r = client.post(
            "/api/v1/sightings/upload",
            files={"file": test_file},
            data={"crop_name": "Cotton", "latitude": 18.0673, "longitude": 79.5484, "village": "Hasanparthy"}
        )
        assert r.status_code == 200, f"Upload failed: {r.text}"
        upload_res = r.json()
        assert "ai_analysis" in upload_res
        top_pred = upload_res["ai_analysis"]["top_predictions"][0]
        print(f"✅ Photo Upload & AI Classification: OK (Top: {top_pred['common_name_en']} - {top_pred['confidence']}%)")

        # 6b. Mixed Bugs Multi-Detection
        mixed_file = ("mixed_bee_whitefly.jpg", b"fake_mixed_bytes", "image/jpeg")
        r = client.post(
            "/api/v1/sightings/upload",
            files={"file": mixed_file},
            data={"crop_name": "Cotton", "latitude": 18.0673, "longitude": 79.5484, "village": "Hasanparthy"}
        )
        assert r.status_code == 200
        mixed_res = r.json()["ai_analysis"]
        assert mixed_res["is_mixed_detection"] is True
        assert len(mixed_res["detected_insects"]) == 2
        print(f"✅ Mixed Bugs Detection: OK (Detected: {mixed_res['detected_insects'][0]['common_name_en']} + {mixed_res['detected_insects'][1]['common_name_en']})")
        print(f"   [Mixed Eco Advice]: {mixed_res['mixed_ecological_advice_en'][:60]}...")

        # 7. AI Plant Doctor
        r = client.post(
            "/api/v1/plant-doctor/diagnose",
            data={"crop_name": "Paddy", "symptoms": "leaf blast fungal spindle lesions"}
        )
        assert r.status_code == 200
        doctor_res = r.json()
        assert "blast" in doctor_res["diagnosis_name_en"].lower()
        assert "pollinator_warning_en" in doctor_res
        print(f"✅ AI Plant Doctor: OK (Diagnosis: {doctor_res['diagnosis_name_en']})")
        print(f"   [Pollinator Safe Warning]: {doctor_res['pollinator_warning_en'][:60]}...")

        # 8. Risk Intelligence
        r = client.get("/api/v1/risk/status?lat=18.0673&lon=79.5484&village=Hasanparthy")
        assert r.status_code == 200
        risk_res = r.json()
        assert risk_res["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
        assert "weather_context" in risk_res
        print(f"✅ Risk Intelligence: OK (Risk Level: {risk_res['risk_level']}, Score: {risk_res['risk_score']})")

        # 9. Multilingual Farm Assistant
        # Telugu query
        r = client.post(
            "/api/v1/assistant/chat",
            json={"message": "ఈ రోజు మందు పిచికారీ చేయవచ్చా?", "language": "te"}
        )
        assert r.status_code == 200
        chat_te = r.json()
        assert len(chat_te["reply_text"]) > 10
        print(f"✅ Multilingual Assistant (Telugu): OK ({chat_te['detected_intent']})")

        # Hindi query
        r = client.post(
            "/api/v1/assistant/chat",
            json={"message": "क्या आज दवा छिड़कें?", "language": "hi"}
        )
        assert r.status_code == 200
        chat_hi = r.json()
        print(f"✅ Multilingual Assistant (Hindi): OK ({chat_hi['detected_intent']})")

        # 10. Expert Verification Queue & Confirm
        r = client.get("/api/v1/expert/queue?status=all")
        assert r.status_code == 200
        queue_items = r.json()
        assert len(queue_items) > 0
        target_id = queue_items[0]["id"]

        r = client.post(
            f"/api/v1/expert/verify/{target_id}",
            json={"confirmed_species_id": 1, "expert_notes": "Morphological wing check OK", "is_approved": True}
        )
        assert r.status_code == 200
        verify_res = r.json()
        assert verify_res["status"] == "SUCCESS"
        print(f"✅ Expert Verification & Retrain Logging: OK (Verified Sighting #{target_id})")

        # 11. GeoJSON and CSV Data Export
        r = client.get("/api/v1/export/geojson")
        assert r.status_code == 200
        geojson = r.json()
        assert geojson["type"] == "FeatureCollection"
        assert len(geojson["features"]) > 0
        print(f"✅ GeoJSON GIS Export: OK ({len(geojson['features'])} features exported)")

        r = client.get("/api/v1/export/csv")
        assert r.status_code == 200
        assert "species_name" in r.text
        print(f"✅ CSV Export: OK ({len(r.text.splitlines())} lines exported)")

        print("\n🎉 ALL 11 TEST SUITES PASSED FLAWLESSLY! 100% SUCCESS.")

if __name__ == "__main__":
    run_tests()
