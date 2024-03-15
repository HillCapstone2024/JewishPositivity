import onesignal
from onesignal.api import default_api
from onesignal.model.generic_error import GenericError
from onesignal.model.rate_limiter_error import RateLimiterError
from onesignal.model.notification import Notification
from onesignal.model.create_notification_success_response import CreateNotificationSuccessResponse
from pprint import pprint
import requests
import datetime
import pytz

# See configuration.py for a list of all supported configuration parameters.
# Some of the OneSignal endpoints require USER_KEY bearer token for authorization as long as others require APP_KEY
# (also knows as REST_API_KEY). We recommend adding both of them in the configuration page so that you will not need
# to figure it yourself.
configuration = onesignal.Configuration(
    app_key = "ec16a462-d3d0-4fa3-85cd-d4bdaa8e98a8",
    user_key = "Mzk5MzcxMzgtNDQ2MS00OGFiLThkZTgtYWFkNzQ5NjVlMWNi"
)
rest_api_key = '\u003cZmM3MzI1ZTMtY2E1NC00ZDMwLTk0YTMtNDI5ODQzMmU5MmQy\u003e'
headers = {
    'Authorization': f"Basic {rest_api_key}",
    'Content-Type': 'application/json'
}

# print(headers)
# Define the Eastern Timezone (EST/EDT)
est_timezone = pytz.timezone('America/New_York')

# Create a datetime object for March 14th, 2024, 5:00 PM EST
scheduled_time_est = est_timezone.localize(datetime.datetime(2024, 3, 14, 17, 5, 0))

# Convert the scheduled time to UTC
scheduled_time_utc = scheduled_time_est.astimezone(pytz.utc)

# Format the UTC time according to OneSignal's format
send_after = scheduled_time_utc.strftime('%Y-%m-%d %H:%M:%S GMT')

print("Scheduled Time (EST):", scheduled_time_est)
print("Scheduled Time (UTC):", scheduled_time_utc)
print("Formatted Send After:", send_after)

payload = {
    "app_id": configuration.app_key,
    "contents": {"en": "Testing sending to specific users."},
    "target_channel": "push",
    "include_aliases": { "external_id": ["admin2"]}
    #"send_after": send_after,
}

response = requests.post("https://onesignal.com/api/v1/notifications", headers=headers, json=payload)

print(response.status_code)
print(response.json())
