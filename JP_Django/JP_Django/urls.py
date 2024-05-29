# in Jewish_Positivity_Django/urls.py

from .views import login_view, create_user_view, logout_view, update_times_view, get_times_view, send_report_email_view, checkin_view, get_user_information_view, get_users_information_view, update_user_information_view, get_checkin_info_view, add_friend_view, delete_friend_view, get_friends_view, delete_user_view, get_video_info_view, get_todays_checkin_info_view, send_password_reset_email_view, change_password_view, get_badges_view, get_current_streak_view, get_longest_streak_view, get_profile_pictures_view, update_checkin_info_view, delete_checkin_view, create_community_view, get_specific_community_info_view, get_all_community_info_view, update_community_view,delete_community_view, get_user_community_info_view, request_to_join_community_view, invite_to_join_community_view, get_users_in_community_view, get_pending_requests_sent_friends_view, get_pending_requests_received_friends_view, search_users_view, get_owner_community_info_view, delete_user_from_community_view, get_pending_requests_to_community_view, get_pending_invites_to_community_view,get_users_pending_invites_to_community_view, get_communities_not_owned_info_view, serve_apple_site_association, get_users_pending_requests_to_community_view
from django.urls import path
from django.contrib import admin
from .views import csrf_token_view

urlpatterns = [

    # Tools Related URLs
    path('admin/', admin.site.urls), # Admin website
    path('csrf-token/', csrf_token_view, name='csrf_token'), # IP connection
    path('apple-app-site-association/', serve_apple_site_association, name='apple-app-site-association'),
    path('send_report_email/', send_report_email_view, name='send_report_email_view'),
    path('change_password_view/', change_password_view, name='change_password_view'),

    # Basic App Actions
    path('login/', login_view, name='login_view'), # Expects username and password. Returns success
    path('logout/', logout_view, name='logout_view'),

    # All CREATE Actions
    path('create_user/', create_user_view, name='create_user_view'), # Creates a user. Expects username, fname, lname, password, re-password, email
    path('check-in/',checkin_view, name='checkin_view'), # Creates a check-in. Expects a text-entry, date, username, moment number (option: media/content type). 
    path('add_friend/', add_friend_view, name='add_friend_view'), # Creates a friend relationship. Expects user1 and user2
    path('create_community/',create_community_view, name='create_community_view'), # Creates a community. Expects a community name, community photo, community description, owner's username, privacy (public or private) 
    path('request_community/',request_to_join_community_view, name='request_to_join_community_view'),
    path('invite_to_community/',invite_to_join_community_view, name='invite_to_join_community_view'),  
        
    # All UPDATE Actions
    path('update-times/', update_times_view, name='update_times_view'), # Expects 3 times from lowest to highest
    path('update_user_information/', update_user_information_view, name='update_user_information_view'), # Updates user information. Expects newusername or password or fname or lname or email or profile pic, or timezone. Also any combination of each
    path('update_checkin_info/',update_checkin_info_view, name='update_checkin_info_view'), # Updates checkin information. Expects text entry or content type and media    
    path('update_community/',update_community_view, name='update_community_view'), # Expects username (owner) and community id with optional new community name, new photo, new desciption, new owner, new privacy

    # All DELETE Actions
    path('delete_user/', delete_user_view, name='delete_user_view'), # Deletes a user. Expects a username
    path('delete_friend/', delete_friend_view, name='delete_friend_view'), # Deletes a friend. Expects a username and unfriendusername
    path('delete_checkin/', delete_checkin_view, name='delete_checkin_view'), # Deletes a check-in. Expects a check-in ID
    path('delete_community/',delete_community_view, name='delete_community_view'), # Deletes a community. Expects a community ID
    path('delete_user_from_community/',delete_user_from_community_view, name='delete_user_from_community_view'), # Delete a user from community. Expects username and community name

    #------------------------------------------------------------------------------------------

    # GET Actions Separated by Model    
    
    # User-Related GET Actions
    path('get_times/', get_times_view, name='get_times_view'), # Returns times. Expects a username
    path('get_user_info/',get_user_information_view, name='get_user_information_view'), # Returns fname, lname timezone, id, username, password, profile pic, email. Expects a username
    path('get_users_info/',get_users_information_view, name='get_users_information_view'), # Returns a list of fname, lname timezone, id, username, password, profile pic, email. Expects a list of usernames
    path('search-users/',search_users_view, name='search_users_view'), # Returns username. Expects a substring of a username
    path('profile_pictures_view/',get_profile_pictures_view, name='get_profile_pictures_view'), # Returns profile pics. Expects a list of usernames 
    
    # Check-in-Related GET Actions
    path('get_checkin_info/', get_checkin_info_view, name='get_checkin_info_view'), # Returns all check-ins. Expects a username
    path('get_todays_checkin_info/', get_todays_checkin_info_view, name='get_todays_checkin_info_view'), # Returns all check-ins for today. Expects a username
    path('get_video_info/', get_video_info_view, name='get_video_info_view'), # Returns only video checkins. Expects a check-in ID
    
    # Friend-Related GET Actions
    path('get_friend_info/', get_friends_view, name='get_friends_view'), # Returns a user's friends. Expects a usename
    path('get_pending_requests_sent_friends/', get_pending_requests_sent_friends_view, name='get_pending_requests_sent_friends_view'), # Expects a username. Returns all outgoing pending friend requests
    path('get_pending_requests_received_friends/', get_pending_requests_received_friends_view, name='get_pending_requests_received_friends_view'), # Expects a usename. Returns all incoming pending friend requests
    
    # Streak-Related GET Actions
    path('get_badges/', get_badges_view, name='get_badges_view'), # Expects a username. Returns only TRUE badge completions
    path('current_streak/',get_current_streak_view, name='get_current_streak_view'), # Expects a username. Returns current streak
    path('longest_streak/',get_longest_streak_view, name='get_longest_streak_view'), # Expects a username. Returns longest streak
    
    # Community-Related GET Actions
    path('get_specific_community_info/',get_specific_community_info_view, name='get_specific_community_info_view'), # Expects a community name. Returns community id, community name, community description, privacy, owner, date created
    path('get_all_community_info/',get_all_community_info_view, name='get_all_community_info_view'), # Expects nothing. Returns all PUBLIC communities
    
    # Community-Related GET Actions
    path('get_pending_requests/',get_pending_requests_to_community_view, name='get_pending_requests_to_community_view'),# Expects a community name. Returns pending requests
    path('get_pending_invites/',get_pending_invites_to_community_view, name='get_pending_invites_to_community_view'),# Expects a community name. Returns pending invites
    path('get_users_in_community/',get_users_in_community_view, name='get_users_in_community_view'), # Expects a community name. Returns a list of names in the community
    
    # Community-Related-User GET Actions
    path('get_user_community_info/',get_user_community_info_view, name='get_user_community_info_view'), # Expects a username. Returns communities the user is in
    path('get_users_pending_invites_communities/',get_users_pending_invites_to_community_view, name='get_users_pending_invites_to_community_view'),# Expects a username. Returns pending invites from community
    path('get_owner_community_info/',get_owner_community_info_view, name='get_owner_community_info_view'), # Expects a username. Returns communties owned by the username
    path('get_communities_not_owned_info/',get_communities_not_owned_info_view, name='get_communities_not_owned_info_view'), # Expects a username. Returns communites the username is in and does not own
    path('get_users_pending_requests_to_community_view/', get_users_pending_requests_to_community_view, name='get_users_pending_requests_to_community_view'), # Expects a username. Returns a list of names of pending requests from communities
    
    

]   
