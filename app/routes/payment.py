"""
Payment routes — Razorpay integration (TEST MODE / DEMO MODE)
POST /api/payment/create-order  → creates Razorpay order (or demo order)
POST /api/payment/verify        → verifies signature + upgrades user
POST /api/payment/demo-upgrade  → instant upgrade for demo/dev (no Razorpay)
"""
import os
import hmac
import hashlib
import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.models import get_db, User

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# ── Razorpay keys from env ─────────────────────────────────────────────────────
RZP_KEY_ID     = os.getenv("RAZORPAY_KEY_ID",    "rzp_test_REPLACE_ME")
RZP_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "REPLACE_ME_SECRET")

PREMIUM_AMOUNT_PAISE = 99900   # Rs.999 in paise

# Demo mode: activated when placeholder keys are found
IS_DEMO_MODE = "REPLACE_ME" in RZP_KEY_ID or "REPLACE_ME" in RZP_KEY_SECRET


def _try_rzp_client():
    """Try to get a Razorpay client. Returns None if unavailable."""
    try:
        import razorpay
        return razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))
    except Exception:
        return None


def _make_demo_order(user_id: int, message: str) -> dict:
    return {
        "order_id": f"demo_order_{user_id}_{int(time.time())}",
        "amount":   PREMIUM_AMOUNT_PAISE,
        "currency": "INR",
        "key_id":   "DEMO_MODE",
        "demo":     True,
        "message":  message,
    }


# ── Create Order ──────────────────────────────────────────────────────────────
@router.post("/create-order")
def create_order(current_user: dict = Depends(get_current_user)):
    """
    Creates a Razorpay order. Falls back to demo mode if keys are not configured.
    In demo mode, returns a mock order that can be instantly activated.
    """
    if IS_DEMO_MODE:
        return _make_demo_order(
            current_user["id"],
            "Demo mode: no real payment required. Click 'Demo Upgrade' to activate Premium."
        )

    client = _try_rzp_client()
    if not client:
        return _make_demo_order(current_user["id"], "Razorpay not installed. Demo mode active.")

    try:
        order = client.order.create({
            "amount":   PREMIUM_AMOUNT_PAISE,
            "currency": "INR",
            "receipt":  f"user_{current_user['id']}_premium",
            "notes":    {"user_id": str(current_user["id"])},
        })
        return {
            "order_id": order["id"],
            "amount":   order["amount"],
            "currency": order["currency"],
            "key_id":   RZP_KEY_ID,
            "demo":     False,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not create order: {e}")


# ── Demo Instant Upgrade (no real payment) ────────────────────────────────────
@router.post("/demo-upgrade")
def demo_upgrade(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Instantly upgrades user to Premium — for demo/dev mode only."""
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.plan_type = "premium"
    db.commit()
    return {
        "success":   True,
        "message":   "Demo upgrade successful! You are now Premium!",
        "plan_type": "premium",
    }


# ── Verify Real Razorpay Payment + upgrade ────────────────────────────────────
class VerifyRequest(BaseModel):
    razorpay_order_id:   str
    razorpay_payment_id: str
    razorpay_signature:  str


@router.post("/verify")
def verify_payment(
    body: VerifyRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verifies Razorpay HMAC signature and upgrades user to Premium."""
    # Demo order — skip signature check, just upgrade
    if body.razorpay_order_id.startswith("demo_order_"):
        user = db.query(User).filter(User.id == current_user["id"]).first()
        if user:
            user.plan_type = "premium"
            db.commit()
        return {"success": True, "message": "Demo payment verified. You are now Premium!"}

    # Real Razorpay HMAC-SHA256 signature verification
    msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}"
    expected = hmac.new(
        RZP_KEY_SECRET.encode(), msg.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, body.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    user = db.query(User).filter(User.id == current_user["id"]).first()
    if user:
        user.plan_type = "premium"
        db.commit()

    return {"success": True, "message": "Payment verified. You are now Premium!"}
