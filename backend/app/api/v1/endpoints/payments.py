"""
Payment endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.rbac import require_client
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.registration import Registration
from app.models.payment import Payment
from app.models.event import Event
from app.schemas.payment import PaymentCreate, PaymentResponse, RazorpayOrderResponse
from app.services.razorpay_service import create_order, verify_payment_signature
from app.core.config import settings

router = APIRouter()


@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_payment_order(
    payment_data: PaymentCreate,
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for payment"""
    # Get registration
    registration = db.query(Registration).filter(
        Registration.id == payment_data.registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Check ownership
    if current_user.role == "client" and registration.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Check registration status
    if registration.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration must be accepted before payment"
        )
    
    # Check if already paid
    if registration.payment_status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment already completed"
        )
    
    # Get event
    event = registration.event
    if not event or not event.is_paid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event does not require payment"
        )
    
    # Create or get existing payment
    existing_payment = db.query(Payment).filter(
        Payment.registration_id == payment_data.registration_id,
        Payment.status.in_(["created", "paid"])
    ).first()
    
    if existing_payment:
        return RazorpayOrderResponse(
            order_id=existing_payment.razorpay_order_id,
            amount=existing_payment.amount,
            currency=existing_payment.currency,
            key=settings.RAZORPAY_KEY_ID
        )
    
    # Create Razorpay order
    order = create_order(
        amount=event.price,
        currency="INR",
        receipt=str(registration.id)
    )
    
    # Create payment record
    new_payment = Payment(
        registration_id=payment_data.registration_id,
        razorpay_order_id=order["id"],
        amount=event.price,
        currency="INR",
        status="created"
    )
    
    db.add(new_payment)
    registration.payment_order_id = order["id"]
    registration.payment_status = "pending"
    db.commit()
    
    return RazorpayOrderResponse(
        order_id=order["id"],
        amount=event.price,
        currency="INR",
        key=settings.RAZORPAY_KEY_ID
    )


@router.post("/verify")
async def verify_payment(
    order_id: str,
    payment_id: str,
    signature: str,
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Verify payment signature"""
    # Verify signature
    if not verify_payment_signature(order_id, payment_id, signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Get payment
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == order_id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Update payment
    payment.razorpay_payment_id = payment_id
    payment.razorpay_signature = signature
    payment.status = "paid"
    
    # Update registration
    registration = payment.registration
    registration.payment_id = payment_id
    registration.payment_status = "completed"
    
    db.commit()
    
    return {"message": "Payment verified successfully"}


@router.get("/my-payments", response_model=List[PaymentResponse])
async def get_my_payments(
    current_user: User = Depends(require_client),
    db: Session = Depends(get_db)
):
    """Get current user's payment history"""
    payments = db.query(Payment).join(Registration).filter(
        Registration.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).all()
    
    return payments


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhook"""
    from app.services.razorpay_service import verify_webhook_signature
    import json
    
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing signature"
        )
    
    # Verify webhook signature
    if not verify_webhook_signature(body.decode(), signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature"
        )
    
    # Parse webhook data
    webhook_data = json.loads(body.decode())
    event = webhook_data.get("event")
    payload = webhook_data.get("payload", {}).get("payment", {}).get("entity", {})
    
    if event == "payment.captured":
        payment_id = payload.get("id")
        order_id = payload.get("order_id")
        
        # Update payment
        payment = db.query(Payment).filter(
            Payment.razorpay_order_id == order_id
        ).first()
        
        if payment:
            payment.razorpay_payment_id = payment_id
            payment.status = "paid"
            payment.webhook_received = True
            payment.webhook_verified = True
            
            # Update registration
            registration = payment.registration
            registration.payment_id = payment_id
            registration.payment_status = "completed"
            
            db.commit()
    
    return {"status": "ok"}
