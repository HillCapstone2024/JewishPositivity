from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError
from JP_Django.models import User, Badges  

class Command(BaseCommand):
    help = 'Adds all existing users to the Badges table with default values.'

    def handle(self, *args, **kwargs):
        users = User.objects.all()
        for user in users:
            try:
                Badges.objects.get_or_create(user_id=user)
                self.stdout.write(self.style.SUCCESS(f'Successfully added or verified badge for user {user.username}'))
            except IntegrityError:
                self.stdout.write(self.style.WARNING(f'Badge already exists for user {user.username}'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error adding badge for user {user.username}: {e}'))
