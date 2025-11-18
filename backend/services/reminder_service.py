from datetime import datetime, timedelta
from services.notification_service import NotificationService
from models.notification import NotificationRequest
from database import get_db
from typing import List, Optional

class ReminderService:
    @staticmethod
    async def get_users_for_reminder(reminder_type: str) -> List[str]:
        """
        Get list of user IDs who should receive a reminder notification.
        reminder_type: 'morning' or 'evening'
        """
        db = await get_db()

        # Build query for users with notifications enabled and valid deadlines
        query: dict = {
            "notifications_enabled": True
        }

        if reminder_type == "morning":
            query["morning_deadline"] = {"$exists": True, "$ne": None}
        elif reminder_type == "evening":
            query["evening_deadline"] = {"$exists": True, "$ne": None}
        else:
            return []

        # Get users with valid deadline preferences
        users = await db.users.find(query).to_list(None)

        current_time = datetime.utcnow()
        eligible_users = []

        for user in users:
            deadline_time = None

            if reminder_type == "morning":
                deadline_time = await ReminderService.parse_deadline_time(user.get("morning_deadline"))
            elif reminder_type == "evening":
                deadline_time = await ReminderService.parse_deadline_time(user.get("evening_deadline"))

            if deadline_time:
                # Validate that morning deadlines are before noon and evening deadlines are after noon
                if reminder_type == "morning" and deadline_time.hour >= 12:
                    continue
                elif reminder_type == "evening" and deadline_time.hour < 12:
                    continue

                # Check if current time is within 15 minutes before the deadline
                reminder_time = deadline_time - timedelta(minutes=15)

                # Handle case where reminder time is on the next day (e.g., evening deadline at 10 PM, reminder at 9:45 PM same day)
                if reminder_time.date() == current_time.date() or (
                    reminder_time.date() > current_time.date() and
                    abs((reminder_time - current_time).total_seconds()) < 900  # Within 15 minutes
                ):
                    time_diff = abs((reminder_time - current_time).total_seconds())
                    if time_diff <= 900:  # Within 15 minutes window
                        eligible_users.append(user["_id"])

        return [str(user_id) for user_id in eligible_users]

    @staticmethod
    async def parse_deadline_time(deadline_str: Optional[str]) -> Optional[datetime]:
        """
        Parse deadline string like '09:00 AM' or '10:00 PM' into datetime object
        """
        if not deadline_str:
            return None

        try:
            # Handle AM/PM format
            current_date = datetime.utcnow().date()

            # Simple parsing for HH:MM AM/PM format
            parts = deadline_str.strip().split()
            if len(parts) != 2:
                return None

            time_part, ampm = parts
            hour_minute = time_part.split(':')
            if len(hour_minute) != 2:
                return None

            hour = int(hour_minute[0])
            minute = int(hour_minute[1])

            # Convert 12-hour to 24-hour format
            if ampm.upper() == 'PM' and hour != 12:
                hour += 12
            elif ampm.upper() == 'AM' and hour == 12:
                hour = 0

            # Create datetime object for today
            deadline = datetime.combine(current_date, datetime.min.time())
            deadline = deadline.replace(hour=hour, minute=minute)

            # Adjust for UTC+8 timezone (user local time to UTC)
            deadline = deadline - timedelta(hours=8)

            return deadline

        except (ValueError, IndexError):
            return None

    @staticmethod
    async def send_morning_reminders():
        """Send morning reminders to all eligible users"""
        try:
            user_ids = await ReminderService.get_users_for_reminder("morning")

            for user_id in user_ids:
                request = NotificationRequest(
                    user_id=user_id,
                    title="🌅 Good Morning!",
                    body="Time to set your tasks for today! Don't forget to plan your day ahead.",
                    icon="/losicon.svg",
                    badge="/losicon.svg",
                    tag="morning-reminder"
                )

                success = await NotificationService.send_notification(request)
                if success:
                    print(f"Morning reminder sent to user {user_id}")
                else:
                    print(f"Failed to send morning reminder to user {user_id}")

        except Exception as e:
            print(f"Error sending morning reminders: {e}")

    @staticmethod
    async def send_evening_reminders():
        """Send evening reminders to all eligible users"""
        try:
            user_ids = await ReminderService.get_users_for_reminder("evening")

            for user_id in user_ids:
                request = NotificationRequest(
                    user_id=user_id,
                    title="🌙 Good Evening!",
                    body="Time to review your task status for today. How did you do?",
                    icon="/losicon.svg",
                    badge="/losicon.svg",
                    tag="evening-reminder"
                )

                success = await NotificationService.send_notification(request)
                if success:
                    print(f"Evening reminder sent to user {user_id}")
                else:
                    print(f"Failed to send evening reminder to user {user_id}")

        except Exception as e:
            print(f"Error sending evening reminders: {e}")

    @staticmethod
    async def send_test_reminder(user_id: str, reminder_type: str = "morning"):
        """Send a test reminder to a specific user"""
        try:
            if reminder_type == "morning":
                title = "🧪 Test Morning Reminder"
                body = "This is a test morning reminder notification."
            else:
                title = "🧪 Test Evening Reminder"
                body = "This is a test evening reminder notification."

            request = NotificationRequest(
                user_id=user_id,
                title=title,
                body=body,
                icon="/losicon.svg",
                badge="/losicon.svg",
                tag="test-reminder"
            )

            success = await NotificationService.send_notification(request)
            return success

        except Exception as e:
            print(f"Error sending test reminder: {e}")
            return False