"""
Audit logging service
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.audit_log import AuditLog
from uuid import UUID


def log_admin_action(
    db: Session,
    admin_id: UUID,
    action_type: str,
    target_type: str,
    target_id: UUID,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None
):
    """Log an admin action to audit log"""
    audit_log = AuditLog(
        admin_id=admin_id,
        action_type=action_type,
        target_type=target_type,
        target_id=target_id,
        details=details or {},
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None,
    )
    db.add(audit_log)
    db.commit()
    return audit_log
