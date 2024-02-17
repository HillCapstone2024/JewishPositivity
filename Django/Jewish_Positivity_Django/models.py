# in models.py

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, AbstractUser
from django.contrib.auth.models import UserManager
from Jewish_Positivity_Django.managers import CustomUserManager
# from django.contrib.auth.hashers import make_password, check_password

# class UserProfile(models.Model): # Uses default User model
#     user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
#     # Add additional fields as needed

class JpdUser(AbstractUser):
    last_login = models.DateTimeField(blank=True, null=True)
    first_name = models.CharField(db_column='first_Name', max_length=100)  # Field name made lowercase.
    last_name = models.CharField(db_column='last_Name', max_length=100)  # Field name made lowercase.
    email = models.CharField(primary_key=True, max_length=254)
    password = models.CharField(max_length=100)
    username = models.CharField(unique=True, max_length=100)

    objects = CustomUserManager()

    REQUIRED_FIELDS = ['email']
    USERNAME_FIELD = 'username'

    class Meta:
        db_table = 'jpd_User'

    # Don't know if we need these two methods
    # def set_password(self, raw_password):
    #     self.password = make_password(raw_password)

    # def check_password(self, raw_password):
    #     return check_password(raw_password, self.password)

# class User(AbstractBaseUser):
#     first_Name = models.CharField(max_length=100)
#     last_Name = models.CharField(max_length=100)
#     email = models.EmailField(primary_key=True)
#     password = models.CharField(max_length=100)
#     username = models.CharField(max_length=100, unique=True)

#     # Required fields for User Model
#     REQUIRED_FIELDS = ['email']
#     # Specify Username field
#     USERNAME_FIELD = 'username'
    
#     # Manager
#     objects = CustomUserManager()

#     def __str__(self):
#         return self.email + ' ' + self.username + ' ' + self.first_name + ' ' + self.last_name

#     class Meta: #For Additional Operations
#         db_table = "jpd_User"


