from fastapi import APIRouter
from app.services.assistant_service import assistant_service
from app.schemas.schemas import AssistantChatRequest, AssistantChatResponse

router = APIRouter(prefix="/assistant", tags=["Multilingual AI Farm Assistant"])

@router.post("/chat", response_model=AssistantChatResponse)
def chat_with_assistant(req: AssistantChatRequest):
    """
    Multilingual conversational AI farm assistant in English, Telugu, and Hindi.
    Answers farming questions ("Should I spray today?", "What is this insect?"),
    giving simple advice and spoken text-to-speech strings.
    """
    return assistant_service.process_query(req)
