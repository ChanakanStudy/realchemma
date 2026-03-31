from typing import List, Literal, Optional

from pydantic import BaseModel, Field

QuestStatus = Literal["locked", "available", "active", "completed"]


class QuestOut(BaseModel):
    id: str
    title: str
    description: str
    objective: str
    npc_id: str
    boss_id: str
    boss_name: str
    order_index: int
    reward_xp: int
    intro_text: str
    completion_text: str
    status: QuestStatus


class QuestStateResponse(BaseModel):
    user_id: int
    quests: List[QuestOut]
    active_quest: Optional[QuestOut] = None
    available_quests: List[QuestOut] = Field(default_factory=list)
    completed_quests: List[QuestOut] = Field(default_factory=list)
    quest_chain_complete: bool = False


class QuestCompleteRequest(BaseModel):
    quest_id: str
    boss_id: str