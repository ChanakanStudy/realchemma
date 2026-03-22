from fastapi import APIRouter, HTTPException
from app.models.schemas import NPCChatRequest
from app.services.npc_service import get_npc_response

router = APIRouter()

@router.post("/npc-chat")
async def chat_with_npc(request: NPCChatRequest):
    """
    Chat with the NPC Lab Assistant.
    Accepts message and conversation history.
    """
    try:
        # Convert ChatMessage objects to dict if needed
        history = None
        if request.history:
            history = [{"role": msg.role, "content": msg.content} for msg in request.history]
        
        response = await get_npc_response(request.message, history)
        return {"reply": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
