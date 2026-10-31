from app.schemas.schemas import PlantDoctorResponse

PLANT_DISEASE_KB = [
    {
        "keywords": ["blast", "paddy", "rice", "leaf blast"],
        "diagnosis_name_en": "Rice Leaf Blast (Magnaporthe oryzae)",
        "diagnosis_name_te": "వరి అగ్గితెగులు (బ్లాస్ట్ వ్యాధి)",
        "diagnosis_name_hi": "धान का झुलसा रोग (ब्लास्ट)",
        "confidence": 92.4,
        "severity": "High",
        "explanation_en": "Fungal infection causing spindle-shaped lesions with grey centers. Highly active in humid, cloudy weather.",
        "explanation_te": "శిలీంధ్రం వల్ల ఆకులపై కదురు ఆకారపు మచ్చలు ఏర్పడతాయి. తేమతో కూడిన వాతావరణంలో ఇది వేగంగా వ్యాపిస్తుంది.",
        "explanation_hi": "फफूंद जनित रोग जिससे पत्तियों पर आंख के आकार के धब्बे बनते हैं। आर्द्र मौसम में तेजी से फैलता है।",
        "organic_treatment_steps": [
            "Spray 5% Cow urine and Fermented Buttermilk concoction (10 liters cow urine + 2 liters sour buttermilk per 100L water).",
            "Apply Trichoderma viride bio-fungicide @ 5g/liter along with organic manure.",
            "Avoid excessive chemical nitrogen (urea) fertilizers which promote fungal outbreak."
        ],
        "pollinator_warning_en": "⚠️ POLLINATOR CAUTION: If spraying any bio-control or organic fungicide, spray ONLY late in the evening after 5:30 PM when honeybees and pollinators have returned to their hives.",
        "pollinator_warning_te": "⚠️ మిత్రపురుగుల హెచ్చరిక: సాయంత్రం 5:30 తర్వాత మాత్రమే పిచికారీ చేయండి, ఎందుకంటే తేనెటీగలు గూటికి చేరి ఉంటాయి.",
        "pollinator_warning_hi": "⚠️ परागण मित्र सुरक्षा: कोई भी छिड़काव शाम 5:30 बजे के बाद ही करें जब मधुमक्खियां अपने छत्ते में लौट चुकी हों।"
    },
    {
        "keywords": ["curl", "chilli", "cotton", "leaf curl", "virus"],
        "diagnosis_name_en": "Chilli Leaf Curl Virus (Gemini Virus transmitted by Whitefly)",
        "diagnosis_name_te": "మిరప ఆకు ముడత తెగులు (తెల్లదోమ వ్యాప్తి)",
        "diagnosis_name_hi": "मिर्च का पर्ण कुंचन रोग (पत्ता मरोड़)",
        "confidence": 94.1,
        "severity": "Medium",
        "explanation_en": "Leaves curl upward and cup inward, stunting plant growth. Transmitted by sucking whiteflies.",
        "explanation_te": "ఆకులు పైకి ముడుచుకుపోయి మొక్క ఎదుగుదల ఆగిపోతుంది. తెల్లదోమ ఈ వైరస్‌ను వ్యాపింపజేస్తుంది.",
        "explanation_hi": "पत्तियां ऊपर की ओर मुड़ जाती हैं और पौधा बौना रह जाता है। यह सफेद मक्खी द्वारा फैलता है।",
        "organic_treatment_steps": [
            "Install 15-20 Yellow Sticky Traps per acre to trap transmitting whiteflies.",
            "Spray Neem Seed Kernel Extract (NSKE 5%) or 10,000 ppm Neem Oil at 2ml/liter.",
            "Spray 'Agniastra' (organic herbal decoction of neem, garlic, chilli and cow urine)."
        ],
        "pollinator_warning_en": "🚨 STRICT WARNING: DO NOT spray synthetic Imidacloprid or Neonicotinoids! These chemicals are proven killers of honeybees and will destroy natural Ladybird predators.",
        "pollinator_warning_te": "🚨 అత్యవసర హెచ్చరిక: రసాయన నియోనికోటినాయిడ్ మందులు చల్లవద్దు! అవి తేనెటీగలు మరియు సీతమ్మ పురుగులను చంపేస్తాయి.",
        "pollinator_warning_hi": "🚨 सख्त चेतावनी: रासायनिक इमिडाक्लोप्रिड का छिड़काव न करें! यह मधुमक्खियों और मित्र कीड़ों के लिए जानलेवा है।"
    },
    {
        "keywords": ["spot", "cercospora", "cotton", "groundnut", "tikka"],
        "diagnosis_name_en": "Tikka Leaf Spot / Cercospora (Groundnut & Pulses)",
        "diagnosis_name_te": "వేరుశనగ తిక్కా ఆకుమచ్చ తెగులు",
        "diagnosis_name_hi": "मूंगफली का टिक्का रोग",
        "confidence": 89.8,
        "severity": "Medium",
        "explanation_en": "Dark brown circular spots with yellow halos on lower leaves causing premature leaf defoliation.",
        "explanation_te": "ఆకులపై నల్లటి గుండ్రని మచ్చలు ఏర్పడి ఆకులు రాలిపోతాయి. దిగుబడి తగ్గుతుంది.",
        "explanation_hi": "पत्तियों पर पीले घेरे वाले गहरे भूरे धब्बे बनते हैं, जिससे पत्तियां झड़ जाती हैं।",
        "organic_treatment_steps": [
            "Spray 2% Panchagavya solution (200ml per 10 liters water) to boost leaf immunity.",
            "Use bio-control agent Pseudomonas fluorescens @ 5g/liter.",
            "Maintain proper field drainage and remove heavily infected crop debris."
        ],
        "pollinator_warning_en": "⚠️ POLLINATOR CAUTION: Beneficial ground beetles and predatory spiders inhabit the soil. Avoid drenching soil with toxic chemicals.",
        "pollinator_warning_te": "⚠️ హెచ్చరిక: నేలలో ఉండే మిత్ర పురుగులు, సాలెపురుగులను కాపాడటానికి విష రసాయనాలు వాడవద్దు.",
        "pollinator_warning_hi": "⚠️ ध्यान दें: मिट्टी में रहने वाले शिकारी मित्र कीटों की सुरक्षा के लिए जहरीले रसायनों से बचें।"
    }
]

class PlantDoctorService:
    """
    AI Plant Doctor providing rapid diagnosis, zero-cost or low-cost
    natural treatments (Jeevamrutha, Neem, Panchagavya), and pollinator safety warnings.
    """

    def diagnose_crop(self, crop_name: str = "Paddy", symptoms: str = None, filename: str = None) -> PlantDoctorResponse:
        symptom_text = f"{crop_name} {symptoms or ''} {filename or ''}".lower()
        
        selected = PLANT_DISEASE_KB[0]
        for kb_item in PLANT_DISEASE_KB:
            for kw in kb_item["keywords"]:
                if kw in symptom_text:
                    selected = kb_item
                    break

        return PlantDoctorResponse(
            diagnosis_name_en=selected["diagnosis_name_en"],
            diagnosis_name_te=selected["diagnosis_name_te"],
            diagnosis_name_hi=selected["diagnosis_name_hi"],
            confidence=selected["confidence"],
            severity=selected["severity"],
            explanation_en=selected["explanation_en"],
            explanation_te=selected["explanation_te"],
            explanation_hi=selected["explanation_hi"],
            organic_treatment_steps=selected["organic_treatment_steps"],
            pollinator_warning_en=selected["pollinator_warning_en"],
            pollinator_warning_te=selected["pollinator_warning_te"],
            pollinator_warning_hi=selected["pollinator_warning_hi"]
        )

plant_doctor_service = PlantDoctorService()
