# in models.py

from django.db import models
import datetime
from datetime import date
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
    profile_picture = models.BinaryField(blank=True, null=True) # Profile picture in binary format
    current_streak = models.IntegerField(default=0) # Current streak of user
    longest_streak = models.IntegerField(default=0) # Longest streak of user

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
    content_type = models.CharField(max_length=100, null=True) #either of following option: photo, audio, video
    text_entry= models.TextField(null=True) 
    content = models.BinaryField(null=True) #actual content
    privacy = models.BooleanField(default=False) #should be false = public, true = private

    class Meta:
        # Define unique constraint for composite key
        unique_together = [('moment_number', 'user_id', 'date')] #does not enforce unqueness since this includes time
    

class Friends(models.Model): #to store friendships
    friendship_id = models.AutoField(primary_key=True) #the autoincremented ID field for friendship
    user1 = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user1')
    user2 = models.ForeignKey(User,on_delete=models.CASCADE,related_name='user2')
    complete = models.BooleanField(default=False)  # False for pending, True for accepted
    class Meta:
        # Define unique constraint for composite key
        unique_together = [('user1', 'user2')]

class Badges(models.Model):
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, db_column='id', primary_key=True)  #referencing id of user model
    one_day = models.BooleanField(default=False)
    one_week = models.BooleanField(default=False)
    one_month = models.BooleanField(default=False)
    one_year = models.BooleanField(default=False)

class Community(models.Model): # to store communities
    community_id = models.AutoField(primary_key=True) # autoincremented ID field for community
    community_name = models.CharField(max_length=100, unique=True)
    community_photo = models.BinaryField(blank=True, null=True) # Community picture in binary format
    community_description = models.TextField()
    owner_id = models.ForeignKey(User,on_delete=models.CASCADE) # user_id of the owner
    privacy = models.CharField(max_length=100) # 'private' or 'public' 
    date_created= models.DateField(default=date.today) 

class CommunityUser(models.Model): # to store users-community relationships
    communityuser_id = models.AutoField(primary_key=True) #the autoincremented ID field for membership
    user_id = models.ForeignKey(User,on_delete=models.CASCADE) # FK of the user
    community_id = models.ForeignKey(Community,on_delete=models.CASCADE) # FK of the community
    status = models.IntegerField()  # 0 for requesting, 1 for invited, 2 for accepted
    date_joined= models.DateField(default=date.today)
    class Meta:
        # Define unique constraint for composite key
        unique_together = [('user_id', 'community_id')] # So members can't join the same community twice

class Prompt(models.Model):
    CHECKIN_TYPES = [
        ('ModehAni', 'Modeh Ani'),
        ('Ashrei', 'Ashrei'),
        ('Shema', 'Shema'),
    ]
    checkin_type = models.CharField(max_length=10, choices=CHECKIN_TYPES)
    text = models.TextField()

    def __str__(self):
        return f"{self.checkin_type}: {self.text[:50]}..."