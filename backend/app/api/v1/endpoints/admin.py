"""
Admin endpoints - Event creation and registration management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_admin
from app.models.user import User
from app.models.event import Event
from app.models.registration import Registration
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.schemas.registration import RegistrationResponse, RegistrationUpdate
from app.services.audit import log_admin_action

router = APIRouter()


@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    new_event = Event(
        **event_data.model_dump(),
        created_by=current_user.id
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="event_created",
        target_type="event",
        target_id=new_event.id,
        details={"title": new_event.title},
        request=request
    )
    
    event_dict = {
        **new_event.__dict__,
        "creator_name": current_user.full_name
    }
    return EventResponse(**event_dict)


@router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: UUID,
    event_data: EventUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update an event (only creator or developer)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Admins can only update their own events
    if current_user.role == "admin" and event.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update events you created"
        )
    
    # Update event
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type="event_updated",
        target_type="event",
        target_id=event.id,
        details=update_data,
        request=request
    )
    
    event_dict = {
        **event.__dict__,
        "creator_name": event.creator.full_name if event.creator else None
    }
    return EventResponse(**event_dict)


@router.get("/events/my-events", response_model=List[EventResponse])
async def get_my_events(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get events created by current admin"""
    query = db.query(Event).filter(Event.created_by == current_user.id)
    
    # Developers can see all events
    if current_user.role == "developer":
        query = db.query(Event)
    
    events = query.order_by(Event.created_at.desc()).all()
    
    result = []
    for event in events:
        event_dict = {
            **event.__dict__,
            "creator_name": event.creator.full_name if event.creator else None
        }
        result.append(EventResponse(**event_dict))
    
    return result


@router.get("/events/{event_id}/registrations", response_model=List[RegistrationResponse])
async def get_event_registrations(
    event_id: UUID,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get registrations for an event (only creator or developer)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Admins can only see registrations for their own events
    if current_user.role == "admin" and event.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view registrations for events you created"
        )
    
    registrations = db.query(Registration).filter(
        Registration.event_id == event_id
    ).order_by(Registration.created_at.desc()).all()
    
    result = []
    for reg in registrations:
        reg_dict = {
            **reg.__dict__,
            "event_title": event.title,
            "user_name": reg.user.full_name if reg.user else None
        }
        result.append(RegistrationResponse(**reg_dict))
    
    return result


@router.patch("/registrations/{registration_id}", response_model=RegistrationResponse)
async def update_registration_status(
    registration_id: UUID,
    registration_data: RegistrationUpdate,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Accept or reject a registration (only event creator or developer)"""
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Admins can only manage registrations for their own events
    if current_user.role == "admin" and registration.event.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage registrations for events you created"
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
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_user.id,
        action_type=f"registration_{registration_data.status}",
        target_type="registration",
        target_id=registration.id,
        details={
            "old_status": old_status,
            "new_status": registration_data.status,
            "event_id": str(registration.event_id),
            "user_id": str(registration.user_id)
        },
        request=request
    )
    
    reg_dict = {
        **registration.__dict__,
        "event_title": registration.event.title if registration.event else None,
        "user_name": registration.user.full_name if registration.user else None
    }
    return RegistrationResponse(**reg_dict)
