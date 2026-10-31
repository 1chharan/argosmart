from typing import Dict, Any, List
from app.schemas.schemas import AssistantChatRequest, AssistantChatResponse

INTENT_KNOWLEDGE_BASE = [
    {
        "keywords": ["spray", "మందు", "పిచికారీ", "छिड़काव", "स्प्रे", "today", "today spray"],
        "reply_en": "⚠️ Avoid chemical spraying today! Honeybees and beneficial ladybirds are actively foraging in your area. If you must spray organic neem oil, do it strictly after sunset (after 6 PM) when bees have returned to their hive.",
        "reply_te": "⚠️ ఈ రోజు రసాయన మందులు పిచికారీ చేయవద్దు! మీ ప్రాంతంలో తేనెటీగలు, మిత్ర పురుగులు పంటలో చురుగ్గా ఉన్నాయి. వేపనూనె లాంటి సేంద్రీయ మందు చల్లాలనుకుంటే సాయంత్రం 6 గంటల తర్వాత మాత్రమే చేయండి.",
        "reply_hi": "⚠️ आज रासायनिक छिड़काव बिल्कुल न करें! आपके खेत के आसपास मधुमक्खियां और मित्र कीट सक्रिय हैं। यदि जैविक नीम का तेल छिड़कना हो, तो शाम 6 बजे के बाद ही करें जब मधुमक्खियां छत्ते में लौट जाएं।",
        "actions": [
            "Check Pollinator Active Hours",
            "View Natural Neem Formula",
            "View Current Field Risk Score"
        ],
        "intent": "spray_recommendation"
    },
    {
        "keywords": ["bee", "తేనెటీగ", "తేనె", "मधुमक्खी", "pollinator", "honey"],
        "reply_en": "🐝 Honeybees are your best farming partners! They increase yield in pulses, sunflowers, cotton, and vegetables by 25-35%. Keep small bowls of fresh water near fields and plant marigold borders to attract them.",
        "reply_te": "🐝 తేనెటీగలు రైతుకు అమూల్యమైన మిత్రులు! ఇవి పత్తి, కూరగాయలు, పొద్దుతిరుగుడు పంటలలో 25% నుండి 35% వరకు దిగుబడి పెంచుతాయి. పొలం గట్లపై బంతి పూల మొక్కలు వేయండి.",
        "reply_hi": "🐝 मधुमक्खियां किसान की सबसे बड़ी मददगार हैं! ये फसलों में परागण कर 25-35% पैदावार बढ़ाती हैं। खेत की मेड़ों पर गेंदे के फूल लगाएं और पानी की व्यवस्था रखें।",
        "actions": [
            "How to Build Bee Friendly Borders",
            "Identify Nearby Pollinators",
            "Eco-Friendly Alternatives to Insecticides"
        ],
        "intent": "pollinator_conservation"
    },
    {
        "keywords": ["armyworm", "కత్తెర", "పురుగు", "कीट", "फॉल", "worm", "caterpillar", "maize"],
        "reply_en": "🌽 Fall armyworm detected in maize/corn! Act immediately: install 5 pheromone traps per acre, apply 5% Neem Seed Kernel Extract (NSKE), or drop sand and wood ash into the whorls of infested plants.",
        "reply_te": "🌽 మొక్కజొన్నలో కత్తెర పురుగు నివారణకు: ఎకరాకు 5 లింగాకర్షక బుట్టలు పెట్టండి. వేప గింజల కషాయం (5%) పిచికారీ చేయండి లేదా సున్నం, బూడిద మిశ్రమాన్ని సుడిలో వేయండి.",
        "reply_hi": "🌽 मक्के में फॉल आर्मीवॉर्म नियंत्रण: प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं। 5% नीम के बीज का अर्क छिड़कें या पौधे की पोंगी में राख डालें।",
        "actions": [
            "Install Pheromone Traps",
            "Prepare NSKE Extract",
            "Upload Photo for Expert Check"
        ],
        "intent": "pest_control"
    },
    {
        "keywords": ["ladybird", "సీతమ్మ", "లేడీబర్డ్", "भृंग", "aphid", "పేనుబంక", "माहू"],
        "reply_en": "🐞 Ladybird beetles (Seven-spot beetle) are apex predators! A single adult eats over 50 aphids and thrips a day. Never spray toxic insecticides when you spot these orange-red spotted beetles.",
        "reply_te": "🐞 సీతమ్మ పురుగు (లేడీబర్డ్) రైతుకు గొప్ప నేస్తం! ఇది రోజుకు 50 కంటే ఎక్కువ పేనుబంకలను తిని పంటను కాపాడుతుంది. వీటిని చూసినప్పుడు రసాయన మందులు వాడవద్దు.",
        "reply_hi": "🐞 लेडीबर्ड भृंग (सफेद चित्तीदार कीड़ा) माहू और थ्रिप्स का प्राकृतिक शिकारी है! यह रोज 50 से अधिक कीड़े खा जाता है। इसे कभी न मारें।",
        "actions": [
            "Identify Ladybird Stages",
            "Natural Biological Control Guide",
            "Share Sighting With Neighbors"
        ],
        "intent": "beneficial_identification"
    }
]

class MultilingualFarmAssistant:
    """
    Multilingual conversational AI farm assistant tailored for farmers.
    Handles voice transcriptions, intent detection, and localized spoken responses.
    """

    def process_query(self, req: AssistantChatRequest) -> AssistantChatResponse:
        user_text = req.message.lower()
        lang = req.language if req.language in ["te", "hi", "en"] else "te"

        matched = None
        for item in INTENT_KNOWLEDGE_BASE:
            for kw in item["keywords"]:
                if kw in user_text:
                    matched = item
                    break
            if matched:
                break

        if not matched:
            # Contextual fallback answering in selected language
            if lang == "te":
                reply = "నమస్కారం రైతు సోదరులారా! నేను అగ్రోస్మార్ట్ ఏఐ (AgroSmart AI) సహాయకుడిని. మీరు పురుగుల ఫోటో తీసి అప్‌లోడ్ చేయవచ్చు, పంట సమస్యలు అడగవచ్చు లేదా ఈ రోజు మందు పిచికారీ చేయవచ్చా అని తెలుసుకోవచ్చు."
                tts = reply
                actions = ["ఈ రోజు మందు చల్లవచ్చా?", "తేనెటీగలను ఎలా కాపాడుకోవాలి?", "పంట రోగం తనిఖీ చేయండి"]
            elif lang == "hi":
                reply = "नमस्ते किसान भाई! मैं एग्रोस्मार्ट एआई (AgroSmart AI) सहायक हूं। आप किसी भी कीट या फसल की समस्या की फोटो भेज सकते हैं, या पूछ सकते हैं कि आज कीटनाशक छिड़कना सही है या नहीं।"
                tts = reply
                actions = ["क्या आज दवा छिड़कें?", "मधुमक्खियों की रक्षा कैसे करें?", "फसल रोग की जांच करें"]
            else:
                reply = "Hello farmer friend! I am your AgroSmart AI Assistant. You can upload an insect or crop photo, ask about field risks, or check if it is safe to spray today."
                tts = reply
                actions = ["Can I spray today?", "How to attract honeybees?", "Diagnose leaf problem"]
            intent = "general_assistance"
        else:
            reply_key = f"reply_{lang}"
            reply = matched.get(reply_key, matched["reply_en"])
            tts = reply
            actions = matched["actions"]
            intent = matched["intent"]

        return AssistantChatResponse(
            reply_text=reply,
            audio_tts_text=tts,
            suggested_actions=actions,
            detected_intent=intent,
            language=lang
        )

assistant_service = MultilingualFarmAssistant()
