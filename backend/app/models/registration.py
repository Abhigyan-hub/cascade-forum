"""
Registration model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Registration(Base):
    __tablename__ = "registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="pending", index=True)  # pending, accepted, rejected
    form_data = Column(JSONB, nullable=False)  # User's form submission
    payment_status = Column(String(20), default="not_required", index=True)  # not_required, pending, completed, failed, refunded
    payment_order_id = Column(String(255), nullable=True)
    payment_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Unique constraint: one registration per user per event
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="unique_event_user_registration"),)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    user = relationship("User")
    payments = relationship("Payment", back_populates="registration", cascade="all, delete-orphan")
