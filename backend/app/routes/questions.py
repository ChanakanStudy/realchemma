from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest
from app.services.question_service import get_oracle_response

router = APIRouter()

@router.post("/chat")
async def chat_with_oracle(request: ChatRequest):
    try:
        response = await get_oracle_response(request.prompt)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
