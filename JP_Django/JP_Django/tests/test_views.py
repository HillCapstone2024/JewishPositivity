from django.test import TestCase, Client  #Client class to simulate HTTP requests
from django.urls import reverse #reverse allows you to generate URLs for Django views by providing the view name
from JP_Django.views import create_user_view
import datetime
import json
from JP_Django.models import User, Checkin #import model to access printing users in the test DB
import logging
import os


#a test for the create_user_view
# use this command in terminal to run test: python manage.py test myapp.tests.test_views.CreateUserViewTestCase

# Define constant content type
CONTENT_TYPE_JSON = 'application/json'

# Define format for user log message
LOG_MSG_FORMAT = '%s: %s'

# Define constant strings for logging USER
LOG_USER = 'User'
LOG_ID = 'ID'
LOG_FIRST_NAME = 'First Name'
LOG_LAST_NAME = 'Last Name'
LOG_TIME1 = 'Time1'
LOG_TIME2 = 'Time2'
LOG_TIME3 = 'Time3'

# Define constant strings for logging CHECKIN
LOG_CHECKIN_ID = 'Check-In ID'
LOG_DATE = 'Date'
LOG_CONTENT_TYPE = 'Content Type'
LOG_CONTENT = 'Content'
LOG_MOMENT_NUMBER = 'Moment Number'
LOG_USER_ID = 'User ID'

class CreateUserViewTestCase(TestCase):
    
    # Define constant post data
    POST_DATA_SUCCESS = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_MISSING_KEYS = {
        # Missing required fields
        'username': '',
        'password': '',
        'reentered_password': '',
        'firstname': '',
        'lastname': '',
        'email': '',
        'timezone': '',
    }

    POST_DATA_FAILURE_INVALID_TIMEZONE = {
        # Invalid timezone
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success@example.com',
        'timezone': 'ABC',
    }

    POST_DATA_FAILURE_PASSWORDS_DONT_MATCH = {
        'username': 'testuser1',
        'password': 'testpassword',
        'reentered_password': 'nottestpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'failure@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_WRONG_EMAIL_FORMAT = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'wrongformat',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_DUPLICATE_EMAIL = {
        'username': 'testuser4',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'dupefailure@example.com',
        'timezone': 'EST',
    }
    POST_DATA_FAILURE_DUPLICATE_EMAIL_2 = {
        'username': 'testuser5',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'dupefailure@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_DUPLICATE_USERNAME = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test7@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_DUPLICATE_USERNAME_2 = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test8@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_MISSING_FIRST_NAME = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': '',
        'lastname': 'User',
        'email': 'test8@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_MISSING_LAST_NAME = {
        'username': 'testuser7',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'firstname',
        'lastname': '',
        'email': 'test8@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_MISSING_PASSWORD = {
        'username': 'testuser7',
        'password': '',
        'reentered_password': '',
        'firstname': 'firstname',
        'lastname': 'HI',
        'email': 'test8@example.com',
        'timezone': 'EST',
    }

    POST_DATA_FAILURE_WHITESPACE = {
        'username': ' ',
        'password': '   ',
        'reentered_password': 'testpassword',
        'firstname': 'firstname',
        'lastname': 'HEY',
        'email': 'test8@example.com',
        'timezone': 'EST',
    }

    def test_create_user_success(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_SUCCESS....")
       
        # Test if user was successfully made
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

        # Check if a user with the specified username was created
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_create_user_failure_missing_keys(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_MISSING_KEYS....")

        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_KEYS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)

    def test_create_user_failure_invalid_timezone(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_INVALID_TIMEZONE....")

        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_INVALID_TIMEZONE), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)

    def test_create_user_failure_missing_first_name(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_MISSING_FIRST_NAME....")

        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_FIRST_NAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)

    def test_create_user_failure_missing_last_name(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_MISSING_LAST_NAME....")

        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_LAST_NAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)
    
    def test_create_user_failure_missing_password(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_MISSING_PASSWORD....")

        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_PASSWORD), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)
    
    def test_create_user_failure_entering_whitespace(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_MISSING_ENTERING_WHITESPACE...")


        # Test if view will correctly fail to create user with missing keys
        client = Client()

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_WHITESPACE), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400)

    def test_create_user_passwords(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_PASSWORD....")

        # Test if passwords don't match that correct error will appear
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_PASSWORDS_DONT_MATCH), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_create_user_emailValidation(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_EMAILVALIDATION....")

        # Test if emails not in correct format that correct error will appear
        client = Client()

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), data=json.dumps(self.POST_DATA_FAILURE_WRONG_EMAIL_FORMAT), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_create_user_duplicate_email(self):
        # logging the test we are in
        logging.info("TESTING CREATE_USER_DUPLICATE_EMAIL....")

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
        # logging the test we are in
        logging.info("TESTING CREATE_USER_DUPLICATE_USERNAME....")

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
        'timezone': 'EST',
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

class UpdateUserInfoViewTestCase(TestCase):
    #class for testing any updates specific to user fields

    USER_CREATION_DATA = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'testuser@example.com',
        'timezone': 'EST',
    }

    USER_CREATION_DATA_2 = {
        'username': 'testuser2',
        'password': 'testpassword2',
        'reentered_password': 'testpassword2',
        'firstname': 'Test2',
        'lastname': 'User2',
        'email': 'testuser2@example.com',
        'timezone': 'EST',
    }

    UPDATE_TIMES_DATA_SUCCESS = {
        'username' : 'testuser',
        'time1': datetime.time(8, 15).strftime('%H:%M:%S'),
        'time2': datetime.time(16, 35).strftime('%H:%M:%S'),
        'time3': datetime.time(19, 00).strftime('%H:%M:%S'),
    }

    UPDATE_TIMES_INVALID_ORDER_FAIL = {
            'username': 'testuser',
            'time1': datetime.time(17, 35).strftime('%H:%M:%S'),
            'time2': datetime.time(7, 35).strftime('%H:%M:%S'),
            'time3': datetime.time(19, 00).strftime('%H:%M:%S'),
    }

    UPDATE_USERNAME_SUCCESS = {
        'username': 'testuser',
        'newusername': 'newtestuser',
    }
    UPDATE_USERNAME_FAIL = {
        'username': 'testuser2',
        'newusername': 'testuser',
    }

    UPDATE_PASSWORD_SUCCESS = {
        'username': 'testuser',
        'password': 'newpassword',
    }

    UPDATE_PASSWORD_FAIL = {
        'username': 'testuser',
        'password': '',
    }

    UPDATE_EMAIL_SUCCESS = {
        'username': 'testuser',
        'email' : 'newEmail@example.com', 
    }

    UPDATE_EMAIL_FAIL = {
        'username': 'testuser',
        'email' : 'testuser2@example.com', 
    }

    UPDATE_FIRST_NAME_SUCCESS = {
        'username': 'testuser',
        'firstname' : 'NewFirst',
    }

    UPDATE_FIRST_NAME_FAIL = {
        'username': 'testuser',
        'firstname' : '',
    }

    UPDATE_LAST_NAME_SUCCESS = {
        'username': 'testuser',
        'lastname' : 'NewLast',
    }

    UPDATE_LAST_NAME_FAIL = {
        'username': 'testuser',
        'lastname' : '',
    }

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

    UPDATE_PHOTO_SUCCESS = {
        'username': 'testuser',
        'profilepicture' : photo, 
    }

    # Initialize the Django test client
    client = Client()

    # Set up method to create a test user
    def setUp(self):
        logging.info("")
        logging.info("")
        logging.info("BEGINNING NEW TEST...")
        # Make a POST request to create 2 test users for testing
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER_CREATION_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER_CREATION_DATA_2), content_type=CONTENT_TYPE_JSON)

    def test_update_user_username_success(self):
        logging.info("test_update_user_username_success ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_USERNAME_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
    def test_update_user_username_fail(self):
        logging.info("test_update_user_username_fail ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_USERNAME_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 for failure
        self.assertEqual(response.status_code, 400)
    
    def test_update_user_passwords_success(self):
        logging.info("test_update_user_passwords_success ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_PASSWORD_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
    def test_update_user_passwords_fail(self):
        logging.info("test_update_user_passwords_fail ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_PASSWORD_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 indicating error
        self.assertEqual(response.status_code, 400)

    def test_update_user_email_success(self):
        logging.info("test_update_user_email_success ....") 

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_EMAIL_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
    def test_update_user_email_fail(self):
        logging.info("test_update_user_email_fail ....") 

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_EMAIL_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 indicating error
        self.assertEqual(response.status_code, 400)

    def test_update_user_first_name_success(self):
        logging.info("test_update_user_first_name_success ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_FIRST_NAME_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
    def test_update_user_first_name_fail(self):
        logging.info("test_update_user_first_name_fail ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_FIRST_NAME_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 indicating error
        self.assertEqual(response.status_code, 400)
    
    def test_update_user_last_name_success(self):
        logging.info("test_update_user_last_name_success ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_LAST_NAME_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
    def test_update_user_last_name_fail(self):
        logging.info("test_update_user_last_name_fail ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_LAST_NAME_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400 indicating error
        self.assertEqual(response.status_code, 400)

    def test_update_user_profile_picture_success(self):
        logging.info("test_update_user_profile_picture_success ....") 

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_PHOTO_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    
class GetTimesViewTestCase(TestCase):

    # Define constant user data
    USER_DATA = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test@example.com',
        'timezone': 'EST',
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

class GetUserInformationViewTestCase(TestCase):

    # Define constant user data
    USER_DATA = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test@example.com',
        'timezone': 'EST',
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user to display information of
        client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type=CONTENT_TYPE_JSON)

    def test_get_user_information_success(self): # Successfully retrieves a valid user's information from the database
        client = Client()

        # Create test data
        get_data = {'username': 'testuser'}

        # Send GET request to get_user_information_view
        response = client.get(reverse('get_user_information_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of info
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

    def test_get_times_fail(self): # Fails to get times in database due to user not existing
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'}

        # Send GET request to get_user_information_view
        response = client.get(reverse('get_user_information_view'), data=get_data)

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

class CheckinViewTestCase(TestCase): #to test handling of checkin post for text, photo, video and audio

    # Stored as base64 encoded strings
    text_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64text.txt'))
    textFile = open(text_file_path, 'r')
    text = textFile.read()
    logging.info("TEXT: %s", text)
    textFile.close()

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

    audio_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64audio.txt'))
    audioFile = open(audio_file_path, 'r')
    audio = audioFile.read()
    #logging.info("AUDIO: %s", audio)
    audioFile.close()

    video_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64video.txt'))
    videoFile = open(video_file_path, 'r')
    video = videoFile.read()
    #logging.info("VIDEO: %s", video)
    videoFile.close()
    
    # Define constant post data
    CREATE_USER_1 = {
        'username': 'testuser1',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success21@example.com',
        'timezone': 'EST',
    }

    CREATE_USER_2 = {
        'username': 'testuser2',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success22@example.com',
        'timezone': 'EST',
    }

    CREATE_USER_3 = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success23@example.com',
        'timezone': 'EST',
    }

    CREATE_USER_4 = {
        'username': 'testuser4',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success24@example.com',
        'timezone': 'EST',
    }

    CREATE_USER_5 = {
        'username': 'testuser5',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'success25@example.com',
        'timezone': 'EST',
    }

    # Define post data
    TEXT_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': 'text',
        'content': text, #fill in with example entry
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, #How to pass in photo?
    }

    AUDIO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 3,
        'content_type': 'audio',
        'content': audio, #How to pass in audio?
    }

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, #How to pass in video?
    }

    MISSING_USERNAME = {
        'username': '',
        'moment_number': 2,
        'content_type': 'text',
        'content': text,
    }

    MISSING_MOMENT_NUMBER = {
        'username': 'testuser2',
        'moment_number': None,
        'content_type': 'text',
        'content': text, 
    }

    MISSING_CONTENT_TYPE = { 
        'username': 'testuser3',
        'moment_number': 1,
        'content_type': '',
        'content': text, 
    }
        
    MISSING_CONTENT = {
        'username': 'testuser3',
        'moment_number': 2,
        'content_type': 'text',
        'content': '',
    }

    INVALID_USERID = { 
        'username': 'admin45678901',
        'moment_number': 1,
        'content_type': 'text',
        'content': text,
    }

    DUPLICATE_MOMENT = {
        'username': 'testuser5',
        'moment_number': 1,
        'content_type': 'text',
        'content': text,
    }


    # Set up method to create a test user
    def setUp(self):
        logging.info("SETTING UP CHECKIN....")

        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_1), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_2), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_3), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_4), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_5), content_type=CONTENT_TYPE_JSON)

    def test_checkin_text_success(self): #test of successful text entry submission
        # logging the test we are in
        logging.info("TESTING CHECKIN_TEXT_SUCCESS....")
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.TEXT_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   

    def test_checkin_photo_success(self): #test of successful photo entry submission
        # logging the test we are in
        logging.info("TESTING CHECKIN_PHOTO_SUCCESS....")
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.PHOTO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

    def test_checkin_audio_success(self): #test of successful audio entry submission
        # logging the test we are in
        logging.info("TESTING CHECKIN_AUDIO_SUCCESS....")
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.AUDIO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

    def test_checkin_video_success(self): #test of successful audio entry submission
        # logging the test we are in
        logging.info("TESTING CHECKIN_VIDEO_SUCCESS....")
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.VIDEO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)
    
    def test_checkin_failure_missing_username(self): #test of failure due to missing username
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_username....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.MISSING_USERNAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_checkin_failure_missing_moment_number(self): #test of failure due to missing moment number
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_moment_number....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.MISSING_MOMENT_NUMBER), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_checkin_failure_missing_content_type(self): #test of failure due to missing content type
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_content_type....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.MISSING_CONTENT_TYPE), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_checkin_failure_missing_content(self): #test of failure due to missing content
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_content....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.MISSING_CONTENT), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)


    def test_checkin_failure_duplicate_moment(self): #test of failure due to duplicate moment for the same day and user
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_duplicate_moment....").upper())
        client = Client()

        # Make two POST requests to the checkin_view to simulate a duplicate moment
        response = client.post(reverse('checkin_view'), data=json.dumps(self.DUPLICATE_MOMENT), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('checkin_view'), data=json.dumps(self.DUPLICATE_MOMENT), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 200) #first should work
        self.assertEqual(response2.status_code, 400) #second should cause error

    def test_checkin_failure_invalid_userid(self): #test of failure due to invalid user id (foreign key)
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_invalid_userid....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.INVALID_USERID), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

class GetCheckinViewsTestCase(TestCase): # to test retreving a checkin moment from backend to frontend
    
    #MEDIA
    # Stored as base64 encoded strings
    text_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64text.txt'))
    textFile = open(text_file_path, 'r')
    text = textFile.read()
    logging.info("TEXT: %s", text)
    textFile.close()

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

    audio_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64audio.txt'))
    audioFile = open(audio_file_path, 'r')
    audio = audioFile.read()
    #logging.info("AUDIO: %s", audio)
    audioFile.close()

    video_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64video.txt'))
    videoFile = open(video_file_path, 'r')
    video = videoFile.read()
    #logging.info("VIDEO: %s", video)
    videoFile.close()

    # Define constant user data
    USER1_DATA = {
        'username': 'testuser1',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test@example.com',
        'timezone': 'EST',
    }

    USER2_DATA = {
        'username': 'testuser2',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test2@example.com',
        'timezone': 'EST',
    }

    # Define post data
    TEXT_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': 'text',
        'content': text, #fill in with example entry
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, #How to pass in photo?
    }

    AUDIO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 3,
        'content_type': 'audio',
        'content': audio, #How to pass in audio?
    }

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, #How to pass in video?
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('checkin_view'), data=json.dumps(self.PHOTO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON) #make checkins into DB
        client.post(reverse('checkin_view'), data=json.dumps(self.AUDIO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON) # one for each moment type
        client.post(reverse('checkin_view'), data=json.dumps(self.TEXT_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('checkin_view'), data=json.dumps(self.VIDEO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)


    def test_get_checkins_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("TEST_get_checkins_success..........")
        client = Client()

        # Create test data
        get_data = {'username': 'testuser1'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_checkin_info_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')    

    def test_get_checkins_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("TEST_get_checkins_fail_User_DNE..........")
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'} 

        # Send GET request to get_times_view
        response = client.get(reverse('get_times_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of checkins
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   




    
