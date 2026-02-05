"""
Payment model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_id = Column(UUID(as_uuid=True), ForeignKey("registrations.id", ondelete="CASCADE"), nullable=False, index=True)
    razorpay_order_id = Column(String(255), unique=True, nullable=False, index=True)
    razorpay_payment_id = Column(String(255), unique=True, nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    status = Column(String(20), nullable=False, index=True)  # created, paid, failed, refunded
    webhook_received = Column(Boolean, default=False)
    webhook_verified = Column(Boolean, default=False)
    metadata = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    registration = relationship("Registration", back_populates="payments")
