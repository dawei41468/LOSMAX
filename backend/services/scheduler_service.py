from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.reminder_service import ReminderService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self._setup_jobs()

    def _setup_jobs(self):
        """Setup scheduled jobs for daily reminders"""

        # Check for reminders every 5 minutes - allows for individual user deadline times
        self.scheduler.add_job(
            func=self._check_and_send_reminders,
            trigger=CronTrigger(minute="*/5"),  # Every 5 minutes
            id='reminder_checker',
            name='Reminder Checker',
            replace_existing=True
        )

    async def _run_morning_reminders(self):
        """Run morning reminder job"""
        try:
            logger.info("Running morning reminders job")
            await ReminderService.send_morning_reminders()
            logger.info("Morning reminders job completed")
        except Exception as e:
            logger.error(f"Error in morning reminders job: {e}")

    async def _run_evening_reminders(self):
        """Run evening reminder job"""
        try:
            logger.info("Running evening reminders job")
            await ReminderService.send_evening_reminders()
            logger.info("Evening reminders job completed")
        except Exception as e:
            logger.error(f"Error in evening reminders job: {e}")

    async def _check_and_send_reminders(self):
        """Check for and send reminders to users whose deadline is approaching"""
        try:
            logger.info("Checking for reminder notifications")
            # Check both morning and evening reminders
            await ReminderService.send_morning_reminders()
            await ReminderService.send_evening_reminders()
            logger.info("Reminder check completed")
        except Exception as e:
            logger.error(f"Error in reminder check: {e}")

    def start(self):
        """Start the scheduler"""
        logger.info("Starting notification scheduler")
        self.scheduler.start()
        logger.info("Notification scheduler started")

        # Log scheduled jobs
        jobs = self.scheduler.get_jobs()
        for job in jobs:
            logger.info(f"Scheduled job: {job.name} (ID: {job.id}) - Next run: {job.next_run_time}")

    def stop(self):
        """Stop the scheduler"""
        logger.info("Stopping notification scheduler")
        self.scheduler.shutdown()
        logger.info("Notification scheduler stopped")

    def get_jobs(self):
        """Get list of scheduled jobs"""
        return self.scheduler.get_jobs()

# Global scheduler instance
scheduler_service = SchedulerService()