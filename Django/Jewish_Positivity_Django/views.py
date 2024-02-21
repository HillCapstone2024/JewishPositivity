# in views.py

import json
import re
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.db import IntegrityError
import datetime
from datetime import time

User = get_user_model()

def login_view(request):
    print('in login_view')
    if request.method == 'POST':
        data = json.loads(request.body)
        # print(data)
        username = data['username']
        password = data['password']
        user = authenticate(request, username=username, password=password)
        print('username:', username)
        print('password:', password)
        if user is not None:
            login(request, user)
            # return redirect('home')  # Redirect to home page after successful login
            return HttpResponse('Login successful!')
        else:
            # Return an error message or handle unsuccessful login
            return HttpResponse('Login failed!')
    if request.method == 'GET':
        print('Reached GET in login_view')
    return HttpResponse('Not a POST request!')

def create_user_view(request):
    if request.method == 'POST':
        #make sure all keys are given in post
        required_keys = ['username', 'password','reentered_password', 'firstname', 'lastname', 'email']
        missing_keys = [key for key in required_keys if key not in request.POST]
        if missing_keys:
            error_message = f"Missing required keys: {', '.join(missing_keys)}" #tells which keys missing in error message
            return HttpResponse('error', content_type='text/plain', status=400)

        # Create a new user
        username = request.POST['username']
        password = request.POST['password']
        password2 = request.POST['reentered_password'] #must match frontend
        first_name = request.POST['firstname']
        last_name = request.POST['lastname']
        email= request.POST['email']

         # Check if passwords match
        if password != password2:
            return HttpResponse('Passwords do not match', status=400)

        # Regular expression pattern for validating email format
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return HttpResponse('Not email format', status=400)

        # Check if a user with the same email already exists
        if User.objects.filter(email=email).exists():
            return HttpResponse('duplicate email', status=400)
        
        # Check if a user with the same username already exists
        if User.objects.filter(username=username).exists():
            return HttpResponse('duplicate username', status=400)

        try:
            user= User.objects.create_user(username=username, password=password, email= email, first_name= first_name, last_name= last_name)
            user.save() 

            # return redirect('home')  # Redirect to home page after successful user creation
            return HttpResponse('Create a new user successful!')
        except: #IntegrityError
             return HttpResponse('User failed to be created.', status= 400) #user failed to be created due to duplicate info
    return HttpResponse('Not a POST request!')

def logout_view(request):
    try:
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        if not username or not password:
            raise ValueError("Username or password is missing")
        
        # Continue with login logic...
        
    except Exception as e:
        return HttpResponseServerError(f"Error: {e}", status=500)  # Redirect to login page after logout

def update_times_view(request):
    if request.method == 'POST':
        # Retrieving username to access correct tuple in database and retrieving times for updating to non-default
        username = request.POST.get('username')
        time1_str = request.POST.get('time1')
        time2_str = request.POST.get('time2')
        time3_str = request.POST.get('time3')

        try:
            # Convert string times to time objects
            time1 = time.fromisoformat(time1_str)
            time2 = time.fromisoformat(time2_str)
            time3 = time.fromisoformat(time3_str)

            if time1 < time2 < time3:
                user = User.objects.get(username=username)  # Retrieving user from the database
                user.time1 = time1  # Updating times specific to that user
                user.time2 = time2
                user.time3 = time3
                user.save()  # Saving
                return HttpResponse('Success! Times have been updated')
            else:
                return HttpResponse('Invalid ordering', status=400)
        except User.DoesNotExist:
            return HttpResponse('User not found', status=400)
        except ValueError:
            return HttpResponse('Invalid time format', status=400)
        except Exception as e:
            return HttpResponse('Updating user times failed: ' + str(e), status=400)
    return HttpResponse('Not a POST request!')



def csrf_token_view(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrfToken': csrf_token})
