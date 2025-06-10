from db.controllers.users_controller import UsersController
from user_session import UserSession
from main import get_db_session


def handle_login(data):
    """
    Handle user login with proper database session management.
    """
    # Access the username and password
    username = data['username']
    password = data['password']

    try:
        with get_db_session() as session:
            # Initialize the users controller with the session
            users_controller = UsersController(session)

            # Check if the user exists and is a manager
            user_exists, is_manager = users_controller.check_user_existence_and_manager_status(username, password)

            if not user_exists:
                raise ValueError("User does not exist")

            # Retrieve the actual user ID from the database
            user_id = users_controller.get_user_id_by_username_and_password(username, password)

            # Create a UserSession object if the user exists
            user_session = UserSession(user_id=user_id, is_manager=is_manager)

            # Return if the user exists and is a manager, and the user session
            response = {
                "user_exists": user_exists,
                "is_manager": is_manager
            }
            return response, user_session

    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        raise RuntimeError(f"Database error during login: {str(e)}")
