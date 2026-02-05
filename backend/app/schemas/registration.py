"""
Registration Pydantic schemas
"""
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
from uuid import UUID


class RegistrationBase(BaseModel):
    form_data: Dict[str, Any]


class RegistrationCreate(RegistrationBase):
    event_id: UUID


class RegistrationUpdate(BaseModel):
    status: Optional[str] = None  # pending, accepted, rejected


class RegistrationResponse(RegistrationBase):
    id: UUID
    event_id: UUID
    user_id: UUID
    status: str
    payment_status: str
    payment_order_id: Optional[str] = None
    payment_id: Optional[str] = None
    event_title: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
