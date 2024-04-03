# in models.py

from django.db import models
import datetime
import time
import pytz
from django.contrib.auth.models import AbstractUser
from JP_Django.managers import CustomUserManager

class User(AbstractUser):
    id = models.AutoField(primary_key= True) #the autoincremented ID field for user
    last_login = models.DateTimeField(blank=True, null=True)
    first_name = models.CharField(db_column='first_Name', max_length=100)  # Field name made lowercase.
    last_name = models.CharField(db_column='last_Name', max_length=100)  # Field name made lowercase.
    email = models.CharField(unique=True, max_length=254)
    password = models.CharField(max_length=100)
    username = models.CharField(unique=True, max_length=100)
    profile_picture = models.BinaryField(blank=True, null=True) #profile picture in binary format

    # Consider default times to be UTC
    current_date = datetime.datetime.now().date() # Get current date
    time1_default = datetime.time(8,00) # Default time for first checkin moment
    datetime1_entry = datetime.datetime.combine(current_date, time1_default) # Combine date and time
    time2_default = datetime.time(15,00)
    datetime2_entry = datetime.datetime.combine(current_date, time2_default)
    time3_default = datetime.time(21,00)
    datetime3_entry = datetime.datetime.combine(current_date, time3_default)

    # time scheduling fields - with default times
    timezone = models.CharField(max_length=100, default='UTC')
    time1 = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime1_entry)
    time2 = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime2_entry)
    time3 = models.DateTimeField(auto_now=False, auto_now_add=False, default=datetime3_entry)

    objects = CustomUserManager()

    REQUIRED_FIELDS = ['email']
    USERNAME_FIELD = 'username'


class Checkin(models.Model): #to store checkin moments data
    checkin_id= models.AutoField(primary_key= True) #the autoincremented ID field for checkins
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column='id')  #referencing id of user model 
    date = models.DateTimeField() 
    moment_number = models.IntegerField() #should be 1,2, or 3
    content_type = models.CharField(max_length=100) #either of following option: photo, audio, video
    text_entry= models.CharField(null=True, max_length=255) 
    content = models.BinaryField(null=True) #actual content
    header = models.CharField(null=True, max_length=100) #header for the content

    class Meta:
        # Define unique constraint for composite key
        unique_together = [('moment_number', 'user_id', 'date')]
    

class Friends(models.Model): #to store friendships
    friendship_id = models.AutoField(primary_key=True) #the autoincremented ID field for friendship
    user1 = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user1')
    user2 = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user2')
    complete = models.BooleanField(default=False)  # False for pending, True for accepted
    class Meta:
        # Define unique constraint for composite key
        unique_together = [('user1', 'user2')]
