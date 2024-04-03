# in Jewish_Positivity_Django/urls.py

from .views import login_view, create_user_view, logout_view, update_times_view, get_times_view, send_report_email_view, checkin_view, get_user_information_view, update_user_information_view, get_checkin_info_view, add_friend_view, delete_friend_view, get_friends_view, delete_user_view, get_video_info_view
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
    path('delete_user/', delete_user_view, name='delete_user_view'),
    path('check-in/',checkin_view, name='checkin_view'),
    path('get_checkin_info/', get_checkin_info_view, name='get_checkin_info_view'),
    path('get_video_info/', get_video_info_view, name='get_video_info_view'),
    path('send_report_email/', send_report_email_view, name='send_report_email_view'),
    path('update_user_information/', update_user_information_view, name='update_user_information_view'),
    path('add_friend/', add_friend_view, name='add_friend_view'),
    path('delete_friend/', delete_friend_view, name='delete_friend_view'),
    path('get_friend_info/', get_friends_view, name='get_friends_view'),
]
