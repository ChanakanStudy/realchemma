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

class InventoryItem(BaseModel):
    id: str
    quantity: int

class QuestItem(BaseModel):
    id: str
    title: str
    status: str
    objective: str

class UserProfile(BaseModel):
    userId: str = "default_student"
    level: int
    xp: int
    nextLevelXP: int
    hp: int
    mp: int
    inventory: List[InventoryItem]
    quests: List[QuestItem]
    discovered: List[str]
    stats: Optional[dict] = None
