import base64
import os
from django.core.management.base import BaseCommand
from django.db.utils import IntegrityError
from JP_Django.models import User

class Command(BaseCommand):
    help = 'Adds default profile picture to all existing users without a profile picture.'

    # Get path to default profile picture
    test_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
    # Construct the path to profile picture
    defaultPPfile_path = os.path.join(test_dir, 'tests', 'test_resources', 'b64profilepicture.txt')

    # Read default profile picture
    defaultPPFile = open(defaultPPfile_path, 'r')
    defaultProfilePic = defaultPPFile.read()
    defaultPPFile.close()

    def handle(self, *args, **kwargs):
        defaultProfilePic = base64.b64decode(self.defaultProfilePic)
        users = User.objects.all()
        for user in users:
            try:
                if (not user.profile_picture) or (user.profile_picture == None):
                    user.profile_picture = defaultProfilePic
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'Successfully added profile picture for user: {user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'Profile picture already exists for user: {user.username}'))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f'Error adding profile picture for user {user.username}: {e}'))