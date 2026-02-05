"""
Registration endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_client
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.schemas.registration import RegistrationCreate, RegistrationResponse

router = APIRouter()


@router.post("", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def create_registration(
    registration_data: RegistrationCreate,
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Register for an event"""
    # Get event
    event = db.query(Event).filter(Event.id == registration_data.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check if event is published
    if event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is not available for registration"
        )
    
    # Check if already registered
    existing_registration = db.query(Registration).filter(
        Registration.event_id == registration_data.event_id,
        Registration.user_id == current_user.id
    ).first()
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this event"
        )
    
    # Check registration deadline
    from datetime import datetime, timezone
    if datetime.now(timezone.utc) > event.registration_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration deadline has passed"
        )
    
    # Check max participants
    if event.max_participants and event.current_participants >= event.max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is full"
        )
    
    # Create registration
    new_registration = Registration(
        event_id=registration_data.event_id,
        user_id=current_user.id,
        form_data=registration_data.form_data,
        payment_status="not_required" if not event.is_paid else "pending"
    )
    
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    
    registration_dict = {
        **new_registration.__dict__,
        "event_title": event.title,
        "user_name": current_user.full_name
    }
    return RegistrationResponse(**registration_dict)


@router.get("/my-registrations", response_model=List[RegistrationResponse])
async def get_my_registrations(
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Get current user's registrations"""
    registrations = db.query(Registration).filter(
        Registration.user_id == current_user.id
    ).order_by(Registration.created_at.desc()).all()
    
    result = []
    for reg in registrations:
        reg_dict = {
            **reg.__dict__,
            "event_title": reg.event.title if reg.event else None,
            "user_name": current_user.full_name
        }
        result.append(RegistrationResponse(**reg_dict))
    
    return result


@router.get("/{registration_id}", response_model=RegistrationResponse)
async def get_registration(
    registration_id: UUID,
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Get a specific registration"""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Users can only see their own registrations (unless admin/developer)
    if current_user.role == "client" and registration.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    reg_dict = {
        **registration.__dict__,
        "event_title": registration.event.title if registration.event else None,
        "user_name": registration.user.full_name if registration.user else None
    }
    return RegistrationResponse(**reg_dict)
