from JP_Django.models import Checkin
import datetime
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Updates the date field in Checkin to be 4 hours behind the current time.'

    def handle(self, *args, **kwargs):
        checkins = Checkin.objects.all()
        for checkin in checkins:
            try:
                # Get the current datetime in UTC
                current_datetime = checkin.date

                # Convert the datetime to the desired timezone (4 hours behind)
                new_datetime = current_datetime - datetime.timedelta(hours=4)

                # Update the date in the instance
                checkin.date = new_datetime

                # Save the instance
                checkin.save()

                self.stdout.write(self.style.SUCCESS(f'Successfully updated date for CheckinModel id {checkin.id}'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error updating date for CheckinModel id {checkin.id}: {e}'))