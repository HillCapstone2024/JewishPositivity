from django.test import TestCase, Client  #Client class to simulate HTTP requests
from django.urls import reverse #reverse allows you to generate URLs for Django views by providing the view name
import datetime
import json
from JP_Django.models import User, Checkin, Friends, Badges, Community, CommunityUser #import model to access printing users in the test DB
import logging
import os
from django.contrib.auth import get_user_model

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
LOG_CURRENT_STREAK= "Current Streak"
LOG_LONGEST_STREAK= "Longest Streak"
LOG_PROFILE_PICTURE = 'Profile picture'

# Define constant strings for logging CHECKIN
LOG_CHECKIN_ID = 'Check-In ID'
LOG_DATE = 'Date'
LOG_CONTENT_TYPE = 'Content Type'
LOG_CONTENT = 'Content'
LOG_TEXT_ENTRY= 'Text Entry'
LOG_MOMENT_NUMBER = 'Moment Number'
LOG_USER_ID = 'User ID'

# Define constant strings for logging FRIENDS
LOG_FRIENDSHIP_ID = 'Friendship ID'
LOG_FRIENDSHIP_STATUS = 'Friendship Status'
LOG_USER1_ID = 'User1 ID'
LOG_USER2_ID = 'User1 ID'

#define constants for logging communities
LOG_COMMUNITY_NAME= 'Community Name'
LOG_COMMUNITY_PHOTO= "Community Photo"
LOG_COMMUNITY_DESCRIPTION= "Community Description"
LOG_OWNER_ID= "Owner ID"
LOG_PRIVACY= "Privacy"

class LoginViewTestCase(TestCase):
        
    # Define constant post data
    POST_DATA_SUCCESS = {
        'username' : 'testuser',
        'password' : 'testpassword'
    }

    POST_DATA_FAILURE_MISSING_KEYS = {
        # Missing required fields
        'username' : '',
        'password' : ''
    }

    POST_DATA_FAILURE_INVALID_CREDENTIALS = {
        'username' : 'wronguser',
        'password' : 'wrongpassword'
    }

    POST_DATA_FAILURE_WHITESPACE_USERNAME = {
        'username' : ' ',
        'password' : 'testpassword'
    }

    POST_DATA_FAILURE_WHITESPACE_PASSWORD = {
        'username' : 'testuser',
        'password' : ' '
    }

    def setUp(self):
        # create a user for the successful login test case
        self.user = User.objects.create_user(username = 'testuser', password = 'testpassword', email = 'success@example.com')

    def test_login_success(self):
        # loggin the test we are in
        logging.info("TESTING LOGIN_SUCCESS....")

        # Simulate a client
        client = Client()

        # make a POST request to the login_view
        response = client.post(reverse('login_view'), data=json.dumps(self.POST_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # check if the response status code is 200
        self.assertEqual(response.status_code, 200)
    
    def test_login_failure_missing_keys(self):
        # logging the test we are in
        logging.info("TESTING LOGIN_FAILURE_MISSING_KEYS....")

        # simulate the client
        client = Client()

        # make a POST request to the login_view with missing keys
        response = client.post(reverse('login_view'), data=json.dumps(self.POST_DATA_FAILURE_MISSING_KEYS), content_type=CONTENT_TYPE_JSON)

        # check if the response status is 400
        self.assertEqual(response.status_code, 400)

    def test_login_failure_invalid_credentials(self):
        # logging the test we are in
        logging.info("TESTING LOGIN_FAILURE_INVALID_CREDENTIALS....")

        # simulate the client
        client = Client()

        # make a POST request to the login_view with missing keys
        response = client.post(reverse('login_view'), data=json.dumps(self.POST_DATA_FAILURE_INVALID_CREDENTIALS), content_type=CONTENT_TYPE_JSON)

        # check if the response status is 400
        self.assertEqual(response.status_code, 400)
    
    def test_login_failure_whitespace_username(self):
        # logging the test we are in
        logging.info("TESTING LOGIN_FAILURE_WHITESPACE_USERNAME....")

        # simulate the client
        client = Client()

        # make a POST request to the login_view with missing keys
        response = client.post(reverse('login_view'), data=json.dumps(self.POST_DATA_FAILURE_WHITESPACE_USERNAME), content_type=CONTENT_TYPE_JSON)

        # check if the response status is 400
        self.assertEqual(response.status_code, 400)

    def test_login_failure_whitespace_password(self):
        # logging the test we are in
        logging.info("TESTING LOGIN_FAILURE_WHITESPACE_PASSWORD....")

        # simulate the client
        client = Client()

        # make a POST request to the login_view with missing keys
        response = client.post(reverse('login_view'), data=json.dumps(self.POST_DATA_FAILURE_WHITESPACE_PASSWORD), content_type=CONTENT_TYPE_JSON)

        # check if the response status is 400
        self.assertEqual(response.status_code, 400)

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
        queryset = Badges.objects.all()
        for obj in queryset:
            logging.info("1 day: %s", obj.one_day)
            logging.info("7 day: %s", obj.one_week)
            logging.info("30 day: %s", obj.one_month)
            logging.info("365 day: %s", obj.one_year)
            logging.info('')  

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

class LogoutViewTestCase(TestCase):
    
    # Define constant post data
    POST_DATA_SUCCESS = {
        'username' : 'testuser',
        'password' : 'testpassword'
    }

    def setUp(self):
        self.client = Client()
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username = 'testuser', password = 'testpasssword', email = 'testuser@example.com')
        self.login_url = reverse('login_view')
        self.logout_url = reverse('logout_view')


    def test_logout_success(self):
        # loggin the test we are in
        logging.info("TESTING LOGOUT_SUCCESS....")

        self.client.login(username = 'testuser', password = 'testpassword')

        # make a POST request to the login_view
        response = self.client.post(self.logout_url, data=self.POST_DATA_SUCCESS)

        # check if the response status code is 200
        self.assertEqual(response.status_code, 302)
        self.assertRedirects(response, self.login_url)
        self.assertNotIn('_auth_user_id', self.client.session)
    

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
        logging.info("***********test_set_times_success*******")
        # Test if user was successfully made
        client = Client()
        
        logging.info("Before: ")
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
        
        logging.info("After: ")
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
        logging.info("***********test_set_times_invalid_order_fail*******")
        # Test for time1 < time2 < time3
        client = Client()

        # Creating a POST for updating the times with INCORRECT ORDERING
        post_data = {
            'username': 'testuser',
            'time1': datetime.time(17, 35).strftime('%H:%M:%S'),
            'time2': datetime.time(7, 35).strftime('%H:%M:%S'),
            'time3': datetime.time(19, 00).strftime('%H:%M:%S'),
        }
        
        logging.info("Before: ")
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

    UPDATE_COMBO_SUCCESS = {
        'username': 'testuser',
        'lastname' : 'NewLast',
        'firstname' : 'NewFirst',
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
    
    def test_update_combo_username_success(self):
        logging.info("test_update_user_combo_success ....")

        # Make a POST request to the update_user_information_view
        response = self.client.post(reverse('update_user_information_view'), data=json.dumps(self.UPDATE_COMBO_SUCCESS), content_type=CONTENT_TYPE_JSON)
        queryset = User.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER, obj.username)
            logging.info(LOG_MSG_FORMAT, LOG_FIRST_NAME, obj.first_name)
            logging.info(LOG_MSG_FORMAT, LOG_LAST_NAME, obj.last_name)
            logging.info(LOG_MSG_FORMAT, LOG_TIME1, obj.time1)
            logging.info(LOG_MSG_FORMAT, LOG_TIME2, obj.time2)
            logging.info(LOG_MSG_FORMAT, LOG_TIME3, obj.time3)
            logging.info('')   
        # Check if the response status code is 200 indicating success
        self.assertEqual(response.status_code, 200)
    

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

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

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

        # Update the profile picture of the created user
        update_data = {
            'username': 'testuser',
            'profilepicture': self.photo
        }
        self.client.post(reverse('update_user_information_view'), data=json.dumps(update_data), content_type=CONTENT_TYPE_JSON)

    def test_get_user_information_success(self): # Successfully retrieves a valid user's information from the database
        client = Client()

        # Create test data
        get_data = {'username': 'testuser'}

        # Send GET request to get_user_information_view
        response = client.get(reverse('get_user_information_view'), data=get_data)
        response2 = client.get(reverse('get_longest_streak_view'), data=get_data)
        response3 = client.get(reverse('get_current_streak_view'), data=get_data)
        logging.info('longest streak response: %s', response2)
        logging.info('current streak response: %s', response3)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)

    def test_get_user_information_fail(self): # Fails to get user info in database due to user not existing
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'}

        # Send GET request to get_user_information_view
        response = client.get(reverse('get_user_information_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


class GetUsersInformationViewTestCase(TestCase):

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

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

    USER_DATA_2 = {
        'username': 'testuser2',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test2@example.com',
        'timezone': 'EST',
    }

    

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user to display information of
        client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA_2), content_type=CONTENT_TYPE_JSON)

        # Update the profile picture of the created user
        update_data = {
            'username': 'testuser',
            'profilepicture': self.photo
        }
        self.client.post(reverse('update_user_information_view'), data=json.dumps(update_data), content_type=CONTENT_TYPE_JSON)

    def test_get_users_information_success(self): # Successfully retrieves a valid user's information from the database
        client = Client()

        # Create test data
        get_data = {'username[]': ['testuser', 'testuser2']}

        # Send GET request to get_user_information_view
        response = client.get(reverse('get_users_information_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data) 

    def test_get_user_information_fail(self): # Fails to get user info in database due to user not existing
        client = Client()

        # Create test data
        get_data = {'username[]': ['doesnotexist', 'doesnotexist2']}

        # Send GET request to get_users_information_view
        response = client.get(reverse('get_users_information_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)




class CheckinViewTestCase(TestCase): #to test handling of checkin post for text, photo, video and audio

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
        'content_type': None,
        'content': None,
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    AUDIO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 3,
        'content_type': 'audio',
        'content': audio, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    MISSING_USERNAME = {
        'username': '',
        'moment_number': 2,
        'content_type': None,
        'content': None,
        'text_entry': 'This is a sample checkin text',
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    MISSING_MOMENT_NUMBER = {
        'username': 'testuser2',
        'moment_number': None,
        'content_type': None,
        'content': None, 
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    MISSING_CONTENT_TYPE = { 
        'username': 'testuser3',
        'moment_number': 1,
        'content_type': '',
        'content': photo, 
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }
        
    MISSING_CONTENT_AND_TEXT = {
        'username': 'testuser3',
        'moment_number': 2,
        'content_type': None,
        'content': None,
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    INVALID_USERID = { 
        'username': 'admin45678901',
        'moment_number': 1,
        'content_type': None,
        'content': None,
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    DUPLICATE_MOMENT = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': 'photo',
        'content': photo,
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
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
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
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


    def test_checkin_failure_missing_content_and_text(self): #test of failure due to missing content
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_content_and_text....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('checkin_view'), data=json.dumps(self.MISSING_CONTENT_AND_TEXT), content_type=CONTENT_TYPE_JSON)

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

class GetCheckinsViewTestCase(TestCase): # to test retreving all checkin moments from backend to frontend
    
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
        'content_type': None,
        'content': None, #fill in with example entry
        'text_entry': "This is a sample checkin text",
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, 
        'text_entry': None,
    }

    AUDIO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 3,
        'content_type': 'audio',
        'content': audio, 
        'text_entry': None,
    }

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, 
        'text_entry': None,
    }

    BOTH_TEXT_AND_MEDIA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, 
        'text_entry': "text sample to get",
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
        client.post(reverse('checkin_view'), data=json.dumps(self.BOTH_TEXT_AND_MEDIA_SUCCESS), content_type=CONTENT_TYPE_JSON)


    def test_get_checkins_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_get_checkins_success**************..........")
        client = Client()

        # Create test data
        get_data = {'username': 'testuser1'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_checkin_info_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Create test data
        get_data2 = {'username': 'testuser2'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response2 = client.get(reverse('get_checkin_info_view'), data=get_data2)

        # Check if response status code is 200
        self.assertEqual(response2.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')    

    def test_get_checkins_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_get_checkins_fail_User_DNE**************")
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'} 

        # Send GET request to get_times_view
        response = client.get(reverse('get_checkin_info_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of checkins
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   

class UpdateCheckinsViewTestCase(TestCase): 
    
    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

    check_id = -1

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

    # Define post data
    TEXT_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': None,
        'content': None, #fill in with example entry
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    
    UPDATE_TEXT_ENTRY_SUCCESS = {
        'checkin_id' : check_id,
        'text_entry': 'I am updating my text_entry'
    }

    UPDATE_CONTENT_AND_CONTENT_TYPE_SUCCESS = {
        'checkin_id' : check_id,
        'content_type': 'photo',
        'content': photo, 
    }


    INVALID_CHECKIN_ID = {
        'checkin_id' : 234,
    }

    INVALID_EMPTY_CHECKIN = {
        'checkin_id' : check_id,
        'content_type': None, 
        'content': None, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    
    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('checkin_view'), data=json.dumps(self.TEXT_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON) #make checkins into DB
        
        #get checkin_id of the checkin 
        response = client.get(reverse('get_checkin_info_view'), data={'username': 'testuser1'})
        
        # Parse the response content as JSON
        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)
        # Now you can access the dictionary returned by the view
        self.check_id = response_data[0]['checkin_id']
        logging.info("check_id: %s",self.check_id)
        

    def test_update_checkins_text_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_update_checkins_text_success**************..........")
        client = Client()

        logging.info('Before update text:')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')    

        # Send GET request to get_checkin_info_view
        self.UPDATE_TEXT_ENTRY_SUCCESS['checkin_id'] = self.check_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_checkin_info_view'), data=json.dumps(self.UPDATE_TEXT_ENTRY_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After update text:')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')    
    
   

    def test_update_checkins_content_and_type_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_update_checkins_content_and_type_success**************..........")
        client = Client()

        logging.info('Before Updated content and type:')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info('Checkin original content')   
        logging.info('')  

        # Send GET request to get_checkin_info_view
        self.UPDATE_CONTENT_AND_CONTENT_TYPE_SUCCESS['checkin_id'] = self.check_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_checkin_info_view'), data=json.dumps(self.UPDATE_CONTENT_AND_CONTENT_TYPE_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After Updated content and type:')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info('Updated Checkin content')      
        logging.info('')  


    def test_update_checkins_fail_CheckinID_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_update_checkins_fail_CheckinID_DNE**************")
        client = Client()

        response = client.post(reverse('update_checkin_info_view'), data=json.dumps(self.INVALID_CHECKIN_ID), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


    def test_update_checkins_fail_empty_checkin(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_update_checkins_fail_empty_checkin**************")
        client = Client()

        self.INVALID_EMPTY_CHECKIN['checkin_id'] = self.check_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_checkin_info_view'), data=json.dumps(self.INVALID_EMPTY_CHECKIN), content_type=CONTENT_TYPE_JSON)

        logging.info('After update attempt:')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')  

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


class DeleteCheckinViewTestCase(TestCase):  # To test deleting checkins account from the User table
    
    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

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
        'content_type': None,
        'content': None, #fill in with example entry
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'photo',
        'content': photo, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    check_id = -1 #default, will change in test
    DELETE_CHECKIN_DATA_SUCCESS = {
        'checkin_id': check_id,
    }

    DELETE_CHECKIN_DATA_FAILURE = {
        'checkin_id': 213,
    }

    def setUp(self):
        logging.info("Setting up DeleteCheckinViewTestCase")
        self.client = Client()

        # Create test user to test delete
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('checkin_view'), data=json.dumps(self.PHOTO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON) #make checkins into DB
        self.client.post(reverse('checkin_view'), data=json.dumps(self.TEXT_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        #get checkin_id of the checkin 
        response = self.client.get(reverse('get_checkin_info_view'), data={'username': 'testuser1'})
        
        # Parse the response content as JSON
        response_data = json.loads(response.content)
        logging.info("response_data of getting checkin ID: %s",response_data)
        # Now you can access the dictionary returned by the view
        self.check_id = response_data[0]['checkin_id']
        logging.info("check_id: %s",self.check_id)

    def test_delete_checkin_success(self):
        logging.info("***************test_delete_checkin_success**************".upper())
       
        logging.info('Printing BEFORE delete........')  
        queryset = Checkin.objects.all() #should only print the one checkin moment that remains
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   


        self.DELETE_CHECKIN_DATA_SUCCESS['checkin_id'] = self.check_id #change the checkin id to the id got in the setup
        response = self.client.post(reverse('delete_checkin_view'), data=json.dumps(self.DELETE_CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- success
        self.assertEqual(response.status_code, 200)

        logging.info('Printing AFTER delete........')  
        queryset = Checkin.objects.all() #should only print the one checkin moment that remains
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   

    def test_delete_checkin_failure(self):
        logging.info("***************test_delete_checkin_failure**************".upper())
        # Attempt to delete to nonexistent checkin
        response = self.client.post(reverse('delete_checkin_view'), data=json.dumps(self.DELETE_CHECKIN_DATA_FAILURE), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class GetCheckinVideoViewTestCase(TestCase): # to test retreving a video checkin moment
    
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

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    video_check_id= -1 #makes this global to access in test methods
    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('checkin_view'), data=json.dumps(self.VIDEO_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)
        response = client.get(reverse('get_checkin_info_view'), data={'username': 'testuser1'})
        
        # Parse the response content as JSON
        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)
        # Now you can access the dictionary returned by the view
        self.video_check_id = response_data[0]['checkin_id']
        logging.info("video_check_id: %s",self.video_check_id)



    def test_get_video_success(self):# Successfully retrieves a video checkin from the database
        logging.info("************TEST_get_video_success**************..........")
        client = Client()

        # Create test data
        get_data = {'checkin_id': self.video_check_id} 

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_video_info_view'), data=get_data)
        response_data = json.loads(response.content)
        logging.info("success response_data: %s",response_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)
         

    def test_get_video_fail_checkin_id_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_get_video_fail_checkin_id_DNE**************")
        client = Client()

        # get test data
        get_data = {'checkin_id': 4}

        # Send GET request 
        response = client.get(reverse('get_video_info_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)
        
class GetTodaysCheckinsViewTestCase(TestCase): # to test retreving todays checkin moments from a list of users
    
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
        'content': None, #fill in with example entry
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    PHOTO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 2,
        'content_type': 'photo',
        'content': photo, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    AUDIO_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 3,
        'content_type': 'audio',
        'content': audio, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    VIDEO_DATA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 1,
        'content_type': 'video',
        'content': video, 
        'text_entry': None,
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }

    BOTH_TEXT_AND_MEDIA_SUCCESS = {
        'username': 'testuser2',
        'moment_number': 2,
        'content_type': 'video',
        'content': photo, 
        'text_entry': "text sample to get",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
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
        client.post(reverse('checkin_view'), data=json.dumps(self.BOTH_TEXT_AND_MEDIA_SUCCESS), content_type=CONTENT_TYPE_JSON)


    def test_get_todays_checkins_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_get_todays_checkins_success**************..........")
        client = Client()

        # Create test data
        get_data = {'username[]': ['testuser1', 'testuser2']} # to retrieve todayscheckins for these user

        # Send GET request to get_todays_checkin_info_view
        response = client.get(reverse('get_todays_checkin_info_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')    

    def test_get_todays_checkins_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_get_todays_checkins_fail_User_DNE**************")
        client = Client()

        # Create test data
        get_data = {'username[]': ['testuser1', 'doesnotexist']} #second user DNE

        # Send GET request to get_times_view
        response = client.get(reverse('get_todays_checkin_info_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of checkins
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            #logging.info(LOG_MSG_FORMAT, LOG_CONTENT, obj.content)
            logging.info(LOG_MSG_FORMAT, LOG_TEXT_ENTRY, obj.text_entry)
            logging.info(LOG_MSG_FORMAT, LOG_CONTENT_TYPE, obj.content_type)
            logging.info(LOG_MSG_FORMAT, LOG_MOMENT_NUMBER, obj.moment_number)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.user_id)
            logging.info('')   

class AddFriendViewTestCase(TestCase): #to test adding friends to user's friend list

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

    ADD_FRIEND_DATA = {
        'user1': 'testuser1',
        'user2': 'testuser2',
    }

    ADD_FRIEND_DATA_ADDED_YOURSELF = {
        'user1': 'testuser1',
        'user2': 'testuser1',

    }

    ACCEPT_FRIEND_DATA = {
        'user1': 'testuser2',
        'user2': 'testuser1',
    }

    ADD_FRIEND_DATA_FAIL = {
        'user1': 'testuser1',
        'user2': 'doesnotexist',
    }

    def setUp(self):
        logging.info("---------------SETTING UP ADDFRIENDVIEWTESTCASE--------------".upper())
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make three users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)

    def test_add_friend_request_success(self): # Successfully sends a friend request
        logging.info("***************test_add_friend_request_success**************".upper())
        client = Client()

        # Send POST request to add_friend_view
        response = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- success
        self.assertEqual(response.status_code, 200)

    def test_add_friend_request_failure_DNE(self): # Fails to make a friend request, user2 does not exist
        logging.info("***************test_add_friend_request_failure_DNE**************".upper())
        client = Client()

        # Send POST request to add_friend_view
        response = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA_FAIL), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

    def test_add_friend_request_failure_added_yourself(self): # Fails to make a friend request, user2 does not exist
        logging.info("***************test_add_friend_request_failure_added_yourself**************".upper())
        client = Client()

        # Send POST request to add_friend_view
        response = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA_ADDED_YOURSELF), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


    def test_accept_friend_request_success(self): # Successfully accepts a friend request
        logging.info("***************test_accept_friend_request_success**************".upper())
        client = Client()

        # Send POST request to add_friend_view to send initial friend request
        friend_request = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if friend_request status code is 200 -- sent successfully
        self.assertEqual(friend_request.status_code, 200)

        # Send POST request to add_friend_view to accept the friend request
        response = client.post(reverse('add_friend_view'), data=json.dumps(self.ACCEPT_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- accepted successfully
        self.assertEqual(response.status_code, 200)

    def test_add_friend_request_failure_exists(self): # Fails to make a friend request, friendship already exists
        logging.info("***************test_add_friend_request_failure_exists**************".upper())
        client = Client()

        # Send POST request to add_friend_view to send initial friend request
        friend_request = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- request sent successfully
        self.assertEqual(friend_request.status_code, 200)

        # Send POST request to add_friend_view to accept the friend request
        accept_request = client.post(reverse('add_friend_view'), data=json.dumps(self.ACCEPT_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- accepted successfully
        self.assertEqual(accept_request.status_code, 200)

        # Send POST request to add_friend_view to send the same friend request again
        response = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure due to relationship already existing
        self.assertEqual(response.status_code, 400)

    def test_add_friend_request_failure_duplicate(self): # Fails to make a friend request, already sent the friend request
        logging.info("***************test_add_friend_request_failure_duplicate**************".upper())
        client = Client()

        # Send POST request to add_friend_view to send initial friend request
        response1 = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- sends friend request successfully
        self.assertEqual(response1.status_code, 200)
        
        # Send POST request to add_friend_view to send the same friend request again
        response2 = client.post(reverse('add_friend_view'), data=json.dumps(self.ADD_FRIEND_DATA), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure due to sending friend request twice
        self.assertEqual(response2.status_code, 400)

class DeleteFriendViewTestCase(TestCase):  # To test deleting friends from the user's friend list

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


    DELETE_FRIEND_DATA_SUCCESS = {
    'username': 'testuser1',
    'unfriendusername': 'testuser2',  
    }

    DELETE_FRIEND_DATA_FAILURE = {
    'username': 'testuser1',
    'unfriendusername': 'nonexistinguser'  
    }

    def setUp(self):
        logging.info("Setting up DeleteFriendViewTestCase")
        self.client = Client()

        # Create test users
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)

        # Send a friend request
        self.client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser2'
        }), content_type=CONTENT_TYPE_JSON)

        # Update the database to accept the friend request
        Friends.objects.filter(user1__username='testuser1', user2__username='testuser2').update(complete=True)


    def test_delete_friend_success(self):
        logging.info("***************test_delete_friend_success**************".upper())


        logging.info('BEFORE DELETE')
        queryset = Friends.objects.all() 
        for obj in queryset:
            # Log user information
            logging.info(LOG_MSG_FORMAT, LOG_FRIENDSHIP_ID, obj.friendship_id)
            logging.info(LOG_MSG_FORMAT, LOG_FRIENDSHIP_STATUS, obj.complete)
            logging.info(LOG_MSG_FORMAT, LOG_USER1_ID, obj.user1)
            logging.info(LOG_MSG_FORMAT, LOG_USER2_ID, obj.user2)
            logging.info('')  
         
        # Delete the friend relationship
        response = self.client.post(reverse('delete_friend_view'), data=json.dumps(self.DELETE_FRIEND_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        logging.info('AFTER DELETE')
        queryset = Friends.objects.all() 
        for obj in queryset:
            # Log user information
            logging.info(LOG_MSG_FORMAT, LOG_FRIENDSHIP_ID, obj.friendship_id)
            logging.info(LOG_MSG_FORMAT, LOG_FRIENDSHIP_STATUS, obj.complete)
            logging.info(LOG_MSG_FORMAT, LOG_USER1_ID, obj.user1)
            logging.info(LOG_MSG_FORMAT, LOG_USER2_ID, obj.user2)
            logging.info('')  

        # Check if response status code is 200 -- success
        self.assertEqual(response.status_code, 200)

    def test_delete_friend_failure(self):
        logging.info("***************test_delete_friend_failure**************".upper())
        # Attempt to delete a non-existing friend relationship
        response = self.client.post(reverse('delete_friend_view'), data=json.dumps(self.DELETE_FRIEND_DATA_FAILURE), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class GetFriendsViewTestCase(TestCase): # to test retreving all checkin moments from backend to frontend
    
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

    USER3_DATA = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test3@example.com',
        'timezone': 'EST',
    }


    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)

        # Send a friend request
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser2' #user 1 adds user2
        }), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser3' #user 1 adds user3
        }), content_type=CONTENT_TYPE_JSON)

        #accept requests of friend testuser1
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser2',
            'user2': 'testuser1' #user 2 adds user 1
        }), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser3',
            'user2': 'testuser1' #user 3 adds user 1
        }), content_type=CONTENT_TYPE_JSON)

    def test_get_friends_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_get_friends_success**************..........")
        client = Client()

        # Create test data
        get_data = {'username': 'testuser1'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_friends_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(obj)
            logging.info('') 

    def test_get_friends_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_get_friends_fail_User_DNE**************")
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'} 

        # Send GET request
        response = client.get(reverse('get_friends_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of checkins
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(obj)
            logging.info('')   


class GetPendingFriendRequestsSentViewTestCase(TestCase): # to test retreving all checkin moments from backend to frontend
   
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

    USER3_DATA = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test3@example.com',
        'timezone': 'EST',
    }


    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)

        # Send a friend request
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser2' #user 1 adds user2
        }), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser3' #user 1 adds user3
        }), content_type=CONTENT_TYPE_JSON)

        #accept requests of friend testuser1
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser2',
            'user2': 'testuser1' #user 2 adds user 1
        }), content_type=CONTENT_TYPE_JSON) 
        #leave pending sent by testuser1 to user 3

        
    def test_GetPendingFriendRequestsSent_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************test_GetPendingFriendRequestsSent_success**************..........")
        client = Client()

        # Create test data
        get_data = {'username': 'testuser1'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_pending_requests_sent_friends_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')


    def test_GetPendingFriendRequestsSent_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************Test_GetPendingFriendRequestsSent_fail_User_DNE**************")
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'} 

        # Send GET request
        response = client.get(reverse('get_pending_requests_sent_friends_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class GetPendingFriendRequestsRecievedViewTestCase(TestCase): # to test retreving all checkin moments from backend to frontend
   
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

    USER3_DATA = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test3@example.com',
        'timezone': 'EST',
    }


    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)

        # Send a friend request
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser2' #user 1 adds user2
        }), content_type=CONTENT_TYPE_JSON)
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser1',
            'user2': 'testuser3' #user 1 adds user3
        }), content_type=CONTENT_TYPE_JSON)

        #accept requests of friend testuser1
        client.post(reverse('add_friend_view'), data=json.dumps({
            'user1': 'testuser2',
            'user2': 'testuser1' #user 2 adds user 1
        }), content_type=CONTENT_TYPE_JSON) 
        #leave pending sent by testuser1 to user 3

        
    def test_GetPendingFriendRequestsReceivedViewTestCase_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************test_GetPendingFriendRequestsRecievedViewTestCase_success**************..........")
        client = Client()

        # Create test data
        get_data = {'username': 'testuser3'} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_pending_requests_received_friends_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')

    def test_GetPendingFriendRequestsReceivedViewTestCase_fail_User_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************Test_GetPendingFriendRequestsReceivedViewTestCase_fail_User_DNE**************")
        client = Client()

        # Create test data
        get_data = {'username': 'doesnotexist'} 

        # Send GET request
        response = client.get(reverse('get_pending_requests_received_friends_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class DeleteUserViewTestCase(TestCase):  # To test deleting users account from the User table
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

    DELETE_USER_DATA_SUCCESS = {
        'username': 'testuser1',
    }

    DELETE_USER_DATA_FAILURE = {
        'username': 'UserDNE',
    }


    def setUp(self):
        logging.info("Setting up DeleteUserViewTestCase")
        self.client = Client()

        # Create test user to test delete
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)


    def test_delete_user_success(self):
        logging.info("***************test_delete_user_success**************".upper())
        # Delete the friend relationship
        response = self.client.post(reverse('delete_user_view'), data=json.dumps(self.DELETE_USER_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- success
        self.assertEqual(response.status_code, 200)

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

    def test_delete_friend_failure(self):
        logging.info("***************test_delete_user_failure**************".upper())
        # Attempt to delete a non-existing friend relationship
        response = self.client.post(reverse('delete_user_view'), data=json.dumps(self.DELETE_USER_DATA_FAILURE), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class GetUserBadgesViewTestCase(TestCase):

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

    BADGES_DATA_SUCCESS = {
        'one_day': True,
        'one_week': False,
        'one_month': True,
        'one_year': False
    }


    def setUp(self):
        # Initialize the Django test client
        self.client = Client()

        # Create test user
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)
        user = User.objects.get(username=self.USER1_DATA['username'])

        # Update or create the Badges entry for the created user
        Badges.objects.update_or_create(user_id=user, defaults=self.BADGES_DATA_SUCCESS)


    def test_get_user_badges_success(self):
        logging.info("************TEST_get_user_badges_success**************")
        
        # Send GET request to get_badges_view with the username
        response = self.client.get(reverse('get_badges_view'), {'username': self.USER1_DATA['username']})
        response_data = json.loads(response.content)
        logging.info("response_data: %s", response_data)

        # Check if response status code is 200 -- method successful
        self.assertEqual(response.status_code, 200)


        # Checking True cases that should be returned from method
        if self.BADGES_DATA_SUCCESS['one_day']:
            self.assertTrue(response_data['one_day'])
        if self.BADGES_DATA_SUCCESS['one_month']:
            self.assertTrue(response_data['one_month'])


    def test_get_user_badges_fail_User_DNE(self):
        logging.info("************TEST_get_user_badges_fail_User_DNE**************")
        
        # Send GET request to get_badges_view with a non-existing username
        response = self.client.get(reverse('get_badges_view'), {'username': 'nonexistentuser'})
        logging.info("failure response_data: %s", response.content.decode('utf-8'))
        
        # View returns 400 for non-existing users 
        self.assertEqual(response.status_code, 400)

class GetProfilePictureViewTestCase(TestCase): # to retrieve profile pictures from a given list of usernames
    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

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

    USER2_DATA = {
        'username': 'testuser1',
        'password': 'testpassword2',
        'reentered_password': 'testpassword2',
        'firstname': 'Tes2',
        'lastname': 'User2',
        'email': 'test1@example.com',
        'timezone': 'EST',
    }


    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        update_data = {
            'username': 'testuser',
            'profilepicture': self.photo
        }
        self.client.post(reverse('update_user_information_view'), data=json.dumps(update_data), content_type=CONTENT_TYPE_JSON)        
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)
        update_data1 = {
            'username': 'testuser1',
            'profilepicture': self.photo
        }
        self.client.post(reverse('update_user_information_view'), data=json.dumps(update_data1), content_type=CONTENT_TYPE_JSON)    

    def test_get_profile_pictures_success(self):# Successfully retrieves a valid user's profile pictures
        logging.info("************ TEST_get_profile_pictures_Success **************")
        client = Client()

        # Create test data
        get_data = {'username_list[]': ['testuser', 'testuser1']} # to retrieve the profile pictures for the list of users

        # Send GET request to get_profile_pictures_view
        response = client.get(reverse('get_profile_pictures_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of profile pictures
        logging.info('Response: %s', response)
        logging.info('')
        queryset = User.objects.all()

        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.id)
            logging.info(LOG_MSG_FORMAT, LOG_PROFILE_PICTURE, obj.profile_picture)
            logging.info('') 


    def test_get_profile_pictures_fail(self):# Fails to get profile pictures in database due to user not existing
        logging.info("***************TEST_get_profile_pictures_fail**************")
        client = Client()

        # Create test data
        get_data = {'username_list[]': ['doesnotexist', 'doesnotexist2']} # to retrieve profile pictures for these users

        # Send GET request to get_profile_pictures_view
        response = client.get(reverse('get_profile_pictures_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

        # Printing DB after attempted getting of profile pictures
        queryset = User.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_USER_ID, obj.id)
            logging.info(LOG_MSG_FORMAT, LOG_PROFILE_PICTURE, obj.profile_picture)
            logging.info('')   
       

class CreateCommunityViewTestCase(TestCase): #to test handling of checkin post for text, photo, video and audio

    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt')) #for community pic test
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    photoFile.close()

    
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

    COMMUNITY_SUCCESS = {
        'community_name': "Name of Community",
        "community_photo": photo,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    MISSING_COMMUNITY_NAME = {
        'community_name': None,
        "community_photo": photo,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    MISSING_COMMUNITY_PHOTO = { #this should be okay/no error
        'community_name': "Name of Community Here",
        "community_photo":None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    MISSING_COMMUNITY_DESCRIPTION= { 
        'community_name': "Name of Community Here",
        "community_photo": photo,
        "community_description": None,
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }
        
    MISSING_USERNAME = {
        'community_name': "Name of Community Here",
        "community_photo": photo,
        "community_description": "Test Description",
        "usename": None, # username of the owner
        "privacy": 'public',
    }

    MISSING_PRIVACY = {
        'community_name': "Name of Community Here",
        "community_photo": photo,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": None,
    }

    INVALID_USERNAME = { 
        'community_name': "Name of Community Here",
        "community_photo": photo,
        "community_description": "Test Description",
        "username": "DNE", # invalid username of the owner
        "privacy": 'public',
    }

    DUPLICATE_COMMUNITY_NAME = { #Call Twice
        'community_name': "Name of Community Here",
        "community_photo": photo,
        "community_description": "Test Description",
        "username": "testuser1", # user_id of the owner
        "privacy": 'public',
    }

    # Set up method to create a test user
    def setUp(self):
        logging.info("SETTING UP CHECKIN....")

        # Initialize the Django test client
        client = Client()

        # Make a POST request to create a test user
        client.post(reverse('create_user_view'), data=json.dumps(self.CREATE_USER_1), content_type=CONTENT_TYPE_JSON)

    def test_community_success(self): #test of successful text entry submission
        # logging the test we are in
        logging.info("TESTING COMMUNITY_SUCCESS....")
        client = Client()

        response = client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200)

        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk) #this is the user obj
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('')   

    def test_community_failure_missing_community_name(self): #test of failure due to missing username
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_community_name....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.MISSING_COMMUNITY_NAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_community_failure_missing_commUnity_description(self): #test of failure due to missing moment number
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_COMMUNITY_DESCRIPTION....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.MISSING_COMMUNITY_DESCRIPTION), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_community_failure_missing_OWNERID(self): #test of failure due to missing moment number
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_OWNERID....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.MISSING_USERNAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)

    def test_community_failure_missing_PRIVACY(self): #test of failure due to missing moment number
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_missing_PRIVACY....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.MISSING_PRIVACY), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)


    def test_community_SUCCESS_missing_community_photo(self): #test of failure due to missing content
        # logging the test we are in
        logging.info(("TESTING CHECKIN_SUCCESS_missing_community_photo ALLOWED....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.MISSING_COMMUNITY_PHOTO), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200) #SHOULD ALLOW MISSING PHOTO AND SUCCEED

        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo allowed")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('')  

    def test_community_failure_duplicate_community_name(self): #test of failure due to duplicate moment for the same day and user
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_duplicate_community....").upper())
        client = Client()

        # Make two POST requests to the checkin_view to simulate a duplicate moment
        response = client.post(reverse('create_community_view'), data=json.dumps(self.DUPLICATE_COMMUNITY_NAME), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('create_community_view'), data=json.dumps(self.DUPLICATE_COMMUNITY_NAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 200) #first should work
        self.assertEqual(response2.status_code, 400) #second should cause error

    def test_community_failure_invalid_ownerid(self): #test of failure due to invalid user id (foreign key)
        # logging the test we are in
        logging.info(("TESTING CHECKIN_failure_invalid_OWNERid....").upper())
        client = Client()

        # Make a POST request to the checkin_view
        response = client.post(reverse('create_community_view'), data=json.dumps(self.INVALID_USERNAME), content_type=CONTENT_TYPE_JSON)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400)


class GetSpecificCommunityInfoViewTestCase(TestCase): # front end passes us a community_name and we return that communities info

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

    COMMUNITY_SUCCESS = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS), content_type=CONTENT_TYPE_JSON) #make community

        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo- okay")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('') 



    def test_get_specific_community_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_get_specific_community_success**************..........")
        client = Client()

        # Create test data
        get_data = {'community_name': "Name of Community"} # to retrieve all (or if one add in moment#) checkins for this user

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_specific_community_info_view'), data=get_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo- okay")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('') 
            logging.info('') 

    def test_get_specific_community_fail_name_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_get_specific_community_fail_name_DNE**************")
        client = Client()

        # Create test data
        get_data = {'community_name': 'doesnotexist'} 

        # Send GET request
        response = client.get(reverse('get_specific_community_info_view'), data=get_data)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class GetAllCommunityInfoViewTestCase(TestCase): # front end calls get and we return all public communities info

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
    USER3_DATA = {
        'username': 'PRIVACYUSERNAME',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'PP@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'public',
    }

    COMMUNITY_SUCCESS_3 = {
        'community_name': "THIS IS MY THIRD COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community



    def test_get_all_community_success(self):# Successfully retrieves all public communities
        logging.info("************TEST_get_all_community_success**************..........")
        client = Client()

        # Send GET request to get_checkin_info_view
        response = client.get(reverse('get_all_community_info_view'))

        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

class GetUserCommunityInfoViewTestCase(TestCase): # front end calls get and we return all user's communities info

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

    GET_USER_COMMUNITIES_SUCCESS_1 = {
        'community_name': "THIS IS MY FIRST COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    GET_USER_COMMUNITIES_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    GET_USER_COMMUNITIES_SUCCESS_3 = {
        'community_name': "THIS IS MY ONLY COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'public',
    }

    PUBLIC_JOIN_POST_DATA = {
        'community_name': "THIS IS MY ONLY COMMUNITY",
        "username": "testuser1",
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PUBLIC_JOIN_POST_DATA), content_type=CONTENT_TYPE_JSON) #testuser1 joins public community 3



    def test_get_user_communities_success(self):# Successfully retrieves all user specific communities
        logging.info("************TEST_get_user_communities_success**************..........")
        client = Client()

        # Send GET request to get_user_community_info_view
        response = client.get(reverse('get_user_community_info_view'), data={'username': 'testuser1'})

        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that it returns communities 1,2,3
        self.assertEqual(len(response_data), 3)
        self.assertEqual(response_data[0]['community_name'], 'THIS IS MY FIRST COMMUNITY')
        self.assertEqual(response_data[1]['community_name'], 'THIS IS MY SECOND COMMUNITY')
        self.assertEqual(response_data[2]['community_name'], 'THIS IS MY ONLY COMMUNITY')
    
    def test_get_user_communities_fail(self):# Fails retrieves nonexistent user specific communities 
        logging.info("************TEST_get_user_communities_fail**************..........")
        client = Client()

        # Send GET request to get_user_community_info_view
        response = client.get(reverse('get_user_community_info_view'), data={'username': 'doesnotexist'})

        # Check if response status code is 400 -- failing
        self.assertEqual(response.status_code, 400)

class GetOwnerCommunityInfoViewTestCase(TestCase): # front end calls get and we return all communities the user owns

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

    GET_USER_COMMUNITIES_SUCCESS_1 = {
        'community_name': "THIS IS MY FIRST COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    GET_USER_COMMUNITIES_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    GET_USER_COMMUNITIES_SUCCESS_3 = {
        'community_name': "THIS IS MY ONLY COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'public',
    }



    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON) # make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON) # make user
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community



    def test_get_owner_communities_success(self):# Successfully retrieves all user specific communities
        logging.info("************TEST_get_owner_communities_success**************..........")
        client = Client()

        # Send GET request to get_owner_community_info_view
        response = client.get(reverse('get_owner_community_info_view'), data={'username': 'testuser1'})

        response_data = json.loads(response.content)
        logging.info("response_data: %s", response_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that it returns community 1+2, but not 3
        self.assertEqual(len(response_data), 2)
        self.assertEqual(response_data[0]['community_name'], 'THIS IS MY FIRST COMMUNITY')
        self.assertEqual(response_data[1]['community_name'], 'THIS IS MY SECOND COMMUNITY')
    
    def test_get_owner_communities_fail(self):# Fails retrieves nonexistent user specific communities 
        logging.info("************TEST_get_owner_communities_fail**************..........")
        client = Client()

        # Send GET request to get_owner_community_info_view
        response = client.get(reverse('get_owner_community_info_view'), data={'username': 'doesnotexist'})

        # Check if response status code is 400 -- failing
        self.assertEqual(response.status_code, 400)

class UpdateCommunityViewTestCase(TestCase): 
    
    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()

    community_id = -1

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
    COMMUNITY_SUCCESS = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    COMMUNITY_TAKEN_SUCCESS = { #to test switching name to a duplicate
        'community_name': "taken",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }
    
    UPDATE_COMMUNITY_NAME_SUCCESS = {
        'community_id' : community_id,
        'username': "testuser1",
        'new_community_name': 'Updated name'
    }

    UPDATE_COMMUNITY_DESCRIPTION_SUCCESS = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_description": "UPDATED Test Description", 
    }

    UPDATE_COMMUNITY_OWNER_SUCCESS = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_owner": "testuser2", 
    }

    UPDATE_COMMUNITY_PHOTO_SUCCESS = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_photo": photo, 
    }

    UPDATE_COMMUNITY_PRIVACY_SUCCESS = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_privacy": "private", 
    }

    UPDATE_MULTIPLE_FIELDS = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_privacy": "private", 
        'new_community_name': 'Updated name again',
    }

    INVALID_COMMUNITY_ID = {
        'community_id' : -999,
        'username': "testuser1",
    }

    INVALID_NEW_OWNER = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_owner": "DNE", 
    }

    INVALID_DUPLICATE_COMMUNITY_NAME = {
        'community_id' : community_id,
        'username': "testuser1",
        "new_community_name": "taken", 
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS), content_type=CONTENT_TYPE_JSON) #make community to update
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_TAKEN_SUCCESS), content_type=CONTENT_TYPE_JSON) #use to call community name the same as previous to test duplicate
       
        #get community_id of the community 
        response = client.get(reverse('get_specific_community_info_view'), data={'community_name': 'Name of Community'})
        
        # Parse the response content as JSON
        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)
        # Now you can access the dictionary returned by the view
        self.community_id = response_data['community_id']
        logging.info("community_id: %s",self.community_id)

        
        
    #success cases
    def test_update_community_name_success(self):
        logging.info("************TEST_update_community_name_success**************..........")
        client = Client()

        logging.info('Before update name:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")   

        # Send GET request
        self.UPDATE_COMMUNITY_NAME_SUCCESS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_COMMUNITY_NAME_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of community
        logging.info('Response: %s', response)
        logging.info('After update name:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")   

    
   
    def test_update_community_owner_success(self):# Successfully retrieves a valid user's checkins from the database
        logging.info("************TEST_update_community_owner_success**************..........")
        client = Client()

        logging.info('Before Updated community_owner:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")    

        # Send GET request to get_checkin_info_view
        self.UPDATE_COMMUNITY_OWNER_SUCCESS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_COMMUNITY_OWNER_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After Updated owner:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")   

    
    def test_update_community_photo_success(self):
        logging.info("************TEST_update_community_photo_success**************..........")
        client = Client()

        logging.info('Before update community photo:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")      

        # Send GET request to get_checkin_info_view
        self.UPDATE_COMMUNITY_PHOTO_SUCCESS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_COMMUNITY_PHOTO_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After update photo:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("new photo: %s",obj.community_photo)
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")   

    def test_update_community_privacy_success(self):
        logging.info("************TEST_update_community_privacy_success**************..........")
        client = Client()

        logging.info('Before update privacy:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")     

        # Send GET request to get_checkin_info_view
        self.UPDATE_COMMUNITY_PRIVACY_SUCCESS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_COMMUNITY_PRIVACY_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After update privacy:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")     


    def test_update_community_description_success(self):
        logging.info("************TEST_update_community_description_success**************..........")
        client = Client()

        logging.info('Before update description:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")    

        # Send GET request to get_checkin_info_view
        self.UPDATE_COMMUNITY_DESCRIPTION_SUCCESS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_COMMUNITY_DESCRIPTION_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After update description:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")    


    def test_update_community_multiple_fields_success(self):
        logging.info("************TEST_update_community_multiple_fields_success**************..........")
        client = Client()

        logging.info('Before update name and privacy:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")    

        # Send GET request to get_checkin_info_view
        self.UPDATE_MULTIPLE_FIELDS['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.UPDATE_MULTIPLE_FIELDS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Printing DB after attempted getting of checkins
        logging.info('Response: %s', response)
        logging.info('After update name and privacy:')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info("")    
  


    # #fail cases
    def test_update_community_fail_communityID_DNE(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_update_community_fail_CommunityID_DNE**************")
        client = Client()

        response = client.post(reverse('update_community_view'), data=json.dumps(self.INVALID_COMMUNITY_ID), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


    def test_update_community_fail_invalid_new_owner(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_update_community_fail_invalid_new_owner**************")
        client = Client()

        response = client.post(reverse('update_community_view'), data=json.dumps(self.INVALID_NEW_OWNER), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)


    def test_update_community_fail_duplicate_community_name(self):# Fails to get checkins in database due to user not existing
        logging.info("***************TEST_update_community_fail_duplicate_community_name**************")
        client = Client()

        self.INVALID_DUPLICATE_COMMUNITY_NAME['community_id'] = self.community_id #updating post data with the correct checkin ID from the setup
        response = client.post(reverse('update_community_view'), data=json.dumps(self.INVALID_DUPLICATE_COMMUNITY_NAME), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)

class DeleteCommunityViewTestCase(TestCase):  # To test deleting community
    
    photo_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'test_resources/b64photo.txt'))
    photoFile = open(photo_file_path, 'r')
    photo = photoFile.read()
    #logging.info("PHOTO: %s", photo)
    photoFile.close()
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

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    community_id = -1 #default, will change in test

    DELETE_COMMUNITY_DATA_SUCCESS = {
        'community_id': community_id,
    }

    DELETE_COMMUNITY_DATA_FAILURE = {
        'community_id': -999,
    }
    
    def setUp(self):
        logging.info("Setting up DeleteCommunityViewTestCase")

        self.client = Client()
        
        # Create test user to test delete
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        self.client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community

        #get community_id of the checkin
        response = self.client.get(reverse('get_specific_community_info_view'), data={'community_name': 'Name of Community'})

        # Parse the response content as JSON
        response_data = json.loads(response.content)
        logging.info("response_data of getting community_id: %s",response_data)

        # Now you can access the dictionary returned by the view
        self.community_id = response_data['community_id']
        logging.info("community_id: %s",self.community_id)

    def test_delete_community_success(self):
        logging.info("***************test_community_delete_success**************".upper())
        logging.info('Printing BEFORE delete........')

        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo- okay")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('')

        logging.info('Printing users in communityuser table before........')
        queryset = CommunityUser.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, "Community ID: ", obj.community_id)
            logging.info(LOG_MSG_FORMAT, "Community user ID: ", obj.community_id)

        self.DELETE_COMMUNITY_DATA_SUCCESS['community_id'] = self.community_id #change the checkin id to the id got in the setup
        response = self.client.post(reverse('delete_community_view'), data=json.dumps(self.DELETE_COMMUNITY_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Check if response status code is 200 -- success
        self.assertEqual(response.status_code, 200)
        
        logging.info('Printing AFTER delete........')
        queryset = Community.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_NAME, obj.community_name)
            logging.info("missing photo- okay")
            logging.info(LOG_MSG_FORMAT, LOG_COMMUNITY_DESCRIPTION, obj.community_description)
            logging.info(LOG_MSG_FORMAT, LOG_OWNER_ID, obj.owner_id.pk)
            logging.info(LOG_MSG_FORMAT, LOG_PRIVACY, obj.privacy)
            logging.info('')

        logging.info('Printing users in communityuser table after........')
        queryset = CommunityUser.objects.all()   
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, "Community ID: ", obj.community_id)
            logging.info(LOG_MSG_FORMAT, "Community user ID: ", obj.community_id)

    def test_delete_checkin_failure(self):
        logging.info("***************test_delete_community_failure**************".upper())

        # Attempt to delete to nonexistent checkin

        response = self.client.post(reverse('delete_community_view'), data=json.dumps(self.DELETE_COMMUNITY_DATA_FAILURE), content_type=CONTENT_TYPE_JSON)
        
        # Check if response status code is 400 -- failure
        self.assertEqual(response.status_code, 400)
    
class JoinCommunityViewTestCase(TestCase): 
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
    PUBLIC_COMMUNITY = {
        'community_name': "Name of public Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    PUBLIC_JOIN_POST_DATA = {
        'community_name': "Name of public Community",
        "username": "testuser2",
    }

    # Define post data
    PRIVATE_COMMUNITY = {
        'community_name': "Name of private Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    PRIVATE_REQUEST_POST_DATA= {
        "username": "testuser2",
        "community_name": "Name of private Community",
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make two users
        client.post(reverse('create_community_view'), data=json.dumps(self.PUBLIC_COMMUNITY), content_type=CONTENT_TYPE_JSON) #make public community
        client.post(reverse('create_community_view'), data=json.dumps(self.PRIVATE_COMMUNITY), content_type=CONTENT_TYPE_JSON) #make private community


    # Success cases
    def test_private_request_community_success(self):
        logging.info("************TEST_request_community_success**************..........")
        client = Client()

        response= client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PRIVATE_REQUEST_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member status is 0
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 0)
           

    def test_public_community_join_success(self):
        logging.info("************test_public_community_join_success**************..........")
        client = Client()

        # Send POST to join public community
        response = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PUBLIC_JOIN_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member is added to the community
        community = Community.objects.get(community_name='Name of public Community')
        user = User.objects.get(username='testuser2')
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 2)


    def test_accepted_join_success(self):
        logging.info("************test_accepted_join_success**************..........")
        client = Client()

        # Get the private community and user objects
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')

        # Create relationship that simulates being invited to a community
        CommunityUser.objects.create(user_id= user, community_id = community, status= 1, date_joined= datetime.date.today())

        # Check that the member status is 1
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 1)

        # Send POST to accept invitation
        response= client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PRIVATE_REQUEST_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member status is 2
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 2)


    def test_already_requested_join_failure(self):
        logging.info("************test_already_requested_join_failure**************..........")
        client = Client()
        
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')
        CommunityUser.objects.create(user_id= user, community_id = community, status= 0, date_joined=datetime.date.today())
        
        # Send POST to join private community
        response = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PRIVATE_REQUEST_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 400)
        

    def test_already_in_community_join_failure(self):
        logging.info("************test_already_in_community_join_failure**************..........")
        client = Client()

        # Send POST to join public community
        response = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PUBLIC_JOIN_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member is added to the community
        community = Community.objects.get(community_name='Name of public Community')
        user = User.objects.get(username='testuser2')
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 2)

        # Send POST to join public community AGAIN
        response = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PUBLIC_JOIN_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 400)

class InviteToJoinCommunityViewTestCase(TestCase):
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

    USER3_DATA = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test3@example.com',
        'timezone': 'EST',
    }

    # Define post data
    PRIVATE_COMMUNITY = {
        'community_name': "Name of private Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_INVITE_POST_DATA = {
        'owner_username': 'testuser1', # username of the owner
        'invited_username': 'testuser2',
        'community_name': 'Name of private Community', 
    }

    IMPOSTER_COMMUNITY_INVITE_POST_DATA = {
        'owner_username': 'testuser3', # username of the owner
        'invited_username': 'testuser2',
        'community_name': 'Name of private Community', 
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make owner
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make other user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make imposter owner
        client.post(reverse('create_community_view'), data=json.dumps(self.PRIVATE_COMMUNITY), content_type=CONTENT_TYPE_JSON) #make private community
    
    def test_invite_to_join_community_success(self):
        logging.info("************TEST_invite_to_join_community_success**************..........")
        client = Client()

        # Send POST to invite user to join private community
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member is invited to the community
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 1)
    
    def test_accept_join_request_success(self):
        logging.info("************TEST_invite_to_join_community_success**************..........")
        client = Client()

        # Get the private community and user objects
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')

        # Create relationship that simulates user requesting to join a community
        CommunityUser.objects.create(user_id= user, community_id = community, status= 0, date_joined= datetime.date.today())

        # Send POST to accept the user's request to join the private community
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member is added to the community
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 2)

    def test_already_invited_invite_failure(self):
        logging.info("************TEST_already_invited_invite_failure**************..........")
        client = Client()

        # Send POST to invite user to join private community
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 200)

        # Check that the member is invited to the community
        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')
        self.assertEqual(CommunityUser.objects.get(user_id=user.pk, community_id=community.pk).status, 1)

        # Send POST to invite user to join private community AGAIN
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 400)
    
    def test_already_in_community_invite_failure(self):
        logging.info("************TEST_already_in_community_invite_failure**************..........")
        client = Client()

        community = Community.objects.get(community_name='Name of private Community')
        user = User.objects.get(username='testuser2')

        # Create relationship that simulates user already in the community
        CommunityUser.objects.create(user_id= user, community_id = community, status= 2, date_joined= datetime.date.today())

        # Send POST to invite user to join private community
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 400)

    def test_not_owner_invite_failure(self):
        logging.info("************TEST_not_owner_invite_failure**************..........")
        client = Client()

        # Send POST to invite user to join private community from someone who is not the owner of the community
        response = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.IMPOSTER_COMMUNITY_INVITE_POST_DATA), content_type=CONTENT_TYPE_JSON)
        self.assertEqual(response.status_code, 400)

class GetUsersInCommunityViewTestCase(TestCase):

    USER_DATA = {
        'username': 'testuser',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test@example.com',
        'timezone': 'EST',
    }

    USER_DATA_2 = {
        'username': 'testuser2',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test2@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_DATA = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser",  # username of the owner
        "privacy": 'public',
    }

    def setUp(self):
        # Initialize the Django test client
        self.client = Client()

        # Make a POST request to create test users and a community
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type='application/json')
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA_2), content_type='application/json')
        self.client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_DATA), content_type='application/json')

        #create connection of user to communities
        user1= User.objects.get(username="testuser")
        user2= User.objects.get(username="testuser2")
        community= Community.objects.get(community_name="Name of Community")
        logging.info("User1: %s", user1)
        logging.info("User2: %s", user2)
        logging.info("Community: %s", community)

        logging.info("communityUsers: ")
        queryset = CommunityUser.objects.all()
        for obj in queryset:
            logging.info(obj)

        logging.info("before")
        CommunityUser.objects.create(user_id= user2, community_id = community, status= 2, date_joined=datetime.date.today())
        logging.info("after")

    def test_get_users_in_community_success(self):
    # Create test data
        get_data = {'community_name': 'Name of Community'}

    # Send GET request to get_users_in_community_view
        response = self.client.get(reverse('get_users_in_community_view'), data=get_data)

    # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

    # Log the response data for inspection
        logging.debug("Response data: %s", response.content)



    def test_get_users_in_community_fail(self):
        # Create test data for non-existing community
        get_data = {'community_name': "DNE"}  # Non-existing community ID

        # Send GET request to get_users_in_community_view
        response = self.client.get(reverse('get_users_in_community_view'), data=get_data)

        # Log the response status code for inspection
        logging.info("Response status code: %s", response.status_code)

        # Check if response status code is 400 (Community not found)
        self.assertEqual(response.status_code, 400)

        # Log the response data for inspection
        response_data = json.loads(response.content)
        logging.info("Response data: %s", response_data)

from datetime import datetime as dt, timedelta, time as tm #do not move this import just in case... please
class UpdateStreakTestCase(TestCase):

    USER_DATA = {
        'username': 'testuser1',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test1@example.com',
        'timezone': 'EST',
    }

    CHECKIN_DATA_SUCCESS = {
        'username': 'testuser1',
        'moment_number': 1,
        'content_type': 'text',
        'content': None, #fill in with example entry
        'text_entry': "This is a sample checkin text",
        'date': datetime.datetime.today().strftime('%Y-%m-%d %H:%M:%S')
    }
    
    checkin_id=-1
    DELETE_CHECKIN_DATA_SUCCESS = {
        'checkin_id': checkin_id,
    }

    

    def setUp(self):
        logging.info("************ IN SET UP********************")
       
        # Initialize the Django test client
        self.client = Client()
        
        # Create a test user, and make a checkin for today
        self.client.post(reverse('create_user_view'), data=json.dumps(self.USER_DATA), content_type=CONTENT_TYPE_JSON)
        self.client.post(reverse('checkin_view'), data=json.dumps(self.CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Initziate GET data to get checkin ID, which will be used for deleting in test_update_streak_success
        get_data = {'username': 'testuser1'} 

        # Send GET request to get_checkin_info_view to retrieve the checkin ID in the database
        response = self.client.get(reverse('get_checkin_info_view'), data=get_data)
        
        # Save the checkin ID to a global variable used in test_update_streak_success
        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)
        self.checkin_id = response_data[0]['checkin_id']
        logging.info("checkin_id: %s",self.checkin_id)

        # Retrieve a fresh user object from the database for creating a checkin
        user = User.objects.get(username='testuser1')

        # The reason why I do not use the reverse POST to create this checkin is because
        # our create_checkin_view only uses the current date, so it would be impossible to create a checkin 2 days ago
        # **THIS WILL NOT UPDATE THE STREAK SINCE IT DOES NOT CALL DELETE_CHECKIN OR CREATE_CHECKIN VIEWS**
        checkin_2_days_ago = Checkin.objects.create(
            user_id=user,
            date=dt.combine(dt.now().date() - timedelta(days=2), tm(12, 0)), # Here the date is being set to 2 days ago
            moment_number=1,
            content_type='text',
            text_entry="Check-in 2 days ago"
        )
        logging.info(f"Created check-in: {checkin_2_days_ago.date}, {checkin_2_days_ago.text_entry}")

        # Verify the streaks are correct, which both should be 1 because the only time the streak was updated
        # was in the reverse POST at the top of this method
        user = User.objects.get(username='testuser1')
        logging.info(f'{user.username}\'s Current Streak:{user.current_streak}........EXPECT VALUE: 1')
        logging.info(f'{user.username}\'s Longest Streak:{user.longest_streak}........EXPECTED VALUE: 1')
        

        # This should return a checkin for today, none for yesterday, and a checkin for 2 days ago 
        # (which 2 days ago streak was never counted)
        logging.info("------------Printing the Checkin table AT THE END OF SETUP-----------------")
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info('')
  

    def test_update_streak_success(self):
        logging.info("****************************test_update_streak_success***********************************")

        ####################################### SETUP IN UPDATE STREAK SUCCESS ###################################

        # With this set up below, I intended to add in a check in without calling the create_checkin_view because the create checkin view
        # is what is calling update_user_streaks, so if I manually put something into the checkin table, this will not update the streak
        # hence this is a set up to see if when I call the delete view, it does what is intended when updating a streak

        # Retrieve a fresh user object from the database
        user = User.objects.get(username='testuser1')

        # Add in yesterdays checkin to add a checkin between today and 2 days ago, which I created in the setup method above
        checkin_1_days_ago = Checkin.objects.create(
            user_id=user, #use the user object
            date=dt.combine(dt.now().date() - timedelta(days=1), tm(12, 0)), # Again, the checkin view is not called because I cannot manipulate the date there
            moment_number=1,
            content_type='text',
            text_entry="Check-in yesterday"
        )
        logging.info(f"Created check-in: {checkin_1_days_ago.date}, {checkin_1_days_ago.text_entry}")

        ####################################### DELETING IN UPDATE STREAK SUCCESS ###################################
        
        logging.info("------------Printing the Checkin table BEFORE DELETING TODAY'S CHECKIN -----------------")
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info('')

        # Delete todays checkin - calls the delete view
        self.DELETE_CHECKIN_DATA_SUCCESS['checkin_id'] = self.checkin_id # Update the global checkin id in the data retrieved in the setup
        self.client.post(reverse('delete_checkin_view'), data=json.dumps(self.DELETE_CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        # Retrieve a fresh user object from the database
        user = User.objects.get(username='testuser1')
        logging.info(f"User {user.username} - Current Streak: {user.current_streak}, Longest Streak: {user.longest_streak}")
        
        logging.info("------------Printing the Checkin table after DELETING TODAY'S CHECKIN-----------------")
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info('')

        # Check current and longest streak (should be 2), because there is 2 days ago and 1 day ago, but not today (yet)
        # because today was just deleted
        user_initial = User.objects.get(username='testuser1')
        self.assertEqual(user_initial.current_streak, 2, "Current streak should be 2")
        self.assertEqual(user_initial.longest_streak, 2, "Current streak should be 2")


        ####################################### CREATING IN UPDATE STREAK SUCCESS ###################################

        # Adding back todays checkin- calls create checkin  
        self.client.post(reverse('checkin_view'), data=json.dumps(self.CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        logging.info("------------Printing the Checkin table after CREATE CHECKIN FOR TODAY-----------------")
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info('')
        
        # Retrieve a fresh user object  from the database
        user = User.objects.get(username='testuser1')
        logging.info(f"User {user.username} - Current Streak: {user.current_streak}, Longest Streak: {user.longest_streak}")
        
        # Now the checkin for today was re-added, so both streaks update to 3
        self.assertEqual(user.current_streak, 3, "Current streak should be 3")
        self.assertEqual(user.longest_streak, 3, "Longest streak should be 3")

        ####################################### DELETING TODAY AND YESTERDAY IN UPDATE STREAK SUCCESS ###################################

        # Data to GET the checkin IDs for today and yesterday to delete them
        get_data = {'username': 'testuser1'} 

        # Send GET request to get_checkin_info_view
        response = self.client.get(reverse('get_checkin_info_view'), data=get_data)
        
        # Load data retreived
        response_data = json.loads(response.content)
        logging.info("response_data: %s",response_data)

        # A list is returned and [2] is today [1] is 1 day ago [0] is 2 days ago
        checkin_id_today = response_data[2]['checkin_id']
        checkin_id_yesterday = response_data[1]['checkin_id']
        logging.info("checkin_id today: %s",checkin_id_today)
        logging.info("checkin_id yesterday: %s",checkin_id_yesterday)

        # Delete today's checkin 
        self.DELETE_CHECKIN_DATA_SUCCESS['checkin_id'] = checkin_id_today
        self.client.post(reverse('delete_checkin_view'), data=json.dumps(self.DELETE_CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)
       
        # Delete yesterday's checkin
        self.DELETE_CHECKIN_DATA_SUCCESS['checkin_id'] = checkin_id_yesterday
        self.client.post(reverse('delete_checkin_view'), data=json.dumps(self.DELETE_CHECKIN_DATA_SUCCESS), content_type=CONTENT_TYPE_JSON)

        logging.info("------------Printing the Checkin table after DELETING TODAY AND YESTERDAY-----------------")
        queryset = Checkin.objects.all()
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, LOG_CHECKIN_ID, obj.checkin_id)
            logging.info(LOG_MSG_FORMAT, LOG_DATE, obj.date)
            logging.info('')
        
        # Retrieve a fresh user object from the database
        user = User.objects.get(username='testuser1')
        logging.info(f"User {user.username} - Current Streak: {user.current_streak}, Longest Streak: {user.longest_streak}")
        
        # Longest streak remains 3 even though the chain of 3 was broken, and current streak becomes 0 since the 
        # last checkin was 2 days ago
        self.assertEqual(user.current_streak, 0, "Current streak should be 0")
        self.assertEqual(user.longest_streak, 3, "Longest streak should be 3")

class DeleteUserFromCommunityViewTestCase(TestCase):

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

    USER3_DATA = {
        'username': 'testuser3',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test3@example.com',
        'timezone': 'EST',
    }

    USER4_DATA = {
        'username': 'testuser4',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'test4@example.com',
        'timezone': 'EST',
    }

    # Define post data
    PRIVATE_COMMUNITY = {
        'community_name': "Name of private Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    user_1_obj = None
    user_2_obj = None
    user_3_obj = None

    community_obj = None

    def setUp(self):
        logging.info("************IN DeleteUserFromCommunityViewTestCase SETUP**************..........")
        # Initialize the Django test client
        client = Client()

        # Make a POST request to create test users and checkins
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make owner
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make other user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make other user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER4_DATA), content_type=CONTENT_TYPE_JSON)# make other user
        client.post(reverse('create_community_view'), data=json.dumps(self.PRIVATE_COMMUNITY), content_type=CONTENT_TYPE_JSON) #make private community

        self.community_obj = Community.objects.get(community_name='Name of private Community')

        self.user_1_obj = User.objects.get(username='testuser4')
        CommunityUser.objects.create(user_id= self.user_1_obj, community_id = self.community_obj, status= 1, date_joined=datetime.date.today())
        self.user_2_obj = User.objects.get(username='testuser2')
        CommunityUser.objects.create(user_id= self.user_2_obj, community_id = self.community_obj, status= 2, date_joined=datetime.date.today())
        self.user_3_obj = User.objects.get(username='testuser3')
        CommunityUser.objects.create(user_id= self.user_3_obj, community_id = self.community_obj, status= 2, date_joined=datetime.date.today())
       
        
    
    def test_delete_user_from_community_success(self):
        logging.info("************TEST_delete_user_from_community_success**************..........")
        client = Client()   


        logging.info('Printing users in communityuser table before DELETE........')
        queryset = CommunityUser.objects.all()   
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, "Community ID: ", obj.community_id.community_id)
            logging.info(LOG_MSG_FORMAT, "Community user ID: ", obj.communityuser_id)

        DELETE_DATA = {'username': 'testuser2', 'community_name': 'Name of private Community'}

        # Send POST to invite user to DELETE user from community
        response = client.post(reverse('delete_user_from_community_view'), data=json.dumps(DELETE_DATA), content_type=CONTENT_TYPE_JSON)


        logging.info('Printing users in communityuser table after DELETE........')
        queryset = CommunityUser.objects.all()   
        for obj in queryset:
            logging.info(LOG_MSG_FORMAT, "Community ID: ", obj.community_id.community_id)
            logging.info(LOG_MSG_FORMAT, "Community user ID: ", obj.communityuser_id)

        self.assertEqual(response.status_code, 200)


    def test_delete_owner_from_community_fail(self):
        logging.info("************TEST_delete_owner_from_community_fail**************..........")
        client = Client()   

        DELETE_DATA = {'username': 'testuser1', 'community_name': 'Name of private Community'}

        #  Send POST to invite user to DELETE user from community
        response = client.post(reverse('delete_user_from_community_view'), data=json.dumps(DELETE_DATA), content_type=CONTENT_TYPE_JSON)


        self.assertEqual(response.status_code, 400)

    def test_delete_requested_user_from_community_success(self):
        logging.info("************TEST_delete_requested_user_from_community_success**************..........")
        client = Client()   

        DELETE_DATA = {'username': 'testuser4', 'community_name': 'Name of private Community'}

        # Send POST to invite user to DELETE user from community
        response = client.post(reverse('delete_user_from_community_view'), data=json.dumps(DELETE_DATA), content_type=CONTENT_TYPE_JSON)


        self.assertEqual(response.status_code, 200)

    def test_delete_user_from_community_fail_DNE(self):
        logging.info("************TEST_delete_requested_user_from_community_success**************..........")
        client = Client()   

        DELETE_DATA = {'username': 'DOESNOTEXIST', 'community_name': 'Name of private Community'}

        # Send POST to invite user to DELETE user from community
        response = client.post(reverse('delete_user_from_community_view'), data=json.dumps(DELETE_DATA), content_type=CONTENT_TYPE_JSON)

        self.assertEqual(response.status_code, 400)

class GetPendingRequestsToCommunityViewTestCase(TestCase): # front end calls get and we return all public communities info
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
    USER3_DATA = {
        'username': 'PRIVACYUSERNAME',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'PP@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_3 = {
        'community_name': "THIS IS MY THIRD COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    REQUEST_POST_DATA1 = {
        "username": "testuser2",
        "community_name": "THIS IS MY THIRD COMMUNITY"
    }

    REQUEST_POST_DATA2 = {
        "username": "testuser1",
        "community_name": "THIS IS MY THIRD COMMUNITY"
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community

    

    def test_get_all_community_requests_success(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Requests_To_Community_success**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_pending_requests_to_community_view'), data={'community_name': 'THIS IS MY THIRD COMMUNITY'})
        self.assertEqual(response.status_code, 200)

        # Check that it got the correct information
        response_data = json.loads(response.content)
        # Log information from response
        logging.info("response_data: %s", response_data)
        logging.info('response data length: %s', len(response_data))
        # Check that the length is correct, should be 2 requests
        self.assertEqual(len(response_data), 2)


    def test_get_all_community_requests_fail_DNE(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Requests_To_Community_fail_DNE**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_pending_requests_to_community_view'), data={'community_name': 'DOES NOT EXIST'})
        self.assertEqual(response.status_code, 400)
    

class GetUsersPendingRequestsToCommunityViewTestCase(TestCase): # front end calls get and we return all public communities info
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
    USER3_DATA = {
        'username': 'PRIVACYUSERNAME',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'PP@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_3 = {
        'community_name': "THIS IS MY THIRD COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    #test user 2 requests to join community 2 and 3
    REQUEST_POST_DATA1 = {
        "username": "testuser2",
        "community_name": "THIS IS MY THIRD COMMUNITY"
    }

    REQUEST_POST_DATA2 = {
        "username": "testuser2",
        "community_name": "THIS IS MY SECOND COMMUNITY"
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community

    

    def test_get_all_community_requests_success(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Users_Pending_Requests_To_Communities_success**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_users_pending_requests_to_community_view'), data={'username': 'testuser2'})
        self.assertEqual(response.status_code, 200)

        # Check that it got the correct information
        response_data = json.loads(response.content)
        # Log information from response
        logging.info("response_data: %s", response_data)
        logging.info('response data length: %s', len(response_data))
        # Check that the length is correct, should be 2 requests
        self.assertEqual(len(response_data), 2)


    def test_get_all_community_requests_fail_DNE(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Requests_To_Community_fail_DNE**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('request_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_pending_requests_to_community_view'), data={'community_name': 'DOES NOT EXIST'})
        self.assertEqual(response.status_code, 400)

class GetPendingInvitesToCommunityViewTestCase(TestCase): # front end calls get and we return all public communities info

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
    USER3_DATA = {
        'username': 'PRIVACYUSERNAME',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'PP@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_3 = {
        'community_name': "THIS IS MY THIRD COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    REQUEST_POST_DATA1 = {
        "invited_username": "testuser2",
        "community_name": "THIS IS MY THIRD COMMUNITY",
        "owner_username": "PRIVACYUSERNAME"
    }

    REQUEST_POST_DATA2 = {
        "invited_username": "testuser1",
        "community_name": "THIS IS MY THIRD COMMUNITY",
        "owner_username": "PRIVACYUSERNAME"
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community



    def test_get_all_community_invites_success(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Invites_To_Community_success**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_pending_invites_to_community_view'), data={'community_name': 'THIS IS MY THIRD COMMUNITY'})
        self.assertEqual(response.status_code, 200)

        # Check that it got the correct information
        response_data = json.loads(response.content)
        # Log information from response
        logging.info("response_data: %s", response_data)
        logging.info('response data length: %s', len(response_data))
        # Check that the length is correct, should be 2 requests
        self.assertEqual(len(response_data), 2)

    def test_get_all_community_requests_fail_DNE(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Invites_To_Community_fail_DNE**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_pending_invites_to_community_view'), data={'community_name': 'DOES NOT EXIST'})
        self.assertEqual(response.status_code, 400)
    

class GetUsersPendingInvitesToCommunityViewTestCase(TestCase): # front end calls get and we return all public communities info

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
    USER3_DATA = {
        'username': 'PRIVACYUSERNAME',
        'password': 'testpassword',
        'reentered_password': 'testpassword',
        'firstname': 'Test',
        'lastname': 'User',
        'email': 'PP@example.com',
        'timezone': 'EST',
    }

    COMMUNITY_SUCCESS_1 = {
        'community_name': "Name of Community",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    COMMUNITY_SUCCESS_3 = {
        'community_name': "THIS IS MY THIRD COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "PRIVACYUSERNAME", # username of the owner
        "privacy": 'private',
    }

    #test user 2 is invited to join 2nd and third community
    REQUEST_POST_DATA1 = {
        "invited_username": "testuser2",
        "community_name": "THIS IS MY THIRD COMMUNITY",
        "owner_username": "PRIVACYUSERNAME"
    }

    REQUEST_POST_DATA2 = {
        "invited_username": "testuser2",
        "community_name": "THIS IS MY SECOND COMMUNITY",
        "owner_username": "PRIVACYUSERNAME"
    }

    def setUp(self):
        # Initialize the Django test client
        logging.info("In SETUP*****************************************")
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER3_DATA), content_type=CONTENT_TYPE_JSON)# make user
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.COMMUNITY_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community
        logging.info("LEAVING   SETUP*****************************************") 


    def test_get_all_community_invites_success(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Invites_To_Community_success**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)
       
        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)
       
        response = client.get(reverse('get_users_pending_invites_to_community_view'), data={'username': 'testuser2'})
        self.assertEqual(response.status_code, 200)

        # Check that it got the correct information
        response_data = json.loads(response.content)
        # Log information from response
        logging.info("response_data: %s", response_data)
        logging.info('response data length: %s', len(response_data))
        # Check that the length is correct, should be 2 requests
        self.assertEqual(len(response_data), 2)

    def test_get_all_community_requests_fail_DNE(self):# Successfully retrieves all public communities
        logging.info("************TEST_Get_Pending_Invites_To_Community_fail_DNE**************..........")
        client = Client()

        # Send POST requests to join private communities
        response1 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA1), content_type=CONTENT_TYPE_JSON)
        response2 = client.post(reverse('invite_to_join_community_view'), data=json.dumps(self.REQUEST_POST_DATA2), content_type=CONTENT_TYPE_JSON)

        # Check if response status codes are 200
        self.assertEqual(response1.status_code, 200)
        self.assertEqual(response2.status_code, 200)

        response = client.get(reverse('get_users_pending_invites_to_community_view'), data={'username': 'DOES NOT EXIST'})
        self.assertEqual(response.status_code, 400)
     

class GetCommunitesNotOwnedInfoViewTestCase(TestCase): # front end calls get and we return all communities the user owns

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

    GET_USER_COMMUNITIES_SUCCESS_1 = {
        'community_name': "THIS IS MY FIRST COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'public',
    }

    GET_USER_COMMUNITIES_SUCCESS_2 = {
        'community_name': "THIS IS MY SECOND COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser1", # username of the owner
        "privacy": 'private',
    }

    GET_USER_COMMUNITIES_SUCCESS_3 = {
        'community_name': "THIS IS MY ONLY COMMUNITY",
        "community_photo": None,
        "community_description": "Test Description",
        "username": "testuser2", # username of the owner
        "privacy": 'public',
    }

    PUBLIC_REQUEST_POST_DATA= { #join the community they don't own
        "username": "testuser1",
        "community_name": "THIS IS MY ONLY COMMUNITY",
    }

    def setUp(self):
        # Initialize the Django test client
        client = Client()

        # Make instance of users and their communities
        client.post(reverse('create_user_view'), data=json.dumps(self.USER1_DATA), content_type=CONTENT_TYPE_JSON) # make user
        client.post(reverse('create_user_view'), data=json.dumps(self.USER2_DATA), content_type=CONTENT_TYPE_JSON) # make user
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_1), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_2), content_type=CONTENT_TYPE_JSON) #make community
        client.post(reverse('create_community_view'), data=json.dumps(self.GET_USER_COMMUNITIES_SUCCESS_3), content_type=CONTENT_TYPE_JSON) #make community

        client.post(reverse('request_to_join_community_view'), data=json.dumps(self.PUBLIC_REQUEST_POST_DATA), content_type=CONTENT_TYPE_JSON)


    def test_get_communities_not_owned_info_success(self):# Successfully retrieves all user specific communities
        logging.info("************TEST_get_communities_not_owned_info_success**************..........")
        client = Client()

        # Send GET request to get_communities_not_owned_info
        response = client.get(reverse('get_communities_not_owned_info_view'), data={'username': 'testuser1'})

        response_data = json.loads(response.content)
        logging.info("response_data: %s", response_data)

        # Check if response status code is 200
        self.assertEqual(response.status_code, 200)

        # Check that it returns community 3, but not 1+2
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["community_name"], 'THIS IS MY ONLY COMMUNITY')
        
    
    def test_get_communities_not_owned_info_fail(self):# Fails retrieves nonexistent user specific communities 
        logging.info("************TEST_get_communities_not_owned_info_fail**************..........")
        client = Client()

        # Send GET request to get_communities_not_owned_info
        response = client.get(reverse('get_communities_not_owned_info_view'), data={'username': 'doesnotexist'})

        # Check if response status code is 400 -- failing
        self.assertEqual(response.status_code, 400)