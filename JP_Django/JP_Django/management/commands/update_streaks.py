import mysql.connector
from datetime import datetime, timedelta
import pytz
#
# IN ORDER TO RUN THIS SCRIPT YOU MUST pip install mysql-connector-python
#
def update_user_streaks():    
    # Connection
    connection = mysql.connector.connect(user="admin", password="Capstone2024admin",
                                     host="134.122.5.28", database="production")
    cursor = connection.cursor()

    # SQL to select unique checkin dates per user ordered by user id
    sql = """
    SELECT
        u.id AS user_id,
        DATE(CONVERT_TZ(c.date, @@session.time_zone, u.timezone)) AS local_date,
        u.timezone
    FROM JP_Django_checkin c
    JOIN JP_Django_user u ON c.id = u.id
    GROUP BY u.id, local_date
    ORDER BY u.id, local_date DESC;
    """
    # This query will return a table with columns user id, checkin dates converted to utc, and user's timezone

    cursor.execute(sql)
    results = cursor.fetchall()

    # UTC now
    utc_now = datetime.now(pytz.utc)

    # Dictionaries to store date entries and streak counts
    last_dates = {}
    current_streaks = {}

    # for each row in results ...
    for user_id, local_date, timezone_str in results:
        local_tz = pytz.timezone(timezone_str) #retreive everything in UTC
        local_now = utc_now.astimezone(local_tz)
        local_today = local_now.date()
        local_yesterday = local_today - timedelta(days=1)

        print(f"Processing User ID: {user_id}, Local Date: {local_date}, Time Zone: {timezone_str}")
        print(f"Local Now: {local_now}, Local Today: {local_today}, Local Yesterday: {local_yesterday}")

        # If user id (key) is not in last dates --> this just gets the first entry for a user that hasnt been looked at yet
        if user_id not in last_dates:
            # If the local date (in results) equals utc local date (today), current streak starts at 1
            if local_date == local_today:
                current_streaks[user_id] = 1  # Streak starts at 1 if there's a check-in today
                print(f"User {user_id} has a check-in today, streak set to 1")
            elif local_date == local_yesterday:
                current_streaks[user_id] = 1  # Streak is 1 if the last check-in was yesterday, beacause there is still time to submit today
                print(f"User {user_id} last checked in yesterday, streak set to 1")
            else:
                current_streaks[user_id] = 0  # No check-in today or yesterday, streak is zero
                print(f"User {user_id} has no recent check-in, streak set to 0")
        else: # Else the user is currently being recorded
            # Continue streak count if dates are consecutive --> the current day is equal to the previous entry - a day
            if local_date == last_dates[user_id] - timedelta(days=1):
                current_streaks[user_id] += 1 
                print(f"User {user_id} streak incremented to {current_streaks[user_id]}")
            else:
                # Break found, stop updating streak for this user but continue with others
                print(f"User {user_id} streak break found. Last date: {last_dates[user_id]}, current date: {local_date}")
                continue  # Proper usage to skip to the next iteration in the loop
        last_dates[user_id] = local_date # Update next day for next loop iteration

    # # Update the database with the current streak values
    # for user_id, streak in current_streaks.items():
    #     update_sql = "UPDATE JP_Django_user SET current_streak = %s WHERE id = %s;"
    #     cursor.execute(update_sql, (streak, user_id))

    for user_id, streak in current_streaks.items():
        print(f"User ID: {user_id}, Current Streak: {streak}")

    #connection.commit()
    cursor.close()
    connection.close()

# Call the function to update user streaks
update_user_streaks()
