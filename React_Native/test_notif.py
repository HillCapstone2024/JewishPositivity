import requests
from pathlib import Path
import os
from dotenv import load_dotenv
load_dotenv()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

App_Key = os.getenv("App_Key")
Rest_API_KEY = os.getenv("Rest_API_KEY")

headers = {
    'Authorization': f"Basic \u003c{Rest_API_KEY}\u003e",
    'Content-Type': 'application/json'
}

payload = {
    "app_id": App_Key,
    "contents": {"en": "Testing sending to test_brian user."},
    "target_channel": "push",
    "include_aliases": { "external_id": ["brian_test"]}
}

response = requests.post("https://onesignal.com/api/v1/notifications", headers=headers, json=payload)

print(response.status_code)
print(response.json())
