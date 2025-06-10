import datetime

# Define the next_sunday function to be used as the default value
def _calculate_next_sunday(): # Renamed to avoid conflict if used as an instance elsewhere
    today = datetime.date.today()
    days_until_sunday = (6 - today.weekday() + 7) % 7
    return today + datetime.timedelta(days=days_until_sunday)

next_sunday = _calculate_next_sunday() # This is a date object

DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

# Note: The global 'db' session instance and 'session' factory instance are removed.
# Modules requiring a DB session should obtain it via create_session() from main.py
