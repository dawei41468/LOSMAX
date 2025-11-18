from fastapi import APIRouter, Depends, HTTPException, status
from services.notification_service import NotificationService
from services.reminder_service import ReminderService
from models.notification import PushSubscription, PushSubscriptionInDB, NotificationRequest
from services.auth_service import get_current_user
from models.user import UserInDB
from typing import Optional

router = APIRouter()

@router.post("/subscribe", response_model=PushSubscriptionInDB)
async def subscribe_to_notifications(
    subscription: PushSubscription,
    current_user: UserInDB = Depends(get_current_user)
):
    """Subscribe user to push notifications"""
    try:
        user_id = str(current_user.id)
        saved_subscription = await NotificationService.save_push_subscription(user_id, subscription)
        return saved_subscription
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save push subscription: {str(e)}"
        )

@router.get("/subscription", response_model=Optional[PushSubscriptionInDB])
async def get_push_subscription(
    current_user: UserInDB = Depends(get_current_user)
):
    """Get user's push subscription"""
    try:
        user_id = str(current_user.id)
        subscription = await NotificationService.get_push_subscription(user_id)
        return subscription
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get push subscription: {str(e)}"
        )

@router.delete("/unsubscribe")
async def unsubscribe_from_notifications(
    current_user: UserInDB = Depends(get_current_user)
):
    """Unsubscribe user from push notifications"""
    try:
        user_id = str(current_user.id)
        success = await NotificationService.delete_push_subscription(user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No push subscription found to delete"
            )
        return {"message": "Successfully unsubscribed from notifications"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsubscribe from notifications: {str(e)}"
        )

@router.post("/send-test")
async def send_test_notification(
    current_user: UserInDB = Depends(get_current_user)
):
    """Send a test notification to the current user"""
    try:
        user_id = str(current_user.id)
        request = NotificationRequest(
            user_id=user_id,
            title="Test Notification",
            body="This is a test notification from LOS!",
            icon="/losicon.svg",
            tag="test-notification"
        )

        success = await NotificationService.send_notification(request)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test notification"
            )

        return {"message": "Test notification sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test notification: {str(e)}"
        )

@router.post("/test-morning-reminder")
async def test_morning_reminder(
    current_user: UserInDB = Depends(get_current_user)
):
    """Send a test morning reminder to the current user"""
    try:
        user_id = str(current_user.id)
        success = await ReminderService.send_test_reminder(user_id, "morning")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test morning reminder"
            )

        return {"message": "Test morning reminder sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test morning reminder: {str(e)}"
        )

@router.post("/test-evening-reminder")
async def test_evening_reminder(
    current_user: UserInDB = Depends(get_current_user)
):
    """Send a test evening reminder to the current user"""
    try:
        user_id = str(current_user.id)
        success = await ReminderService.send_test_reminder(user_id, "evening")
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send test evening reminder"
            )

        return {"message": "Test evening reminder sent successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test evening reminder: {str(e)}"
        )