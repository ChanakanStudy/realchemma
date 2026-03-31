import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint

from app.core.database import Base


class QuestDefinition(Base):
    __tablename__ = "quest_definitions"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    objective = Column(String, nullable=False)
    npc_id = Column(String, nullable=False, index=True)
    boss_id = Column(String, nullable=False, index=True)
    boss_name = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, unique=True, index=True)
    reward_xp = Column(Integer, nullable=False, default=100)
    intro_text = Column(String, nullable=False)
    completion_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class UserQuestProgress(Base):
    __tablename__ = "user_quest_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quest_id = Column(String, ForeignKey("quest_definitions.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, nullable=False, default="locked", index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "quest_id", name="uq_user_quest_progress"),
    )