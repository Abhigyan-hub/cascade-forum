"""
Event model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(String, nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=False, index=True)
    registration_deadline = Column(DateTime(timezone=True), nullable=False)
    is_paid = Column(Boolean, default=False)
    price = Column(Numeric(10, 2), default=0.00)
    max_participants = Column(Integer, nullable=True)
    current_participants = Column(Integer, default=0)
    status = Column(String(20), default="draft", index=True)  # draft, published, cancelled, completed
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    form_schema = Column(JSONB, nullable=True)  # Dynamic form schema
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")
