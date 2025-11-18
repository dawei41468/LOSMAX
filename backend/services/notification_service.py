import os
from database import get_db
from models.notification import PushSubscription, PushSubscriptionInDB, NotificationRequest
from bson import ObjectId
from fastapi import HTTPException, status
import json
from datetime import datetime
try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

class NotificationService:
    @staticmethod
    async def save_push_subscription(user_id: str, subscription: PushSubscription) -> PushSubscriptionInDB:
        db = await get_db()

        # Check if user already has a subscription
        existing = await db.push_subscriptions.find_one({"user_id": user_id})

        subscription_data = {
            "user_id": user_id,
            "endpoint": subscription.endpoint,
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
            "updated_at": datetime.utcnow()
        }

        if existing:
            # Update existing subscription
            await db.push_subscriptions.update_one(
                {"user_id": user_id},
                {"$set": subscription_data}
            )
            subscription_data["id"] = str(existing["_id"])
        else:
            # Create new subscription
            result = await db.push_subscriptions.insert_one(subscription_data)
            subscription_data["id"] = str(result.inserted_id)

        return PushSubscriptionInDB(**subscription_data)

    @staticmethod
    async def get_push_subscription(user_id: str):
        db = await get_db()
        subscription = await db.push_subscriptions.find_one({"user_id": user_id})

        if not subscription:
            return None

        return PushSubscriptionInDB(
            id=str(subscription["_id"]),
            user_id=subscription["user_id"],
            endpoint=subscription["endpoint"],
            p256dh=subscription["p256dh"],
            auth=subscription["auth"],
            created_at=subscription.get("created_at", datetime.utcnow()),
            updated_at=subscription.get("updated_at", datetime.utcnow())
        )

    @staticmethod
    async def delete_push_subscription(user_id: str) -> bool:
        db = await get_db()
        result = await db.push_subscriptions.delete_one({"user_id": user_id})
        return result.deleted_count > 0

    @staticmethod
    async def send_notification(request: NotificationRequest) -> bool:
        """
        Send push notification to a user.
        Note: VAPID keys need to be configured for this to work.
        """
        if webpush is None:
            print("Warning: pywebpush not installed. Install with: pip install pywebpush")
            return False

        try:
            # Get user's push subscription
            subscription = await NotificationService.get_push_subscription(request.user_id)
            if not subscription:
                print(f"No push subscription found for user {request.user_id}")
                return False

            # Prepare the subscription dict for webpush
            webpush_subscription = {
                "endpoint": subscription.endpoint,
                "keys": {
                    "p256dh": subscription.p256dh,
                    "auth": subscription.auth
                }
            }

            # Prepare notification payload
            payload = json.dumps({
                "title": request.title,
                "body": request.body,
                "icon": request.icon or "/losicon.svg",
                "badge": request.badge or "/losicon.svg",
                "tag": request.tag or "los-reminder"
            })

            # Send the notification
            webpush(
                subscription_info=webpush_subscription,
                data=payload,
                vapid_private_key=os.getenv("VAPID_PRIVATE_KEY"),
                vapid_claims={"sub": os.getenv("VAPID_CLAIM_EMAIL")}
            )

            return True

        except WebPushException as e:
            print(f"Push notification failed: {e}")
            return False
        except Exception as e:
            print(f"Error sending notification: {e}")
            return False