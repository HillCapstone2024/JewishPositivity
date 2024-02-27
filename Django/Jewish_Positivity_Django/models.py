# in models.py

from django.db import models
import datetime
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, AbstractUser
from django.contrib.auth.models import UserManager
from Jewish_Positivity_Django.managers import CustomUserManager

# class UserProfile(models.Model): # Uses default User model
#     user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
#     # Add additional fields as needed

class User(AbstractUser):
    last_login = models.DateTimeField(blank=True, null=True)
    first_name = models.CharField(db_column='first_Name', max_length=100)  # Field name made lowercase.
    last_name = models.CharField(db_column='last_Name', max_length=100)  # Field name made lowercase.
    email = models.CharField(primary_key=True, max_length=254)
    password = models.CharField(max_length=100)
    username = models.CharField(unique=True, max_length=100)

    #scheduling fields- with default times 
    time1 = models.TimeField(auto_now=False, auto_now_add=False, default= datetime.time(8, 00))
    time2 = models.TimeField(auto_now=False, auto_now_add=False, default= datetime.time(15, 00))
    time3 = models.TimeField(auto_now=False, auto_now_add=False, default= datetime.time(21, 00))

    objects = CustomUserManager()

    REQUIRED_FIELDS = ['email']
    USERNAME_FIELD = 'username'

# class Notification(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     message = models.CharField(max_length=255)
#     target_audience = models.CharField(max_length=100)

#     def get_notification_times(self):
#         """Get the three notification times for today."""
#         # Get the associated user instance from ForKey relationship
#         user_instance = self.user

#         # Extract the times from the user fields
#         #Combine today's date with each notification time to create datetime objects
#         time_1 = timezone.make_aware(timezone.datetime.combine(timezone.now().date(), user_instance.time1))
#         time_2 = timezone.make_aware(timezone.datetime.combine(timezone.now().date(), user_instance.time2))
#         time_3 = timezone.make_aware(timezone.datetime.combine(timezone.now().date(), user_instance.time3))
#         return [time_1, time_2, time_3]

