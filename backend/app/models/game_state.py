import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, UniqueConstraint

from app.core.database import Base


class UserGameState(Base):
    __tablename__ = "user_game_states"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_uuid = Column(String(36), nullable=True, index=True)
    inventory_json = Column(JSON, nullable=False)
    discovered_json = Column(JSON, nullable=False)
    discovered_compounds_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_uuid", name="uq_user_game_state_uuid"),
    )