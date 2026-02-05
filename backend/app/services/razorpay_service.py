"""
Razorpay payment service
"""
import razorpay
import hmac
import hashlib
from decimal import Decimal
from typing import Dict, Any

from app.core.config import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def create_order(amount: Decimal, currency: str = "INR", receipt: str = None) -> Dict[str, Any]:
    """Create a Razorpay order"""
    data = {
        "amount": int(amount * 100),  # Convert to paise
        "currency": currency,
    }
    if receipt:
        data["receipt"] = receipt
    
    order = client.order.create(data=data)
    return order


def verify_webhook_signature(payload: str, signature: str) -> bool:
    """Verify Razorpay webhook signature"""
    try:
        client.utility.verify_webhook_signature(
            payload,
            signature,
            settings.RAZORPAY_WEBHOOK_SECRET
        )
        return True
    except Exception:
        return False


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature"""
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        return True
    except Exception:
        return False


def get_payment_details(payment_id: str) -> Dict[str, Any]:
    """Get payment details from Razorpay"""
    return client.payment.fetch(payment_id)
