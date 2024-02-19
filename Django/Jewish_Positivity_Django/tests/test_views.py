from django.test import TestCase, Client  #Client class to simulate HTTP requests
from django.urls import reverse #reverse allows you to generate URLs for Django views by providing the view name
from Jewish_Positivity_Django.models import User
from Jewish_Positivity_Django.views import create_user_view

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


