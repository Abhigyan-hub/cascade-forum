"""
Payment Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class PaymentCreate(BaseModel):
    registration_id: UUID


class PaymentResponse(BaseModel):
    id: UUID
    registration_id: UUID
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    amount: Decimal
    currency: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: Decimal
    currency: str
    key: str
