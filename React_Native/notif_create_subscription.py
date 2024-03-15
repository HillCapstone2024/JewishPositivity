import requests

def create_user():
    app_id = 'ec16a462-d3d0-4fa3-85cd-d4bdaa8e98a8'
    url = f"https://api.onesignal.com/apps/{app_id}/users"

    payload = {
        "identity": { "external_id": "bfareal" }
    }
    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }

    return requests.post(url, json=payload, headers=headers)

# print(create_user().text)

def create_subscription():
    app_id = 'ec16a462-d3d0-4fa3-85cd-d4bdaa8e98a8'
    alias_label = 'external_id'
    alias_id = 'bfareal'
    url = f"https://api.onesignal.com/apps/{app_id}/users/by/{alias_label}/{alias_id}/subscriptions"

    payload = { "subscription": {
        "type": "iOSPush",
        "token": "pushToken",
        "enabled": True
    }}

    headers = {
        "accept": "application/json",
        "content-type": "application/json"
    }

    return requests.post(url, json=payload, headers=headers)

def create_notification():
    temp = 0

if __name__ == "__main__":
    create_user()
    print(create_subscription().text)