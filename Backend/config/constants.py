import datetime

from main import get_database_session, initialize_database_and_session

# Get the shared database session
db = get_database_session()
_, session = initialize_database_and_session()  # Get session factory


# Define the next_sunday function to be used as the default value
def next_sunday():
    today = datetime.date.today()
    days_until_sunday = (6 - today.weekday() + 7) % 7
    return today + datetime.timedelta(days=days_until_sunday)


next_sunday = next_sunday()

DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
