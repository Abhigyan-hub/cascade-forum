"""
Event endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_client
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter()


@router.get("/public", response_model=List[EventResponse])
async def get_public_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get published events (public endpoint, no authentication required)"""
    events = db.query(Event).filter(
        Event.status == "published"
    ).order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    
    # Add creator name
    result = []
    for event in events:
        event_dict = {
            **event.__dict__,
            "creator_name": event.creator.full_name if event.creator else None
        }
        result.append(EventResponse(**event_dict))
    
    return result


@router.get("/public/{event_id}", response_model=EventResponse)
async def get_public_event(
    event_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a published event (public endpoint, no authentication required)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Only show published events publicly
    if event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event_dict = {
        **event.__dict__,
        "creator_name": event.creator.full_name if event.creator else None
    }
    return EventResponse(**event_dict)


@router.get("", response_model=List[EventResponse])
async def get_events(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Get all events (clients see published, admins/developers see all)"""
    query = db.query(Event)
    
    # Clients only see published events
    if current_user.role == "client":
        query = query.filter(Event.status == "published")
    elif status_filter:
        query = query.filter(Event.status == status_filter)
    
    events = query.order_by(Event.event_date.desc()).offset(skip).limit(limit).all()
    
    # Add creator name
    result = []
    for event in events:
        event_dict = {
            **event.__dict__,
            "creator_name": event.creator.full_name if event.creator else None
        }
        result.append(EventResponse(**event_dict))
    
    return result


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Get a specific event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Clients can only see published events
    if current_user.role == "client" and event.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event_dict = {
        **event.__dict__,
        "creator_name": event.creator.full_name if event.creator else None
    }
    return EventResponse(**event_dict)
