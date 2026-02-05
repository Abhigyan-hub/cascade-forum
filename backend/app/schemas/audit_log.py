"""
Audit log Pydantic schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class AuditLogResponse(BaseModel):
    id: UUID
    admin_id: UUID
    admin_name: Optional[str] = None
    action_type: str
    target_type: str
    target_id: UUID
    details: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
