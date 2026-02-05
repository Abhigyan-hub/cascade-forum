"""
Developer (Super Admin) endpoints - Full system access
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_developer
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.models.payment import Payment
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse
from app.schemas.event import EventResponse
from app.schemas.registration import RegistrationResponse
from app.schemas.payment import PaymentResponse
from app.schemas.audit_log import AuditLogResponse
from app.services.audit import log_admin_action

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    role: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all users"""
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/users/{user_id}/registrations", response_model=List[RegistrationResponse])
async def get_user_registrations(
    user_id: UUID,
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all registrations for a user"""
    registrations = db.query(Registration).filter(
        Registration.user_id == user_id
    ).order_by(Registration.created_at.desc()).all()
    
    result = []
    for reg in registrations:
        reg_dict = {
            **reg.__dict__,
            "event_title": reg.event.title if reg.event else None,
            "user_name": reg.user.full_name if reg.user else None
        }
        result.append(RegistrationResponse(**reg_dict))
    
    return result


@router.get("/users/{user_id}/payments", response_model=List[PaymentResponse])
async def get_user_payments(
    user_id: UUID,
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all payments for a user"""
    payments = db.query(Payment).join(Registration).filter(
        Registration.user_id == user_id
    ).order_by(Payment.created_at.desc()).all()
    
    return payments


@router.get("/events", response_model=List[EventResponse])
async def get_all_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all events"""
    events = db.query(Event).order_by(Event.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for event in events:
        event_dict = {
            **event.__dict__,
            "creator_name": event.creator.full_name if event.creator else None
        }
        result.append(EventResponse(**event_dict))
    
    return result


@router.get("/registrations", response_model=List[RegistrationResponse])
async def get_all_registrations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all registrations"""
    registrations = db.query(Registration).order_by(
        Registration.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    result = []
    for reg in registrations:
        reg_dict = {
            **reg.__dict__,
            "event_title": reg.event.title if reg.event else None,
            "user_name": reg.user.full_name if reg.user else None
        }
        result.append(RegistrationResponse(**reg_dict))
    
    return result


@router.get("/payments", response_model=List[PaymentResponse])
async def get_all_payments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get all payments"""
    payments = db.query(Payment).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    return payments


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    admin_id: Optional[UUID] = Query(None),
    action_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Get audit logs"""
    query = db.query(AuditLog)
    
    if admin_id:
        query = query.filter(AuditLog.admin_id == admin_id)
    
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for log in logs:
        log_dict = {
            **log.__dict__,
            "admin_name": log.admin.full_name if log.admin else None
        }
        result.append(AuditLogResponse(**log_dict))
    
    return result


@router.patch("/registrations/{registration_id}/override", response_model=RegistrationResponse)
async def override_registration(
    registration_id: UUID,
    registration_data: RegistrationUpdate,
    request: Request,
    current_user: User = Depends(require_developer),
    db: Session = Depends(get_db)
):
    """Override registration status (developer only)"""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    if not registration_data.status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )
    
    old_status = registration.status
    registration.status = registration_data.status
    
    # Update event participant count
    if registration_data.status == "accepted" and old_status != "accepted":
        registration.event.current_participants += 1
    elif old_status == "accepted" and registration_data.status != "accepted":
        registration.event.current_participants = max(0, registration.event.current_participants - 1)
    
    db.commit()
    db.refresh(registration)
    
    # Log override action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type=f"registration_override_{registration_data.status}",
        target_type="registration",
        target_id=registration.id,
        details={
            "old_status": old_status,
            "new_status": registration_data.status,
            "override": True
        },
        request=request
    )
    
    reg_dict = {
        **registration.__dict__,
        "event_title": registration.event.title if registration.event else None,
        "user_name": registration.user.full_name if registration.user else None
    }
    return RegistrationResponse(**reg_dict)
