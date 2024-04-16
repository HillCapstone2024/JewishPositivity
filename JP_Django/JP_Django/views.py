# in views.py

import json
import re
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from JP_Django.models import Checkin, Friends, Badges, User, Community, CommunityUser
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import time
import datetime
from datetime import datetime, time, date, timezone
import pytz
import logging
from django.core.mail import send_mail
from django.http import JsonResponse
from django.db import models
import base64
from django.db.models import Q
import os
from dotenv import load_dotenv
from django.conf import settings
load_dotenv()

# ########## Configuration & Constants ##########


logging.basicConfig(
    level=logging.INFO,  # Set the logging level to INFO
    format="%(asctime)s - %(levelname)s - %(message)s",  # Define log message format
    filename="views.log",  # Specify the log file
    filemode="a",
)  # Choose file mode (overwrite in this case)

User = get_user_model()
constMissingKey = "Missing keys: %s"
constNotPost = "Not a POST request!"
constNotGet = "Not a GET request"
constUserDNE = "User does not exist"
constUNnotProvided= "Username not provided"
constFriendExists = "Friendship already exists"
constAppJson = "application/json"
constInvalidReq = "Invalid request method"


# ########## Helper Functions ##########



# ########## Helper Functions ##########

def validate_email_format(email):  # To validate email format
    try:
        validate_email(email)
    except ValidationError:
        return False
    return True

def validate_data(data):
    # Identify keys in the data that do not have integer values or are None
    non_integer_keys = [key for key, value in data.items() if not isinstance(value, int)] 
    logging.info("NON-INTEGER KEYS: %s", non_integer_keys) # includes nonetypes

    # Check for missing or empty required fields in the POST data
    missing_keys = [key for key in non_integer_keys if key not in ("content","text_entry","content_type", "community_photo") and not data.get(key)] #allow content and text to be missing
    logging.info("Missing keys: %s", missing_keys)

    # Return an error response if there are missing keys
    if missing_keys:
        error_message = f"Missing required keys: {', '.join(missing_keys)}"
        return HttpResponse(error_message, status=400)

    return None

def check_missing_keys(data):
    # Identify keys with None or empty string values
    missing_keys = [key for key, value in data.items() if value is None or value.strip() == ""]
    logging.info(constMissingKey, missing_keys)
    
    # Return an error response if there are missing keys
    if missing_keys:
        error_message = f"Missing required keys: {', '.join(missing_keys)}"
        return HttpResponse(error_message, status=400)
    return None

def get_user(username):
    # Retrieve the user object from the database using the username
    try:
        user = User.objects.get(username=username)
        logging.info("Checkin view: User found")
        return user, None
    except User.DoesNotExist:
        # Log and return an error response if the user does not exist
        logging.info(constUserDNE)
        return None, HttpResponse("Username does not exist", status=400)


# ########## Authentication Views ##########
    


# ########## Authentication Views ##########
    

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
        logging.info( "username: %s", username)  # %s is a placeholder for where var should be inserted
        logging.info("password: %s", password)
        if user is not None:
            login(request, user)
            logging.info("Login successful!")

            return HttpResponse("Login successful!", status=200)
        else:
            # Return an error message or handle unsuccessful login
            return HttpResponse("Login failed!", status=400)
    return HttpResponse(constNotPost)

def create_user_view(request):
    # Ensure the request method is POST
    if request.method != "POST":
        return HttpResponse(constNotPost)  # constNotPost should be defined elsewhere

    # Parse the JSON body of the request
    data = json.loads(request.body)
    logging.info("IN CREATE_USER_VIEW....")
    logging.info("Parsed JSON data: %s", data)

    # Check for missing keys and return an error response if any are found
    error_response = check_missing_keys(data)
    if error_response:
        return error_response

    # Extract required fields from the POST data
    username = data["username"]
    password = data["password"]
    password2 = data["reentered_password"]  # Confirmation password
    email = data["email"]
    timezone = data["timezone"]

    # Validate the timezone
    if timezone not in pytz.all_timezones:
        return HttpResponse("Invalid timezone", status=400)
    
    # Ensure the provided passwords match
    if password != password2:
        return HttpResponse("Passwords do not match", status=400)
    
    # Validate the email format
    if not validate_email_format(email):  # Assumes validate_email_format function is defined elsewhere
        return HttpResponse("Not a valid email address", status=400)
    
    # Check for existing users with the same email or username
    if User.objects.filter(email=email).exists():
        logging.info("Same email exists")
        return HttpResponse("Account with this email already exists", status=400)
    if User.objects.filter(username=username).exists():
        return HttpResponse("Account with this username already exists", status=400)

    # Attempt to create a new user
    try:
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=data["firstname"],
            last_name=data["lastname"],
            timezone=timezone,
        )
        Badges.objects.create(user_id=user)  # Create a new badge object for the user
        return HttpResponse("User has been created!")
    except Exception as e:  # Catch exceptions like IntegrityError
        logging.info(e)
        return HttpResponse("User failed to be created.", status=400)

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

# ########## User Information Management ##########




# ########## User Information Management ##########
    
def update_user_information_view(request):
    # Check if the request method is POST
    if request.method != "POST":
        # Return an HTTP 400 response if the method is not POST
        return HttpResponse("Not a POST request", status=400)

    # Parse the JSON data from the request body
    data = json.loads(request.body)

    # Attempt to retrieve the user object based on the username provided in the POST data
    try:
        username = data["username"]  # Get the username from the POST data
        user = User.objects.get(username=username)  # Retrieve the user from the database
    except Exception as e:
        # Log the error and return an HTTP 400 response if the user cannot be retrieved
        logging.info("ERROR RETRIEVING USER: %s", e)
        return HttpResponse("Username is in invalid format or does not exist", status=400)

    # Check for any missing keys (i.e., fields with empty values) in the POST data
    missing_keys = [key for key, value in data.items() if value is None or value.strip() == ""]
    if missing_keys:
        # Log the missing keys and return an HTTP 400 response listing them
        logging.info("Missing required keys: %s", missing_keys)
        return HttpResponse(f"Missing required keys: {', '.join(missing_keys)}", status=400)

    # Define a dictionary mapping POST data keys to their respective update functions and expected values
    update_actions = {
        'newusername': (update_username, data.get("newusername")),
        'password': (update_password, data.get("password")),
        'email': (update_email, data.get("email")),
        'lastname': (update_last_name, data.get("lastname")),
        'firstname': (update_first_name, data.get("firstname")),
        'profilepicture': (update_profile_picture, data.get("profilepicture")),
        'timezone' : (update_timezone, data.get("timezone"))
    }

    # Iterate over the update_actions dictionary, where each entry contains a field to update and its corresponding update function.
    for key, (update_func, value) in update_actions.items(): 
        if key in data and value: # Check if the key is in the POST data and has a non-empty value
            error_response = update_func(user, value) # Call the respective update function with the user object and the value from the POST data
            if error_response: # If the update function returns an error response, return it immediately
                return error_response

    # Return an HTTP 200 response indicating that the updates were successful
    return HttpResponse("Changes Successful!")

def update_username(user, new_username):
    try:
        user.username = new_username
        user.save()
        logging.info("SUCCESS! Username has been updated to \"%s\"", user.username)
    except Exception as e:
        logging.info("ERROR IN CHANGING USERNAME: %s", e)
        return HttpResponse("Error in updating username", status=400)

def update_password(user, new_password):
    try:
        user.set_password(new_password)
        user.save()
        logging.info("SUCCESS! Password has been updated")
    except Exception as e:
        logging.info("ERROR IN CHANGING PASSWORD: %s", e)
        return HttpResponse("Error in updating password", status=400)
    
def update_last_name(user, last_name):
    try:
        user.last_name = last_name
        user.save()
        logging.info("SUCCESS! \"%s's\" last name has been updated to \"%s\"", user.username, user.last_name)
    except Exception as e:
        logging.info("ERROR IN CHANGING LAST NAME: %s", e)
        return HttpResponse("Error in updating last name", status=400)

def update_first_name(user, first_name):
    try:
        user.first_name = first_name
        user.save()
        logging.info("SUCCESS! \"%s's\" first name has been updated to \"%s\"", user.username, user.first_name)
    except Exception as e:
        logging.info("ERROR IN CHANGING FIRST NAME: %s", e)
        return HttpResponse("Error in updating first name", status=400)
    
def update_email(user, email):
    try:
        user.email = email
        user.save()
        logging.info("SUCCESS! \"%s's\" email has been updated to \"%s\"", user.username, user.email)
    except Exception as e:
        logging.info("ERROR IN CHANGING EMAIL: %s", e)
        return HttpResponse("Error in updating email", status=400)

def update_profile_picture(user, profile_picture_data):
    try:
        content_binary_encoded = base64.b64decode(profile_picture_data)
        user.profile_picture = content_binary_encoded
        user.save()
        logging.info("SUCCESS! \"%s's\" profile picture has been updated!", user.username)
    except Exception as e:
        logging.info("ERROR IN CHANGING PROFILE PICTURE: %s", e)
        return HttpResponse("Error in updating profile picture", status=400)

def update_timezone(user, timezone):
    try:
        user.timezone = timezone
        user.save()
        logging.info("SUCCESS! \"%s's\" timezone has been updated to \"%s\"", user.username, user.timezone)
    except Exception as e:
        logging.info("ERROR IN CHANGING TIMEZONE: %s", e)
        return HttpResponse("Error in updating timezone", status=400)
   
#send all user information to the front end
def get_user_information_view(request):
    if request.method == "GET":
        username = request.GET.get("username")  # JSON is not typically used for GET requests here

        # Make sure the get data is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)

                # 
                profile_picture_data = user.profile_picture
                if profile_picture_data:
                    profile_picture_encoded = base64.b64encode(profile_picture_data).decode('utf-8')
                else:
                    profile_picture_encoded = None  # a default image or keep it empty


                # get all of the information for the user
                response_data = {
                    "id": user.pk,
                    "username":user.username,
                    "password":user.password,
                    "email":user.email,
                    "first_name":user.first_name,
                    "last_name":user.last_name,
                    "profilepicture": profile_picture_encoded,
                    "timezone" : user.timezone
                }
                logging.info("get data:")
                logging.info(response_data)
                return HttpResponse(json.dumps(response_data), content_type=constAppJson)
            except Exception as e:
                logging.info(e)
                return HttpResponse(constUserDNE, status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)
       
def update_times_view(request):
    logging.info("************** In update times view ******************** ")
    if request.method == "POST":
        # Retrieving username to access correct user in database
        # retrieving times for updating to non-default
        data = json.loads(request.body)
        username = data.get("username")
        time1_str = data.get("time1")
        time2_str = data.get("time2")
        time3_str = data.get("time3")
        logging.info("TIMES: TIME1: %s,TIME2: %s,TIME3: %s", time1_str, time2_str, time3_str)

        try:
            # Convert strings of posted times to time objects
            time1 = time.fromisoformat(time1_str)  # fromisoformat() expects format ("HH:MM:SS")
            time2 = time.fromisoformat(time2_str)
            time3 = time.fromisoformat(time3_str)
            logging.info("TIMES as objects: TIME1: %s,TIME2: %s,TIME3: %s", time1, time2, time3)

            if time1 < time2 < time3:
                logging.info("correct ordering")
                user = User.objects.get(username=username)  # Retrieving user from the database
                logging.info("got user: %s", user)

                # Get the user's current date
                current_date = datetime.today().date() # Get current date
                logging.info("Current Date: %s", current_date)

                # Set the times to RAW date time user enters
                datetime1_current = datetime.combine(current_date, time1).astimezone(timezone.utc) # Combine date and time to get local datetime
                datetime2_current = datetime.combine(current_date, time2).astimezone(timezone.utc) # Combine date and time to get local datetime
                datetime3_current = datetime.combine(current_date, time3).astimezone(timezone.utc) # Combine date and time to get local datetime
                logging.info("DATETIMES to be set to in DB (combo of above): TIME1: %s,TIME2: %s,TIME3: %s", datetime1_current, datetime2_current, datetime3_current)
                # Set the updated times to the user
                user.time1 = datetime1_current
                user.time2 = datetime2_current
                user.time3 = datetime3_current
                user.save()  # Saving

                response_data = {"message": "Success! Times have been updated"}
                return HttpResponse(json.dumps(response_data), content_type=constAppJson)
            else: 
                return HttpResponse("Invalid ordering", status=400)
        except User.DoesNotExist:
            return HttpResponse(constUserDNE, status=400)
        except ValueError:
            return HttpResponse("Invalid time format", status=400)
        except Exception as e:
            return HttpResponse("Updating user times failed: " + str(e), status=400)
    return HttpResponse(constNotPost)

def get_times_view(request):
    if request.method == "GET":
        username = request.GET.get("username")  # JSON is not typically used for GET requests here

        # Make sure the get data is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)

                # get the times from the DateTime object in the DB
                time1_time = user.time1.time()
                time2_time = user.time2.time()
                time3_time = user.time3.time()
                
                response_data = {
                    "time1": time1_time.strftime("%H:%M:%S"),
                    "time2": time2_time.strftime("%H:%M:%S"),
                    "time3": time3_time.strftime("%H:%M:%S"),
                }

                logging.info(response_data)
                return HttpResponse(json.dumps(response_data), content_type= constAppJson)  # returning a DICTIONARY - do not change
            except Exception as e:
                logging.info(e)
                return HttpResponse(e, status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)

def delete_user_view(request):
    if request.method == "POST":
        # Retrieve usernames from POST request
        data = json.loads(request.body)
        username = data.get("username")
        logging.info('retrieved username %s', username)

        try:
            # Getting users from the user objects from the user table
            userobj = User.objects.get(username=username)
            logging.info('retrieved user %s', userobj)

            user = User.objects.filter(username= username)
        
            # Delete the User if it exists
            if user.exists():
                user.delete()
                return HttpResponse("User deleted successfully", status=200)
            else:
                return HttpResponse(constUserDNE, status=400)
          
        except User.DoesNotExist:
            return HttpResponse(constUserDNE, status=400)
        except Exception as e:
            return HttpResponse("Error deleting user: " + str(e), status=400)

    return HttpResponse(constInvalidReq, status=400)

# ########## Check-in Management ##########



# ########## Check-in Management ##########
    
def create_checkin(user, data):
    # Create a check-in record in the database
    try:
        # Decode the base64 encoded content
        content_binary_encoded=None #default No Media
        if data["content"] is not None: # if there is media decode it and save it
            content_binary_encoded = base64.b64decode(data["content"])
        else: 
            if data["text_entry"] is None: #Content is None, so is text, this is an error
                return HttpResponse('No Text or Media submitted', status=400)
        
        #check for a duplicate entry by checking for unique user_id, moment_num, and date of the datetime obj
        user = User.objects.get(username=data['username'])
        user_id = user.pk # get foreign key reference field to look up in checkin userid column
                
        datetime_current= datetime.today() #get the current datetime
        logging.info("current datetime: %s", datetime_current)
        #Retrieve all checkins associated with this user
        all_checkins = Checkin.objects.filter(user_id=user_id)
        for checkin in all_checkins:
            logging.info("datetime_current.date(): %s", datetime_current.date())
            logging.info("checkin.date.date(): %s", checkin.date.date())
            if data['moment_number']==checkin.moment_number and datetime_current.date() == checkin.date.date():
                logging.info("DUPLICATE!!!")
                return HttpResponse("Error: Duplicate Moment Today", status=400)
        
        # Check if this is the first checkin of the day for updating the streak
        today_midnight = datetime_current.replace(hour=0, minute=0, second=0, microsecond=0)
        if not Checkin.objects.filter(date__gte = today_midnight, user_id=user.pk).exists(): # Checks if there are any checkins from the user today
            logging.info("First checkin today")
            update_streak(user) # Update the streak if it is the first checkin of the day

        # Create the checkin object and save it to the database
        checkin = Checkin.objects.create(
            user_id=user,
            moment_number=data["moment_number"],
            content=content_binary_encoded, #can be media or none
            text_entry=data["text_entry"], #can be text or none
            content_type=data["content_type"],
            date=datetime_current #will get you a datetime 
        )
        logging.info("Checkin object created")
        checkin.save()
        return HttpResponse('Data saved successfully', status=200)
    except Exception as e:
        # Log and return an error response if the check-in creation fails
        logging.info("Checkin failed exception: %s", e)
        return HttpResponse("Check-in failed to save", status=400)

def checkin_view(request):
    # Handle the check-in POST request
    if request.method != 'POST':
        # Return an error response if the request method is not POST
        return HttpResponse(constInvalidReq, status=405)

    # Parse the JSON data from the request body
    data = json.loads(request.body)

    
    
    # Validate the POST data
    error_response = validate_data(data) #allows content and text entry to be none type and pass through without error
    if error_response:
        return error_response

    # Retrieve the user associated with the check-in
    user, error_response = get_user(data["username"])
    if error_response:
        return error_response
    logging.info("Retrieved user in checkin view")

    # Create the check-in record
    return create_checkin(user, data)

def update_checkin_info_view(request):
    # Check if the request method is POST
    if request.method != "POST":
        # Return an HTTP 400 response if the method is not POST
        return HttpResponse("Not a POST request", status=400)

    # Parse the JSON data from the request body
    data = json.loads(request.body)

    # Attempt to retrieve the checkin object based on the checkin id provided in the POST data
    try:
        checkin_id = data["checkin_id"]  # Get the username from the POST data
        checkin = Checkin.objects.get(checkin_id=checkin_id)  # Retrieve the checkin from the database
    except Exception as e:
        # Log the error and return an HTTP 400 response if the user cannot be retrieved
        logging.info("ERROR RETRIEVING CHECKIN: %s", e)
        logging.info("RECEIVED CHECKINID %s", checkin_id)
        return HttpResponse("Checkin_id is in invalid format or does not exist", status=400)
    
    #verify content and text entry both are not None before updating
    if 'text_entry' in data and 'content' in data: #content and text entry in post
        logging.info('Text and content posted')
        if data["text_entry"] is None and data["content"] is None:
            logging.info('Both None')
            return HttpResponse('No content in checkin!', status=400)
    elif 'text_entry' in data: # just text entry in post, no content
        logging.info('Text posted, no content')
        if data["text_entry"] is None: 
            if checkin.content is None:
                logging.info('Both None')
                return HttpResponse('No content in checkin!', status=400)
    elif 'content' in data: # just content in post, no text
        logging.info('content posted, no text')
        if data["content"] is None: 
            if checkin.text_entry is None:
                logging.info('Both None')
                return HttpResponse('No content in checkin!', status=400)
    
    error_response = validate_data(data) #allows content and text entry to be none type and pass through without error
    if error_response:
        return error_response

    # Define a dictionary mapping POST data keys to their respective update functions and expected values
    update_actions = {
        'text_entry': (update_text_entry, data.get("text_entry")),
        'content_type': (update_content_type, data.get("content_type")),
        'content': (update_content, data.get("content")),
    }

    # Iterate over the update_actions dictionary, where each entry contains a field to update and its corresponding update function.
    for key, (update_func, value) in update_actions.items(): 
        if key in data and value: # Check if the key is in the POST data and has a non-empty value
            error_response = update_func(checkin, value) # Call the respective update function with the user object and the value from the POST data
            if error_response: # If the update function returns an error response, return it immediately
                return error_response

    # Return an HTTP 200 response indicating that the updates were successful
    return HttpResponse("Changes Successful!")

def update_text_entry(checkin, new_text_entry):
    try:
        checkin.text_entry = new_text_entry
        checkin.save()
        logging.info("SUCCESS! Text entry has been updated to \"%s\"", checkin.text_entry)
    except Exception as e:
        logging.info("ERROR IN CHANGING TEXT ENTRY: %s", e)
        return HttpResponse("Error in updating text entry", status=400)

def update_content_type(checkin, new_content_type):
    try:
        checkin.content_type = new_content_type
        checkin.save()
        logging.info("SUCCESS! Content type has been updated to \"%s\"", checkin.content_type)
    except Exception as e:
        logging.info("ERROR IN CHANGING CONTENT TYPE: %s", e)
        return HttpResponse("Error in updating content type", status=400)
    
def update_content(checkin, new_content):
    try:
        checkin.content = base64.b64decode(new_content)
        checkin.save()
        logging.info("SUCCESS! Content has been updated!")
    except Exception as e:
        logging.info("ERROR IN CHANGING CONTENT: %s", e)
        return HttpResponse("Error in updating content", status=400)

def delete_checkin_view(request): # to delete a specified checkin_id
    if request.method == "POST":
        # Retrieve usernames from POST request
        data = json.loads(request.body)
        checkin_id = data.get("checkin_id")
        logging.info('retrieved checkin_id %s', checkin_id)

        try:
            # Getting users from the user objects from the user table
            checkinobj = Checkin.objects.get(checkin_id=checkin_id)
            logging.info('retrieved user %s', checkinobj)

            checkin = Checkin.objects.filter(checkin_id= checkin_id)
        
            # Delete the User if it exists
            if checkin.exists():
                checkin.delete()
                return HttpResponse("checkin deleted successfully", status=200)
            else:
                return HttpResponse("Checkin does not exist", status=400)
        except Exception as e:
            return HttpResponse("Error deleting checkin: " + str(e), status=400)

    return HttpResponse(constInvalidReq, status=400)

#Retrieve thumbnail placeholder as global variable videothumb
videothumb_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'tests/test_resources/b64videothumbnail.txt'))
videoThumbFile = open(videothumb_file_path, 'r')
videothumb = videoThumbFile.read()
videoThumbFile.close()

def get_checkin_info_view(request):
    if request.method == "GET":
        username = request.GET.get("username")  # JSON is not typically used for GET requests here

        # Make sure the get data is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)
                user_id = user.pk # get foreign key reference field to look up in checkin userid column

                #Retrieve all checkins associated with this user
                all_checkins = Checkin.objects.filter(user_id=user_id) # filter returns all matching objects, GET returns only if one matching object

                response_data=[] #List of dictionaries holding all checkin moments of the user

                for checkin in all_checkins: # looping through checkins for user specified
                    obj_content= None #default if empty
                    
                    if checkin.content is not None and checkin.content_type != "video": #get content if not None and if not video
                        obj_content= base64.b64encode(checkin.content).decode('utf-8')
                    
                    if checkin.content_type == "video": #get thumbnail if video to pass as content
                        obj_content = videothumb #image of play video screen as base 64 from file- global var above view

                    current_checkin = { # dictionary to append to list
                        "checkin_id": checkin.checkin_id,
                        "content_type": checkin.content_type,
                        "moment_number": checkin.moment_number,
                        "content": obj_content,  #content converted from binary to base64 then to a base 64 string, or None, or thumbnail image
                        "text_entry": checkin.text_entry,
                        "user_id": checkin.user_id.id,
                        "date": checkin.date.strftime('%Y-%m-%d'), # Convert date to string to be JSON serializable
                        "time": checkin.date.strftime('%H:%M:%S'),
                    }
                    response_data.append(current_checkin) #add checkin to the list to be returned
  
                logging.info(response_data)
                return HttpResponse(json.dumps(response_data), content_type= constAppJson)  # returning a LIST of DICTIONARIES where each dictionary is a checkin moment of the user specified - do not change
            except Exception as e:
                logging.info(e)
                return HttpResponse(constUserDNE, status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)

def update_streak(user): # called in create checkin to update the streak each day
    logging.info("Updating streak")
    # Update user's streak
    user.current_streak += 1
    if user.current_streak > user.longest_streak: #update the longest streak if needed 
        user.longest_streak = user.current_streak
    user.save()
    logging.info("Streak updated")
    # Update user's badges
    badges = Badges.objects.get(user_id=user)
    if badges != None:
        logging.info("User badges object found")
        if user.current_streak == 1 and badges.one_day == False:
            badges.one_day = True
            badges.save()
            logging.info("1 day badge added")
        elif user.current_streak == 7 and badges.one_week == False:
            badges.one_week = True
            badges.save()
            logging.info("1 week badge added")
        elif user.current_streak == 30 and badges.one_month == False:
            badges.one_month = True
            badges.save()
            logging.info("1 month badge added")
        elif user.current_streak == 365 and badges.one_year == False:
            badges.one_year = True
            badges.save()
            logging.info("1 year badge added")
        logging.info("Badges updated")
    else:
        logging.info(f"No badge object found for {user.username}")

def get_video_info_view(request): 
    if request.method == "GET":
        logging.info("In the get_video_info_view*****************")
        checkin_id = request.GET.get("checkin_id")  # JSON is not typically used for GET requests here
        logging.info("checkin_id: %s", checkin_id)
        # Make sure the get data is not empty
        if checkin_id is not None:
            try:
                # Retrieve the user from the database by username
                video_checkin = Checkin.objects.get(checkin_id=checkin_id)
                logging.info("video_checkin: %s", video_checkin)
                obj_content= base64.b64encode(video_checkin.content).decode('utf-8')
                logging.info("passed the odj content encoding 64*****************")
                return HttpResponse(json.dumps(obj_content), content_type= constAppJson) #this is the base64 string being passed
            except Exception as e:
                logging.info(e)
                return HttpResponse(constUserDNE, status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)

def get_todays_checkin_info_view(request):
    logging.info("In the get_todays_checkin_info_view*****************")
    if request.method == "GET":
        # Retrieve the list of usernames from the query parameters
        usernames = request.GET.getlist('username[]')
        logging.info("Usernames: %s", usernames)

        # Make sure the get data is not empty
        if len(usernames)>=1: #username(s) were passed
            try:
                response_data=[] #List of dictionaries holding all checkin moments of the users to return
                # Retrieve the users from the database by username
                for username in usernames: # for each name passed
                    user = User.objects.get(username=username)
                    user_id = user.pk # get foreign key reference field to look up in checkin userid column
                    
                    #Retrieve all checkins associated with this user from TODAY
                    today = date.today()

                    # Assuming 'user_id' is already defined
                    all_checkins = Checkin.objects.filter(user_id=user_id, date__date=today)

                    for checkin in all_checkins: # looping through checkins for user specified
                        obj_content= None #default if empty
                        
                        if checkin.content is not None and checkin.content_type != "video": #get content if not None and if not video
                            obj_content= base64.b64encode(checkin.content).decode('utf-8')
                            
                        if checkin.content_type == "video": #get thumbnail if video to pass as content
                            obj_content = videothumb #image of play video screen as base 64 from file- global var above view
                        
                        current_checkin = { # dictionary to append to list
                            "username": username,
                            "checkin_id": checkin.checkin_id,
                            "content_type": checkin.content_type,
                            "moment_number": checkin.moment_number,
                            "content": obj_content,  #content converted from binary to base64 then to a base 64 string, or None
                            "text_entry": checkin.text_entry,
                            "user_id": checkin.user_id.id,
                            "date": checkin.date.strftime('%Y-%m-%d'), # Convert date to string to be JSON serializable
                        }
                        response_data.append(current_checkin) #add checkin to the list to be returned
    
                logging.info(response_data)
                return HttpResponse(json.dumps(response_data), content_type= constAppJson)  # returning a LIST of DICTIONARIES where each dictionary is a checkin moment of the user specified - do not change
            except Exception as e:
                logging.info(e)
                return HttpResponse(constUserDNE, status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)


# ########## Utility Views ##########





# ########## Utility Views ##########



def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})

def send_report_email_view(request):
    if request.method != "POST":
        return HttpResponse(constNotPost, status=400)
    
    data = json.loads(request.body)
    message = data["message"]
    username = data["username"]
    
    if message is None or username is None:
        return HttpResponse("No data received", status=400)
    
    subject = f"APP REPORT {message[:20]}... - {username}"
    message = f"Report from user: {username} on {datetime.today()}. \n\n{message}"
    try:
        response = send_mail(subject, message, from_email = settings.EMAIL_HOST_USER, recipient_list = [settings.RECIPIENT_ADDRESS], fail_silently=False)
        print(response)
        return JsonResponse({"response": response})
    except Exception as e:
        logging.error("Error sending email: %s", e)
        return JsonResponse({"status": 400})

def send_password_reset_email_view(request):
    if request.method != "POST":
        return HttpResponse(constNotPost, status=400)
    
    data = json.loads(request.body)
    username = data["username"]
    code = data["code"]
    
    if username is None:
        return HttpResponse("No username received", status=400)
    if code is None:
        return HttpResponse("No code received", status=400)
    try:
        user = User.objects.get(username=username)
    except Exception as e:
        logging.info(e)
        return HttpResponse(constUserDNE, status=400)
    email = user.email

    if email is None:
        return HttpResponse("No email received", status=400)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return HttpResponse("User with that email does not exist", status=400)
    
    subject = "Password Reset Request"
    message = f"Hello {user.username},\n\nYour Code:\n{code}\n\nIf you did not request a password reset, please ignore this email.\n Sent at: {datetime.today()}"
    try:
        response = send_mail(subject, message, from_email = settings.EMAIL_HOST_USER, recipient_list = [email], fail_silently=False)
        print(response)
        return JsonResponse({"response": response})
    except Exception as e:
        logging.error("Error sending email: %s", e)
        return JsonResponse({"status": 400})
    
def change_password_view(request):
    if request.method != "POST":
        return HttpResponse(constNotPost, status=400)
    
    data = json.loads(request.body)
    username = data["username"]
    new_password = data["new_password"]
    
    if username is None:
        return HttpResponse("No username received", status=400)
    if new_password is None:
        return HttpResponse("No new password received", status=400)
    
    try:
        user = User.objects.get(username=username)
    except Exception as e:
        logging.info(e)
        return HttpResponse(constUserDNE, status=400)
    
    user.set_password(new_password)
    user.save()
    return HttpResponse("Password changed successfully", status=200)


# ########## Friends Management ##########



# ########## Friends Management ##########
    
def add_friend_view(request):
    logging.info("IN ADD FRIEND VIEW")
    if request.method == "POST":
        # Retrieving username to access correct user in database
        data = json.loads(request.body)
        username1 = data.get("user1")
        username2 = data.get("user2")
        logging.info("USERNAME1: %s, USERNAME2: %s", username1, username2)
        if username1 == username2:
            return HttpResponse("Can't Add Yourself!", status=400)

        try:
            # Check if both users exist
            user1 = User.objects.get(username=username1)  # Retrieving user from the database
            user2 = User.objects.get(username=username2)
            logging.info("Users found")

            # Get the user IDs
            logging.info("Getting user ids")
            user1_id = user1.pk
            user2_id = user2.pk
            logging.info("User1_id: %s, User2_id: %s", user1_id, user2_id)

            # Check if a connection already exists
            logging.info("Checking for existing connection")
            outgoing = Friends.objects.filter(user1=user1_id, user2=user2_id) # outgoing friend request
            incoming = Friends.objects.filter(user1=user2_id, user2=user1_id) # incoming friend request
            if outgoing.exists():
                # Already friends
                if outgoing[0].complete:
                    logging.info(constFriendExists)
                    return HttpResponse(constFriendExists, status=400)
                # Already sent a friend request
                else:
                    logging.info("Friend request already sent")
                    return HttpResponse("Friend request already sent", status=400)
            if incoming.exists():
                # Already friends
                if incoming[0].complete:
                    logging.info(constFriendExists)
                    return HttpResponse(constFriendExists, status=400)
                # Accept the friend request
                else:
                    logging.info("Accepting friend request")
                    # Make new object to update Friends successfully
                    friend_request = incoming[0]
                    friend_request.complete = True
                    friend_request.save()
                    response_data = {"message": "Success! Friend request accepted!"}
                    return HttpResponse(json.dumps(response_data), content_type= constAppJson)
            logging.info("No existing connection found")
            # If no previous history with user2, create brand new friendship
            friends = Friends.objects.create(
                user1=user1,
                user2=user2,
                complete=False,
            )
            friends.save() 
            logging.info("Friends object created")
            response_data = {"message": "Success! Friend request sent!"}
            return HttpResponse(json.dumps(response_data), content_type= constAppJson)
        except User.DoesNotExist:
            return HttpResponse(constUserDNE, status=400)
        except Exception as e:
            return HttpResponse("Adding friend failed: " + str(e), status=400)
    return HttpResponse(constNotPost)

def delete_friend_view(request):
    if request.method == "POST":
        # Retrieve usernames from POST request
        data = json.loads(request.body)
        username1 = data.get("username")
        unfriend_username = data.get("unfriendusername")

        try:
            # Getting users from the user objects from the user table
            user1 = User.objects.get(username=username1)
            unfriend_user = User.objects.get(username=unfriend_username)

            # Query an "or" since both columns since either column can have the usernames
            friendship = Friends.objects.filter(
                (Q(user1=user1) & Q(user2=unfriend_user)) |
                (Q(user1=unfriend_user) & Q(user2=user1)),
                complete=True  # Ensure they are actually friends
            )

            # Delete the friendship if it exists
            if friendship.exists():
                friendship.delete()
                return HttpResponse("Friendship deleted successfully", status=200)
            else:
                return HttpResponse("Friendship does not exist", status=400)

        except User.DoesNotExist:
            return HttpResponse(constUserDNE, status=400)
        except Exception as e:
            return HttpResponse("Error deleting friend: " + str(e), status=400)

    return HttpResponse(constInvalidReq, status=400)

def get_friends_view(request):
    if request.method == "GET":
        username = request.GET.get("username")

        # Make sure the username is not empty
        if username is not None:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)

                # Get friendships where the given user is either user1 or user2
                friendships = Friends.objects.filter(user1_id=user.id) | Friends.objects.filter(user2_id=user.id)

                # List to store friend usernames and the friendship status
                friendship_data = []

                # Populate the list with dictionaries containing usernames and friendship status
                for friendship in friendships:
                    if friendship.user1_id == user.id:
                        friend_id = friendship.user2_id
                    else:
                        friend_id = friendship.user1_id

                    # Get the username of the friend
                    friend_username = User.objects.get(id=friend_id).username

                    friendship_data.append({
                        'username': friend_username,
                        'status': friendship.complete
                    })

                # Log data and return as JSON response
                logging.info("Friendship status data:")
                logging.info(friendship_data)
                return JsonResponse(friendship_data, safe=False)

            except User.DoesNotExist:
                return HttpResponse(constUserDNE, status=400)
            except Exception as e:
                logging.error(e)
                return HttpResponse("An error occurred", status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)


# ########## Badges Management ##########



# ########## Badges Management ##########

def get_badges_view(request):
    logging.info("In the get_badges_view")
    if request.method == "GET":
        # Retrieve the user ID from the query parameters
        username = request.GET.get('username')
        if not username:
            return HttpResponse("User ID not provided", status=400)
        
        try:
            # Retrieve the badges for the specified user
            user = User.objects.get(username=username)
            user_id = user.pk # get foreign key reference field to look up in checkin userid column
            
            badges = Badges.objects.get(user_id=user_id)
            response_data = {
                "user_id": user_id,
                "one_day": badges.one_day,
                "one_week": badges.one_week,
                "one_month": badges.one_month,
                "one_year": badges.one_year
            }

            # Filter to include only the badges that are True
            true_badges = {k: v for k, v in response_data.items() if v is True}

            logging.info(true_badges)
            return HttpResponse(json.dumps(true_badges), content_type="application/json")
        except Badges.DoesNotExist:
            logging.info(f"No badges found for user {user_id}")
            return HttpResponse(f"No badges found for user {user_id}", status=404)
        except Exception as e:
            logging.error(f"Error retrieving badges: {e}")
            return HttpResponse("Error retrieving badges", status=400)
    else:
        return HttpResponse(constNotGet, status=400)

def get_current_streak_view(request):
    logging.info("In the get_current_streak_view*****************")
    if request.method == "GET":
        # Retrieve the username from the query parameter
        username = request.GET.get('username')
        logging.info("Username: %s", username)

        # Make sure the username is provided
        if username:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)
                
                # Retrieve the current streak from the user object
                current_streak = user.current_streak

                logging.info(current_streak)
                return HttpResponse(json.dumps(current_streak), content_type='application/json')
            except User.DoesNotExist:
                return HttpResponse(constUserDNE, status=400)
        else:
            return HttpResponse(constUNnotProvided, status=400)
    else:
        return HttpResponse(constNotGet, status=400)
    
def get_longest_streak_view(request):
    logging.info("In the get_longest_streak_view*****************")
    if request.method == "GET":
        # Retrieve the username from the query parameter
        username = request.GET.get('username')
        logging.info("Username: %s", username)

        # Make sure the username is provided
        if username:
            try:
                # Retrieve the user from the database by username
                user = User.objects.get(username=username)
                
                # Retrieve the current streak from the user object
                longest_streak = user.longest_streak

                logging.info(longest_streak)
                return HttpResponse(json.dumps(longest_streak), content_type='application/json')
            except User.DoesNotExist:
                return HttpResponse(constUserDNE, status=400)
        else:
            return HttpResponse(constUNnotProvided, status=400)
    else:
        return HttpResponse(constNotGet, status=400)

def get_profile_pictures_view(request):
    if request.method == "GET":
        username_list = request.GET.getlist("username_list[]")
        # Make sure the username list is not empty
        if username_list is not None:
            try:
                profile_pic_list = []
                for username in username_list:

                    user = User.objects.get(username=username)
                    user_id = user.pk
                    
                    #Retrieve the profile picture associated with this user
                    users_list = User.objects.filter(id=user_id) # filter returns all matching objects, GET returns only if one matching object
                    
                    for listed_user in users_list: # looping through checkins for user specified
                        obj_content= None #default if empty


                        if listed_user.profile_picture is not None: #get content if not None and if not video
                            obj_content= base64.b64encode(listed_user.profile_picture).decode('utf-8')                    

                        current_user = { # dictionary to append to list
                            "username": username,
                            "profile_picture": obj_content,  #content converted from binary to base64 then to a base 64 string, or None
                        }
                        profile_pic_list.append(current_user) #add checkin to the list to be returne

                # Log data and return as JSON response
                logging.info(profile_pic_list)
                return JsonResponse(profile_pic_list, safe=False)

            except User.DoesNotExist:
                return HttpResponse(constUserDNE, status=400)
            except Exception as e:
                logging.error(e)
                return HttpResponse("An error occurred", status=400)
        else:  # username was empty
            return HttpResponse(constUNnotProvided, status=400)
    return HttpResponse(constNotGet)


# ############ Community Management ###########


# ############ Community Management ###########

def create_community_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        logging.info("IN create_community_view....")
        logging.info("Parsed JSON data: %s", data)

        # Check for missing keys and return an error response if any are found
        error_response = validate_data(data)
        if error_response:
            return error_response        
        
        user=None #to be global in view
        username = data["username"] 
        try: 
            user = User.objects.get(username=username)
            logging.info("USER'S PK: %s", user.pk)
            logging.info("got user in create community view")
        except Exception as e:  # Catch exceptions like IntegrityError
            logging.info(e)
            return HttpResponse(constUserDNE, status=400)   
            
        community_name = data["community_name"]
        date_created = date.today()
        logging.info("date_created: %s", date_created)
        
        if data["community_photo"] is not None: # if there is a photo decode it and save it
            comm_photo_data = base64.b64decode(data["community_photo"])
            logging.info("has community photo")
        else: 
            comm_photo_data= None
            logging.info("has NO community photo")

        # Attempt to create a new community
        logging.info("Attempting to create a community.....")
        try:
            community = Community.objects.create(
                community_name = community_name,
                community_photo = comm_photo_data, #could be None or a photo in binary
                community_description = data["community_description"],  # Confirmation password
                owner_id = user, 
                privacy = data["privacy"],
                date_created= date_created #today's date
            )
            community.save()
            logging.info("community made")
            #add the owner of the community to the communityUser table 
            CommunityUser.objects.create(user_id= user, community_id = community, status= True, date_joined= date_created)  # Create a new badge object for the user
            logging.info("added owner to community user table")
            return HttpResponse("Community has been created!")
        except Exception as e:  # Catch exceptions like IntegrityError
            logging.info(e)
            return HttpResponse("Community has failed to be created.", status=400)   
    else: 
        return HttpResponse(constNotPost)
    
def get_specific_community_info_view(request):
    if request.method == "GET":
        logging.info("*************IN GET SPECIFIC COMMUNITY INFO VIEW************")
        
        community_name = request.GET.get("community_name")
        logging.info("Community name: %s", community_name)
        # Make sure the community name is not empty
        if community_name is not None:
            try:                
                #Retrieve the community
                try: 
                    community = Community.objects.get(community_name=community_name)
                    logging.info("GOT Community")
                except Exception as e: 
                    logging.info("error: %s", e)
                    return HttpResponse(e, status=400)

                response_data = {
                'community_id': community.community_id,
                'community_name': community.community_name,
                'community_description': community.community_description,
                'owner_id': community.owner_id.pk,
                'privacy': community.privacy,
                'date_created': community.date_created.strftime('%Y-%m-%d')
            }
                logging.info(response_data)
                return HttpResponse(json.dumps(response_data), content_type='application/json')
            except Exception as e:
                logging.error("GET SPECIFIC COMMUNITY ERROR: %s",e)
                return HttpResponse("An error occurred", status=400)
        else:  # name  was empty
            return HttpResponse("No Name Provided", status=400)
    return HttpResponse(constNotGet)

def get_all_community_info_view(request):
    if request.method == "GET":
    
        try:
            # Retrieve all public communities from the database
            communities = Community.objects.filter(privacy="public")

            # List to store communities in
            communities_list = []
            for community in communities:
                communities_list.append({
                    'community_id': community.community_id,
                    'community_name': community.community_name,
                    'community_description': community.community_description,
                    'owner_id': community.owner_id.pk,
                    'privacy': community.privacy,
                    'date_created': community.date_created.strftime('%Y-%m-%d')
                })
                
            logging.info("SPECIFIC COMMUNITY INFO: %s", communities_list)
            logging.info(communities_list)
            return HttpResponse(json.dumps(communities_list), content_type='application/json')
        
        except Exception as e:
            logging.error("GETTING ALL COMMUNITIES ERROR: %s",e)
            return HttpResponse("Getting all communities error", status=400)
    return HttpResponse(constNotGet)

