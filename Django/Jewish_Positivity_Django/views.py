# in views.py

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect

def login_view(request):
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
    return HttpResponse('Not a POST request!')

def create_user_view(request):
    if request.method == 'POST':
        # Create a new user
        # return redirect('home')  # Redirect to home page after successful user creation
        return HttpResponse('Create a new user successful!')
    return HttpResponse('Not a POST request!')

def logout_view(request):
    logout(request)
    return redirect('login')  # Redirect to login page after logout
