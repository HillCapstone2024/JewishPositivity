# in views.py

import json
import re
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from JP_Django.models import Checkin
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from datetime import time
from datetime import date
import logging
from django.core.mail import send_mail
from django.http import JsonResponse
from django.db import models
import base64



# configure logging
logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO
    format="%(asctime)s - %(levelname)s - %(message)s",  # Define log message format
    filename="views.log",  # Specify the log file
    filemode="w",
)  # Choose file mode (overwrite in this case)

User = get_user_model()
constMissingKey = "Missing keys: %s"
constNotPost = "Not a POST request!"


def validate_email_format(email):  # To validate email format
    try:
        validate_email(email)
    except ValidationError:
        return False
    return True


def login_view(request):
    if request.method == "POST":
        # Load POST data
        data = json.loads(request.body)
        logging.info("Parsed JSON data: %s", data)
        missing_keys = [
            key for key, value in data.items() if value is None or value.strip() == ""
        ]
        logging.info(constMissingKey, missing_keys)

        # Make sure no fields are empty in the POST data, else return the empty fields
        if missing_keys:
            error_message = f"Missing required keys: {', '.join(missing_keys)}"  # tells which keys missing in error message
            return HttpResponse(error_message, status=400)

        # Define variables for JP_Django Database
        username = data["username"]
        password = data["password"]
        user = authenticate(request, username=username, password=password)
        logging.info(
            "username: %s", username
        )  # %s is a placeholder for where var should be inserted
        logging.info("password: %s", password)
        if user is not None:
            login(request, user)

            return HttpResponse("Login successful!", status=200)
        else:
            # Return an error message or handle unsuccessful login
            return HttpResponse("Login failed!", status=400)
    return HttpResponse(constNotPost)


def create_user_view(request):
    if request.method == "POST":

        # Load POST data
        data = json.loads(request.body)
        logging.info("Parsed JSON data: %s", data)
        missing_keys = [
            key for key, value in data.items() if value is None or value.strip() == ""
        ]
        logging.info(constMissingKey, missing_keys)

        # Make sure no fields are empty in the POST data, else return the empty fields
        if missing_keys:
            error_message = f"Missing required keys: {', '.join(missing_keys)}"  # tells which keys missing in error message
            return HttpResponse(error_message, status=400)

        # Create a new user
        data = json.loads(request.body)
        username = data["username"]
        password = data["password"]
        password2 = data["reentered_password"]  # must match frontend
        first_name = data["firstname"]
        last_name = data["lastname"]
        email = data["email"]

        # Check if passwords match
        if password != password2:
            return HttpResponse("Passwords do not match", status=400)

        # Regular expression pattern for validating email format
        if not validate_email_format(email):  # function above using django validator
            return HttpResponse("Not a valid email address", status=400)

        # Check if a user with the same email already exists
        if User.objects.filter(email=email).exists():
            logging.info("Same email exists")
            return HttpResponse("Account with this email already exists", status=400)

        # Check if a user with the same username already exists
        if User.objects.filter(username=username).exists():
            return HttpResponse("Account with this username already exists", status=400)

        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.save()

            return HttpResponse("Create a new user successful!")
        except Exception as e:  # IntegrityError
            logging.info(e)
            return HttpResponse("User failed to be created.", status=400)  # user failed to be created due to duplicate info
    return HttpResponse(constNotPost)


def logout_view(request):
    try:
        username = request.POST.get("username")
        password = request.POST.get("password")

        if not username or not password:
            raise ValueError("Username or password is missing")

        # Continue with login logic...

    except Exception as e:
        return HttpResponseServerError(
            f"Error: {e}", status=500
        )  # Redirect to login page after logout


def update_times_view(request):
    if request.method == "POST":
        # Retrieving username to access correct user in database
        # retrieving times for updating to non-default
        data = json.loads(request.body)
        username = data.get("username")
        time1_str = data.get("time1")
        time2_str = data.get("time2")
        time3_str = data.get("time3")

        try:
            # Convert strings of posted times to time objects
            time1 = time.fromisoformat(
                time1_str
            )  # fromisoformat() expects format ("HH:MM:SS")
            time2 = time.fromisoformat(time2_str)
            time3 = time.fromisoformat(time3_str)

            if time1 < time2 < time3:
                user = User.objects.get(
                    username=username
                )  # Retrieving user from the database
                user.time1 = time1.strftime(
                    "%H:%M:%S"
                )  # Convert time objects to strings
                user.time2 = time2.strftime("%H:%M:%S")
                user.time3 = time3.strftime("%H:%M:%S")
                user.save()  # Saving

                response_data = {"message": "Success! Times have been updated"}
                return HttpResponse(
                    json.dumps(response_data), content_type="application/json"
                )
            else:
                return HttpResponse("Invalid ordering", status=400)
        except User.DoesNotExist:
            return HttpResponse("User not found", status=400)
        except ValueError:
            return HttpResponse("Invalid time format", status=400)
        except Exception as e:
            return HttpResponse("Updating user times failed: " + str(e), status=400)
    return HttpResponse(constNotPost)

#send all user information to the front end
def get_userinformation_view(request):
    if request.method == "GET":
        username = request.GET.get(
            "username"
        )  # JSON is not typically used for GET requests here

        # Make sure the get data is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)

                # get all of the information for the user
                response_data = {
                    "username":user.username,
                    "password":user.password,
                    "email":user.email,
                    "first_name":user.first_name,
                    "last_name":user.last_name,
                }

                logging.info(response_data)
                return HttpResponse(
                    response_data
                )  # returning a DICTIONARY -do not change
            except:
                return HttpResponse("User does not exist", status=400)
        else:  # username was empty
            return HttpResponse("Username not provided", status=400)
    return HttpResponse("Not a GET request!")

def get_times_view(request):
    if request.method == "GET":
        username = request.GET.get(
            "username"
        )  # JSON is not typically used for GET requests here

        # Make sure the get data is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)

                # get the times
                response_data = {
                    "time1": user.time1.strftime("%H:%M:%S"),
                    "time2": user.time2.strftime("%H:%M:%S"),
                    "time3": user.time3.strftime("%H:%M:%S"),
                }

                logging.info(response_data)
                return HttpResponse(
                    response_data
                )  # returning a DICTIONARY -do not change
            except Exception as e:
                logging.info(e)
                return HttpResponse("User does not exist", status=400)
        else:  # username was empty
            return HttpResponse("Username not provided", status=400)
    return HttpResponse("Not a GET request!")


def send_report_email_view(request):
    if request.method != "POST":
        return HttpResponse(constNotPost, status=400)
    
    data = json.loads(request.body)
    message = data["message"]
    username = data["username"]
    
    if message is None or username is None:
        return HttpResponse("No data received", status=400)
    
    subject = f"APP REPORT {message[:20]}... - {username}"
    message = f"Report from user: {username}. \n\n{message}"
    email_from = "jewishpositivity2024@gmail.com"
    recipient_list = ["jewishpositivity2024@gmail.com"]
    try:
        response =  send_mail(subject, message, email_from, recipient_list)
        return JsonResponse({"response": response})
    except Exception as e:
        logging.error("Error sending email: %s", e)
        return JsonResponse({"status": 400})


def checkin_view(request): # to handle checkin moment POST data 
    if request.method == 'POST':
        data = json.loads(request.body)
        #logging.info("Parsed JSON data: %s", data)

        non_integer_keys = []# Iterate over the keys and filter out non-integer fields
        for key, value in data.items():
            try:
                if not isinstance(value, (int, type(None))):
                    non_integer_keys.append(key)
            except Exception as e:
                # Handle case where key does not correspond to a field in the model
                return HttpResponse("error retrieving IntegerFields", status=400)
        logging.info("NON-INTEGER KEYS: %s", non_integer_keys)
        # Iterate through the data and get keys that are not integer fields and not empty
        missing_keys = []
        for key, value in data.items():
            if key in non_integer_keys: 
                if value is None or value.strip() == "": #cannot trim an integer field 
                    missing_keys.append(key) 
            
        logging.info("Missing keys: %s", missing_keys)

        # Make sure no fields are empty in the POST data, else return the empty fields
        if missing_keys:
            error_message = f"Missing required keys: {', '.join(missing_keys)}"  # tells which keys missing in error message
            return HttpResponse(error_message, status=400)
        
        #retrieve the Post data and get the current date
        moment_number = data["moment_number"]
        content_64_encoded = data["content"] #This is in string format - base64 format
        content_type = data["content_type"]
        current_date = date.today()
        username = data["username"]
        logging.info("view.py checkin view post data: \nMoment Number: %s content_Type%s \n Current Date:%s \nUsername: %s", 
                     moment_number, content_type, current_date,username)

        try:
            # Retrieve the user object and its id to store 
            user = User.objects.get(username=username)
            if user is not None: #found user
                logging.info("Checkin view: User found")
            else: 
                return HttpResponse("Username does not exist", status=400)

            logging.info("Checkin view: BEFORE Binary Encoded")
            #convert the string (base64 format) passed in as content to a binary field encoding compatible with checkin model
            content_binary_encoded = base64.b64decode(content_64_encoded)
            logging.info("Checkin view: Content Binary Encoded")

            #create a checkin object
            checkin = Checkin.objects.create(
                user_id = user,
                moment_number = moment_number,
                content = content_binary_encoded,
                content_type = content_type,
                date = current_date
                )
            logging.info("Got past creating checkin object")
            checkin.save()

            return HttpResponse('Data saved successfully', status=200)
        except Exception as e:
            logging.info("Checkin failed exception: %s",e )
            return HttpResponse("Check-in failed to save", status=400)


def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})
