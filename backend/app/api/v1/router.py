"""
Main API router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, events, registrations, payments, admin, developer

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(registrations.router, prefix="/registrations", tags=["registrations"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(developer.router, prefix="/developer", tags=["developer"])
