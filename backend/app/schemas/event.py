"""
Event Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    registration_deadline: datetime
    is_paid: bool = False
    price: Decimal = Decimal("0.00")
    max_participants: Optional[int] = None
    status: str = "draft"
    form_schema: Optional[Dict[str, Any]] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    is_paid: Optional[bool] = None
    price: Optional[Decimal] = None
    max_participants: Optional[int] = None
    status: Optional[str] = None
    form_schema: Optional[Dict[str, Any]] = None


class EventResponse(EventBase):
    id: UUID
    current_participants: int
    created_by: UUID
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
