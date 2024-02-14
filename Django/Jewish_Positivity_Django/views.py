# in views.py

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth.models import User

def login_view(request):
    print('in login_view')
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
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
        # Create a new user
        username = request.POST['username']
        password = request.POST['password']
        first_name = request.POST['firstname']
        last_name = request.POST['lastname']
        email= request.POST['email']
        try:
            user= User.objects.create_user(username=username, password=password, email= email, first_name= first_name, last_name= last_name)
            user.save() 
            # return redirect('home')  # Redirect to home page after successful user creation
            return HttpResponse('Create a new user successful!')
        except:
             return HttpResponse('User failed to be created.')
    return HttpResponse('Not a POST request!')

def logout_view(request):
    logout(request)
    return redirect('login')  # Redirect to login page after logout
