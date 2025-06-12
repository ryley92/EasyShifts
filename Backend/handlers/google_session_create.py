"""
Google Session Creation Handler
Creates secure sessions for Google OAuth authenticated users
"""

import logging
from typing import Dict, Any, Tuple, Optional
from security.secure_session import secure_session_manager
from controllers.users_controller import UsersController
from config.database import get_db_session
from models.user_session import UserSession

logger = logging.getLogger(__name__)

def handle_google_session_create(data: Dict[str, Any], client_ip: str) -> Tuple[Dict[str, Any], Optional[UserSession]]:
    """
    Create a secure session for Google authenticated users
    
    Args:
        data: Request data containing username, email, googleId, isManager
        client_ip: Client IP address for security logging
        
    Returns:
        Tuple of (response_dict, user_session_object)
    """
    try:
        username = data.get('username')
        email = data.get('email')
        google_id = data.get('googleId')
        is_manager = data.get('isManager', False)
        
        logger.info(f"Creating Google session for user '{username}' from IP {client_ip}")
        
        if not username:
            logger.warning(f"Google session creation failed: Missing username (IP: {client_ip})")
            response = {
                "success": False,
                "error": "Username is required"
            }
            return response, None
            
        with get_db_session() as session:
            users_controller = UsersController(session)
            
            # Get or create user
            try:
                user = users_controller.get_user_by_username(username)
                if not user:
                    logger.info(f"Creating new Google user '{username}' from IP {client_ip}")
                    # Create new user for Google authentication
                    user = users_controller.create_user(
                        username=username,
                        password=None,  # No password for Google users
                        email=email,
                        is_manager=is_manager,
                        google_id=google_id,
                        is_google_user=True
                    )
                else:
                    logger.info(f"Found existing user '{username}' for Google session")
                    # Update Google info if needed
                    if google_id and user.google_id != google_id:
                        user.google_id = google_id
                        user.is_google_user = True
                        session.commit()
                        
            except Exception as e:
                logger.error(f"Database error getting/creating Google user '{username}': {e}")
                response = {
                    "success": False,
                    "error": "User creation failed"
                }
                return response, None
            
            # Create user session object
            user_session = UserSession(
                user_id=user.id,
                username=user.username,
                is_manager=user.is_manager,
                workplace_id=user.workplace_id,
                email=user.email,
                google_id=user.google_id
            )
            
            # Prepare user data for session
            user_data = {
                'user_id': user.id,
                'username': user.username,
                'is_manager': user.is_manager,
                'workplace_id': user.workplace_id,
                'email': user.email,
                'google_id': google_id,
                'login_method': 'google',
                'is_google_user': True
            }
            
            try:
                # Create secure session
                session_id, csrf_token = secure_session_manager.create_secure_session(user_data, client_ip)
                
                logger.info(f"Google session created successfully for user '{username}' from IP {client_ip}")
                
                response = {
                    "success": True,
                    "sessionId": session_id,
                    "csrfToken": csrf_token,
                    "user_exists": True,
                    "is_manager": user.is_manager,
                    "username": user.username,
                    "email": user.email,
                    "userId": user.id
                }
                
                return response, user_session
                
            except Exception as e:
                logger.error(f"Failed to create secure session for Google user '{username}': {e}")
                response = {
                    "success": False,
                    "error": f"Session creation failed: {type(e).__name__}"
                }
                return response, None
                
    except Exception as e:
        logger.error(f"Google session creation error for user '{username}': {e}")
        response = {
            "success": False,
            "error": "Google session creation failed"
        }
        return response, None
