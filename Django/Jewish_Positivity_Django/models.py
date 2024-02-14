# in models.py

from django.db import models
from django.contrib.auth.models import User

#class UserProfile(models.Model):
    #user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    #Add additional fields as needed
class User(models.Model):
    First_Name = models.CharField(max_length=100)
    Last_Name = models.CharField(max_length=100)
    Email = models.EmailField()
    Password = models.CharField(max_length=100)
    Username = models.CharField(max_length=100)

    class Meta: #For Additional Operations
        db_table = "jpd_User"
