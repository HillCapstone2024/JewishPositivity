from django.test import TestCase, Client  #Client class to simulate HTTP requests
from django.urls import reverse #reverse allows you to generate URLs for Django views by providing the view name
from Jewish_Positivity_Django.models import User
from Jewish_Positivity_Django.views import create_user_view
import datetime
from Jewish_Positivity_Django.models import User #import model to access printing users in the test DB

#a test for the create_user_view
# use this command in terminal to run test: python manage.py test myapp.tests.test_views.CreateUserViewTestCase

class CreateUserViewTestCase(TestCase):
    def test_create_user_success(self): #test if user was successfully made
        # Initialize the Django test client
        client = Client()

        # Define the POST data to simulate form submission
        post_data = {
            'username': 'testuser',
            'password': 'testpassword',
            'reentered_password': 'testpassword',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'test@example.com',
        }

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), post_data)

        # Check if the response status code is 200
        self.assertEqual(response.status_code, 200) #status code of 200 usually means that the view has executed successfully and returned a response without any errors.

        # Check if a user with the specified username was created
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_create_user_failure(self): # test if view will correctly fail to create user with missing keys
        # Initialize the Django test client
        client = Client()

        # Define invalid POST data
        invalid_post_data = {
            # Missing required fields
        }

        # Make a POST request with invalid data
        response = client.post(reverse('create_user_view'), invalid_post_data)

        # Check if the response status code is 400 (specified in view as missing key status code)
        self.assertEqual(response.status_code, 400) #this means missing key error was excuted and displayed

    
    def test_create_user_passwords(self): #test if password don't match that correct error will appear
        # Initialize the Django test client
        client = Client()

        # Define the POST data to simulate form submission
        post_data = {
            'username': 'testuser1',
            'password': 'testpassword',
            'reentered_password': 'nottestpassword',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'test1@example.com',
        }

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), post_data)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400) # means that the view executed error message with passwords dont match.

    
    def test_create_user_emailValidation(self): #test if emails not in correct format that correct error will appear
        # Initialize the Django test client
        client = Client()

        # Define the POST data to simulate form submission
        post_data = {
            'username': 'testuser3',
            'password': 'testpassword',
            'reentered_password': 'testpassword',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'wrongformat',
        }

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), post_data)

        # Check if the response status code is 400
        self.assertEqual(response.status_code, 400) #status code of 400- executed error message with wrong email format.


    def test_create_user_duplicate_email(self): #test that error appears when trying to add duplicate emails
            # Initialize the Django test client
            client = Client()

            # Define the POST data to simulate form submission
            post_data = {
                'username': 'testuser4',
                'password': 'testpassword',
                'reentered_password': 'testpassword',
                'firstname': 'Test',
                'lastname': 'User',
                'email': 'test4@example.com',
            }

            post_data2 = {
                'username': 'testuser5',
                'password': 'testpassword',
                'reentered_password': 'testpassword',
                'firstname': 'Test',
                'lastname': 'User',
                'email': 'test4@example.com', #same email as first user above
            }

            # Make a POST request to the create_user_view
            response = client.post(reverse('create_user_view'), post_data) #adding first user
            response2 = client.post(reverse('create_user_view'), post_data2)#trying to add second with same email

            # Check if the response status code is 200 for first user (should have succeeded)
            self.assertEqual(response.status_code, 200) #status code of 200 means first user successfully created.
            self.assertEqual(response2.status_code, 400) #duplicate user error- did not create second user

    def test_create_user_duplicate_username(self): #test that error appears when trying to add duplicate usernames
            # Initialize the Django test client
            client = Client()

            # Define the POST data to simulate form submission
            post_data = {
                'username': 'testuser7',
                'password': 'testpassword',
                'reentered_password': 'testpassword',
                'firstname': 'Test',
                'lastname': 'User',
                'email': 'test7@example.com',
            }

            post_data2 = {
                'username': 'testuser7',#same username as first user above
                'password': 'testpassword',
                'reentered_password': 'testpassword',
                'firstname': 'Test',
                'lastname': 'User',
                'email': 'test7@example.com', 
            }

            # Make a POST request to the create_user_view
            response = client.post(reverse('create_user_view'), post_data) #adding first user
            response2 = client.post(reverse('create_user_view'), post_data2)#trying to add second with same email

            # Check if the response status code is 200 for first user (should have succeeded)
            self.assertEqual(response.status_code, 200) #status code of 200 means first user successfully created.
            self.assertEqual(response2.status_code, 400) #duplicate user error- did not create second user

class SetTimesViewTestCase(TestCase):
    def test_set_times_success(self): #Successfully changed times in database
        # Initialize the Django test client
        client = Client()

        # Initializing a test user to update times in the database
        user_data = {
            'username': 'testuser',
            'password': 'testpassword',
            'reentered_password': 'testpassword',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'test@example.com',
        }

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), user_data)
        
        # Ensure the response is 200 indicating success creating a user
        self.assertEqual(response.status_code, 200)

         # Query the database and print its contents
        queryset = User.objects.all()
        for obj in queryset: ###printing user before updating times
            print(f'User: {obj.username}')
            print(f'First Name: {obj.first_name}')
            print(f'Last Name: {obj.last_name}')
            print(f'Time1: {obj.time1}')
            print(f'Time2: {obj.time2}')
            print(f'Time3: {obj.time3}') 
            print('')

        # Creating a POST for updating the times
        post_data = {
                'username' : 'testuser',
                'time1': datetime.time(8, 15),
                'time2': datetime.time(16, 35),
                'time3': datetime.time(19, 00),
            }
        
        # Make a POST request to the update_times_view model to update the database times
        response = client.post(reverse('update_times_view'), post_data) 
        
        queryset = User.objects.all() #printing db after updating times
        for obj in queryset:
            print(f'User: {obj.username}')
            print(f'First Name: {obj.first_name}')
            print(f'Last Name: {obj.last_name}')
            print(f'Time1: {obj.time1}')
            print(f'Time2: {obj.time2}')
            print(f'Time3: {obj.time3}')
            print('')

        # Ensure the response is 200 indicating successful update of times
        self.assertEqual(response.status_code, 200) 

    def test_set_times_invalid_order_fail(self): #testing for time1 < time2 < time3
        # Initialize the Django test client
        client = Client()

        # Initializing a test user to update times in the database
        user_data = {
            'username': 'testuserfail',
            'password': 'testpassword',
            'reentered_password': 'testpassword',
            'firstname': 'Test',
            'lastname': 'User',
            'email': 'test@example.com',
        }

        # Make a POST request to the create_user_view
        response = client.post(reverse('create_user_view'), user_data)

        # Ensure the response is 200 indicating success
        self.assertEqual(response.status_code, 200)

        # Creating a POST for updating the times with INCORRECT ORDERING
        post_data = {
                'username': 'testuser',
                'time1': datetime.time(17, 35),
                'time2': datetime.time(7, 35),
                'time3': datetime.time(19, 00),
            }
        
        queryset = User.objects.all() #printing db after attempted updating times
        for obj in queryset:
            print(f'User: {obj.username}')
            print(f'First Name: {obj.first_name}')
            print(f'Last Name: {obj.last_name}')
            print(f'Time1: {obj.time1}')
            print(f'Time2: {obj.time2}')
            print(f'Time3: {obj.time3}')
            print('')

        # Calling update_times_view model to update database times-- this should give error
        response = client.post(reverse('update_times_view'), post_data) 

        # Status code of 400 means updating times fails due to incorrect order 
        self.assertEqual(response.status_code, 400)


class GetTimesViewTestCase(TestCase):
     def test_get_times_success(self): #Successfully retrieved times in database
        pass