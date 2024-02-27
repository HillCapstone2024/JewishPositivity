#for setting up notification task
#use celery to check DB periodically to send notifications 

# from .models import Notification #from DB model for Notifcations
# from django.utils import timezone
# import requests #simplifies making HTTP requests to external services like OneSignal

# def send_notifications():
#     now = timezone.now()
#     notifications_to_send = Notification.objects.filter(send_time__lte=now) #ensures that only notifications whose send_time has already passed are included in the queryset.
    
#     for notification in notifications_to_send:
#         notification_data = {
#             "app_id": "YOUR_ONESIGNAL_APP_ID", #fill in -- use .env file
#             "contents": {"en": notification.message},
#             "included_segments": [notification.target_audience],
#             # Other data you want to send with the notification
#         }

#         # Make a POST request to OneSignal's API
#         response = requests.post(
#             "https://onesignal.com/api/v1/notifications",
#             headers={
#                 "Content-Type": "application/json",
#                 "Authorization": "Basic YOUR_ONESIGNAL_REST_API_KEY", #fill in- use .env file
#             },
#             json=notification_data,
#         )

#         # Handle the response
#         if response.status_code == 200:
#             # Notification sent successfully, *log this
#             pass
#         else:
#             # Failed to send notification, handle this
#             # log this
#             pass

#         # Delete the notification from the database after sending
#         notification.delete()
