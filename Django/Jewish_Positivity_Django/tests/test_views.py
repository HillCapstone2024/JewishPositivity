from django.test import TestCase, Client  #Client class to simulate HTTP requests
from django.urls import reverse #reverse allows you to generate URLs for Django views by providing the view name
from Jewish_Positivity_Django.views import create_user_view
import datetime
import json
from Jewish_Positivity_Django.models import User #import model to access printing users in the test DB
import logging


#a test for the create_user_view
# use this command in terminal to run test: python manage.py test myapp.tests.test_views.CreateUserViewTestCase

# Define constant content type
CONTENT_TYPE_JSON = 'application/json'

# Define format for user log message
LOG_MSG_FORMAT = '%s: %s'

# Define constant strings for logging
LOG_USER = 'User'
LOG_FIRST_NAME = 'First Name'
LOG_LAST_NAME = 'Last Name'
LOG_TIME1 = 'Time1'
LOG_TIME2 = 'Time2'
LOG_TIME3 = 'Time3'

class CreateUserViewTestCase(TestCase):
    
    # Define constant post data
    POST_DATA_SUCCESS = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success@example.com',
    }

    POST_DATA_FAILURE_MISSING_KEYS = {
        # Missing required fields
        'email': 'example@example.com',
    }

    POST_DATA_FAILURE_PASSWORDS_DONT_MATCH = {
        'username': 'testuser1',
        'password': 'testpassword',
        'reentered_password': 'nottestpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'failure@example.com',
    }

    POST_DATA_FAILURE_WRONG_EMAIL_FORMAT = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'wrongformat',
    }

    POST_DATA_FAILURE_DUPLICATE_EMAIL = {
        'username': 'testuser4',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'dupefailure@example.com',
    }
    POST_DATA_FAILURE_DUPLICATE_EMAIL_2 = {
        'username': 'testuser5',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'dupefailure@example.com',
    }

    POST_DATA_FAILURE_DUPLICATE_USERNAME = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test7@example.com',
    }

    POST_DATA_FAILURE_DUPLICATE_USERNAME_2 = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test8@example.com',
    }


    def test_create_user_success(self):
        # Test if user was successfully made
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

        # Check if a user with the specified username was created
        self.assertTrue(User.objects.filter(username='testuser').exists())


    def test_create_user_failure_missing_keys(self):
        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_KEYS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)


    def test_create_user_passwords(self):
        # Test if passwords don't match that correct error will appear
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_PASSWORDS_DONT_MATCH), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)


    def test_create_user_emailValidation(self):
        # Test if emails not in correct format that correct error will appear
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_WRONG_EMAIL_FORMAT), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)


    def test_create_user_duplicate_email(self):
        # Test that error appears when trying to add duplicate emails
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_DUPLICATE_EMAIL), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_DUPLICATE_EMAIL_2), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 for first user (should have succeeded)
        self.assertEqual(response.status_code, 200)

        # Check if the response status code is 400 for second user (duplicate user error)
        self.assertEqual(response2.status_code, 400)


    def test_create_user_duplicate_username(self):
        # Test that error appears when trying to add duplicate usernames
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_DUPLICATE_USERNAME), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_DUPLICATE_USERNAME_2), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 for first user (should have succeeded)
        self.assertEqual(response.status_code, 200)

        # Check if the response status code is 400 for second user (duplicate user error)
        self.assertEqual(response2.status_code, 400)


class SetTimesViewTestCase(TestCase):

    # Define constant post data
    POST_DATA_SUCCESS = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success2@example.com',
    }

    # Set up method to create a test user
    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user
        client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

    def test_set_times_success(self):
        # Test if user was successfully made
        client = Client()
        
        # Query the database and print its contents BEFORE updating the times
        queryset = User.objects.all()
        for obj in queryset: 
            # Log user information
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   

        # Creating a POST for updating the times
        post_data = {
            'username' : 'testuser',
            'time1': datetime.time(8, 15).strftime('%H:%M:%S'),
            'time2': datetime.time(16, 35).strftime('%H:%M:%S'),
            'time3': datetime.time(19, 00).strftime('%H:%M:%S'),
        }
        
        # Make a POST request to update the times
        response = client.post(reverse('update_times_view'), data=json.dumps(post_data), content_type=CONTENT_TYPE_JSON) 
        
        # Query the database and print its contents AFTER updating the times
        queryset = User.objects.all() 
        for obj in queryset:
            # Log user information
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   

        # Ensure the response is 200 indicating successful update of times
        self.assertEqual(response.status_code, 200) 

    def test_set_times_invalid_order_fail(self):
        # Test for time1 < time2 < time3
        client = Client()

        # Creating a POST for updating the times with INCORRECT ORDERING
        post_data = {
            'username': 'testuser',
            'time1': datetime.time(17, 35).strftime('%H:%M:%S'),
            'time2': datetime.time(7, 35).strftime('%H:%M:%S'),
            'time3': datetime.time(19, 00).strftime('%H:%M:%S'),
        }
        
        # Printing DB after attempted updating times
        queryset = User.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   

        # Calling update_times_view model to update database times --> should give error
        response = client.post(reverse('update_times_view'), data=json.dumps(post_data), content_type=CONTENT_TYPE_JSON) 

        # Status code of 400 means updating times fails due to incorrect order 
        self.assertEqual(response.status_code, 400)

class GetTimesViewTestCase(TestCase):

    # Define constant user data
    USER_DATA = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test@example.com',
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type=CONTENT_TYPE_JSON)

    def test_get_times_success(self):
        # Successfully retrieves a valid user's times from the database
        client = Client()

        # Create test data
        get_data = {'username': 'testuser'}

        # Send GET request to get_times_view
        response = client.get(reverse('get_times_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of times
        logging.info('Response: %s', response)
        logging.info('')
        queryset = User.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   

    def test_get_times_fail(self):
        # Fails to get times in database due to user not existing
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'}

        # Send GET request to get_times_view
        response = client.get(reverse('get_times_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of times
        logging.info('Response: %s', response)
        logging.info('')
        queryset = User.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   
