from typing import List, Optional

from pydantic import BaseModel, Field


class InventoryItemOut(BaseModel):
    id: str
    quantity: int


class LabRecipeOut(BaseModel):
    id: str
    name: str
    damage: int
    status: str
    color: str
    desc: str


class GameStateResponse(BaseModel):
    user_id: int
    inventory: List[InventoryItemOut] = Field(default_factory=list)
    discovered: List[str] = Field(default_factory=list)
    discovered_compounds: List[str] = Field(default_factory=list)


class LabExperimentRequest(BaseModel):
    selected_symbols: List[str] = Field(default_factory=list)


class InventoryChange(BaseModel):
    id: str
    quantity: int


class InventoryAdjustRequest(BaseModel):
    changes: List[InventoryChange] = Field(default_factory=list)


class LabExperimentResponse(GameStateResponse):
    success: bool
    message: str
    recipe: Optional[LabRecipeOut] = None