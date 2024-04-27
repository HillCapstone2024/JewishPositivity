# in Jewish_Positivity_Django/urls.py

from .views import login_view, create_user_view, logout_view, update_times_view, get_times_view, send_report_email_view, checkin_view, get_user_information_view, get_users_information_view, update_user_information_view, get_checkin_info_view, add_friend_view, delete_friend_view, get_friends_view, delete_user_view, get_video_info_view, get_todays_checkin_info_view, send_password_reset_email_view, change_password_view, get_badges_view, get_current_streak_view, get_longest_streak_view, get_profile_pictures_view, update_checkin_info_view, delete_checkin_view, create_community_view, get_specific_community_info_view, get_all_community_info_view, update_community_view,delete_community_view, get_user_community_info_view, request_to_join_community_view, invite_to_join_community_view, get_users_in_community_view, get_pending_requests_sent_friends_view, get_pending_requests_received_friends_view, search_users_view, get_owner_community_info_view, delete_user_from_community_view, get_pending_requests_to_community_view, get_pending_invites_to_community_view,get_communities_not_owned_info_view, serve_apple_site_association
from django.urls import path
from django.contrib import admin
from .views import csrf_token_view

urlpatterns = [
    path('login/', login_view, name='login'),
    path('create_user/', create_user_view, name='create_user_view'),
    path('admin/', admin.site.urls),
    path('csrf-token/', csrf_token_view, name='csrf_token'),
    path('update-times/', update_times_view, name='update_times_view'),
    path('get_times/', get_times_view, name='get_times_view'),
    path('get_user_info/',get_user_information_view, name='get_user_information_view'),
    path('get_users_info/',get_users_information_view, name='get_users_information_view'),
    path('search-users/',search_users_view, name='search_users_view'),
    path('delete_user/', delete_user_view, name='delete_user_view'),
    path('check-in/',checkin_view, name='checkin_view'),
    path('get_checkin_info/', get_checkin_info_view, name='get_checkin_info_view'),
    path('get_todays_checkin_info/', get_todays_checkin_info_view, name='get_todays_checkin_info_view'),
    path('get_video_info/', get_video_info_view, name='get_video_info_view'),
    path('update_checkin_info/',update_checkin_info_view, name='update_checkin_info_view'),
    path('delete_checkin/', delete_checkin_view, name='delete_checkin_view'),
    path('send_report_email/', send_report_email_view, name='send_report_email_view'),
    path('update_user_information/', update_user_information_view, name='update_user_information_view'),
    path('add_friend/', add_friend_view, name='add_friend_view'),
    path('delete_friend/', delete_friend_view, name='delete_friend_view'),
    path('get_friend_info/', get_friends_view, name='get_friends_view'),
    path('get_pending_requests_sent_friends/', get_pending_requests_sent_friends_view, name='get_pending_requests_sent_friends_view'),
    path('get_pending_requests_received_friends/', get_pending_requests_received_friends_view, name='get_pending_requests_received_friends_view'),
    path('send_password_reset_email_view/', send_password_reset_email_view, name='send_password_reset_email_view'),
    path('change_password_view/', change_password_view, name='change_password_view'),
    path('get_badges/', get_badges_view, name='get_badges_view'),
    path('current_streak/',get_current_streak_view, name='get_current_streak_view'),
    path('longest_streak/',get_longest_streak_view, name='get_longest_streak_view'),
    path('profile_pictures_view/',get_profile_pictures_view, name='get_profile_pictures_view'),
    path('create_community/',create_community_view, name='create_community_view'),
    path('get_specific_community_info/',get_specific_community_info_view, name='get_specific_community_info_view'),
    path('get_all_community_info/',get_all_community_info_view, name='get_all_community_info_view'),
    path('update_community/',update_community_view, name='update_community_view'),
    path('delete_community/',delete_community_view, name='delete_community_view'),
    path('get_user_community_info/',get_user_community_info_view, name='get_user_community_info_view'),
    path('get_pending_requests/',get_pending_requests_to_community_view, name='get_pending_requests_to_community_view'),
    path('get_pending_invites/',get_pending_invites_to_community_view, name='get_pending_invites_to_community_view'),
    path('get_owner_community_info/',get_owner_community_info_view, name='get_owner_community_info_view'),    
    path('request_community/',request_to_join_community_view, name='request_to_join_community_view'),
    path('get_users_in_community/',get_users_in_community_view, name='get_users_in_community_view'),
    path('invite_to_community/',invite_to_join_community_view, name='invite_to_join_community_view'),
    path('delete_user_from_community/',delete_user_from_community_view, name='delete_user_from_community_view'),
    path('get_communities_not_owned_info/',get_communities_not_owned_info_view, name='get_communities_not_owned_info_view'),
    path('apple-app-site-association/', serve_apple_site_association, name='apple-app-site-association')
]   
