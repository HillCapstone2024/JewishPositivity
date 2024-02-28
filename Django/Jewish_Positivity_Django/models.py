# in models.py

from django.db import models
import datetime
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, AbstractUser
from django.contrib.auth.models import UserManager
from Jewish_Positivity_Django.managers import CustomUserManager

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

