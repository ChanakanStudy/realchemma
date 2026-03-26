from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    prompt: str

class ChatMessage(BaseModel):
    role: str
    content: str

class NPCChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None
