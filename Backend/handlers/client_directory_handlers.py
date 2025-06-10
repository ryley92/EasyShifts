"""
Enhanced client directory handlers for comprehensive client management.
Includes client users, contacts, projects, and analytics.
"""

from config.constants import db
from db.controllers.client_companies_controller import ClientCompaniesController
from db.controllers.users_controller import UsersController
from db.controllers.jobs_controller import JobsController
from user_session import UserSession
from datetime import datetime, timedelta
from sqlalchemy import func


def handle_get_client_directory(user_session: UserSession) -> dict:
    """
    Get comprehensive client directory with companies, users, and statistics.
    Request ID: 210
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 210, "success": False, "error": "Manager access required."}
    
    try:
        client_companies_controller = ClientCompaniesController(db)
        users_controller = UsersController(db)
        jobs_controller = JobsController(db)
        
        # Get all client companies
        companies = client_companies_controller.get_all_entities()
        
        # Build comprehensive directory
        client_directory = []
        for company in companies:
            # Get client users for this company
            client_users = users_controller.get_users_by_client_company_id(company.id)
            
            # Get jobs for this company
            company_jobs = jobs_controller.get_jobs_by_client_company_id(company.id)
            
            # Calculate statistics
            total_jobs = len(company_jobs)
            active_jobs = len([job for job in company_jobs if job.is_active])
            completed_jobs = total_jobs - active_jobs
            
            # Get recent activity (last 30 days)
            thirty_days_ago = datetime.now() - timedelta(days=30)
            recent_jobs = [job for job in company_jobs if job.created_at >= thirty_days_ago]
            
            company_data = {
                "id": company.id,
                "name": company.name,
                "users": [
                    {
                        "id": user.id,
                        "name": user.name,
                        "username": user.username,
                        "email": user.email,
                        "isActive": user.isActive,
                        "isApproval": user.isApproval,
                        "last_login": user.last_login.isoformat() if user.last_login else None,
                        "google_picture": user.google_picture
                    }
                    for user in client_users
                ],
                "statistics": {
                    "total_jobs": total_jobs,
                    "active_jobs": active_jobs,
                    "completed_jobs": completed_jobs,
                    "recent_jobs_count": len(recent_jobs),
                    "total_users": len(client_users),
                    "active_users": len([user for user in client_users if user.isActive])
                },
                "recent_activity": [
                    {
                        "job_id": job.id,
                        "job_title": job.name,
                        "created_at": job.created_at.isoformat(),
                        "venue_name": job.venue_name
                    }
                    for job in recent_jobs[:5]  # Last 5 recent jobs
                ]
            }
            client_directory.append(company_data)
        
        return {
            "request_id": 210,
            "success": True,
            "data": {
                "companies": client_directory,
                "summary": {
                    "total_companies": len(companies),
                    "total_client_users": sum(len(company["users"]) for company in client_directory),
                    "total_jobs": sum(company["statistics"]["total_jobs"] for company in client_directory),
                    "active_jobs": sum(company["statistics"]["active_jobs"] for company in client_directory)
                }
            }
        }
        
    except Exception as e:
        print(f"Error in handle_get_client_directory: {e}")
        return {"request_id": 210, "success": False, "error": str(e)}


def handle_get_client_company_details(data: dict, user_session: UserSession) -> dict:
    """
    Get detailed information about a specific client company.
    Request ID: 211
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 211, "success": False, "error": "Manager access required."}
    
    company_id = data.get("company_id")
    if not company_id:
        return {"request_id": 211, "success": False, "error": "company_id is required."}
    
    try:
        client_companies_controller = ClientCompaniesController(db)
        users_controller = UsersController(db)
        jobs_controller = JobsController(db)
        
        # Get company details
        company = client_companies_controller.get_entity(company_id)
        if not company:
            return {"request_id": 211, "success": False, "error": "Client company not found."}
        
        # Get all users for this company
        client_users = users_controller.get_users_by_client_company_id(company_id)
        
        # Get all jobs for this company
        company_jobs = jobs_controller.get_jobs_by_client_company_id(company_id)
        
        # Calculate detailed statistics
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        ninety_days_ago = now - timedelta(days=90)
        
        recent_jobs = [job for job in company_jobs if job.created_at >= thirty_days_ago]
        quarterly_jobs = [job for job in company_jobs if job.created_at >= ninety_days_ago]
        
        company_details = {
            "id": company.id,
            "name": company.name,
            "users": [
                {
                    "id": user.id,
                    "name": user.name,
                    "username": user.username,
                    "email": user.email,
                    "isActive": user.isActive,
                    "isApproval": user.isApproval,
                    "last_login": user.last_login.isoformat() if user.last_login else None,
                    "google_picture": user.google_picture,
                    "created_at": getattr(user, 'created_at', None)
                }
                for user in client_users
            ],
            "jobs": [
                {
                    "id": job.id,
                    "title": job.name,
                    "description": job.description,
                    "venue_name": job.venue_name,
                    "venue_address": job.venue_address,
                    "venue_contact_info": job.venue_contact_info,
                    "estimated_start_date": job.estimated_start_date.isoformat() if job.estimated_start_date else None,
                    "estimated_end_date": job.estimated_end_date.isoformat() if job.estimated_end_date else None,
                    "created_at": job.created_at.isoformat(),
                    "is_active": job.is_active
                }
                for job in company_jobs
            ],
            "statistics": {
                "total_jobs": len(company_jobs),
                "active_jobs": len([job for job in company_jobs if job.is_active]),
                "completed_jobs": len([job for job in company_jobs if not job.is_active]),
                "recent_jobs_30_days": len(recent_jobs),
                "quarterly_jobs_90_days": len(quarterly_jobs),
                "total_users": len(client_users),
                "active_users": len([user for user in client_users if user.isActive]),
                "approved_users": len([user for user in client_users if user.isApproval])
            }
        }
        
        return {"request_id": 211, "success": True, "data": company_details}
        
    except Exception as e:
        print(f"Error in handle_get_client_company_details: {e}")
        return {"request_id": 211, "success": False, "error": str(e)}


def handle_update_client_user_status(data: dict, user_session: UserSession) -> dict:
    """
    Update client user status (activate/deactivate, approve/unapprove).
    Request ID: 212
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 212, "success": False, "error": "Manager access required."}
    
    user_id = data.get("user_id")
    action = data.get("action")  # "activate", "deactivate", "approve", "unapprove"
    
    if not user_id or not action:
        return {"request_id": 212, "success": False, "error": "user_id and action are required."}
    
    if action not in ["activate", "deactivate", "approve", "unapprove"]:
        return {"request_id": 212, "success": False, "error": "Invalid action. Must be activate, deactivate, approve, or unapprove."}
    
    try:
        users_controller = UsersController(db)
        user = users_controller.get_entity(user_id)
        
        if not user:
            return {"request_id": 212, "success": False, "error": "User not found."}
        
        if not user.client_company_id:
            return {"request_id": 212, "success": False, "error": "User is not a client user."}
        
        # Update user status based on action
        if action == "activate":
            user.isActive = True
        elif action == "deactivate":
            user.isActive = False
        elif action == "approve":
            user.isApproval = True
        elif action == "unapprove":
            user.isApproval = False
        
        db.commit()
        
        return {
            "request_id": 212,
            "success": True,
            "message": f"User {action}d successfully.",
            "data": {
                "user_id": user.id,
                "isActive": user.isActive,
                "isApproval": user.isApproval
            }
        }
        
    except Exception as e:
        print(f"Error in handle_update_client_user_status: {e}")
        return {"request_id": 212, "success": False, "error": str(e)}


def handle_get_client_analytics(user_session: UserSession) -> dict:
    """
    Get analytics and insights about client companies and their activity.
    Request ID: 213
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 213, "success": False, "error": "Manager access required."}
    
    try:
        client_companies_controller = ClientCompaniesController(db)
        users_controller = UsersController(db)
        jobs_controller = JobsController(db)
        
        # Get all data
        companies = client_companies_controller.get_all_entities()
        all_client_users = users_controller.get_all_client_users()
        all_jobs = jobs_controller.get_all_entities()
        
        # Time periods for analytics
        now = datetime.now()
        thirty_days_ago = now - timedelta(days=30)
        ninety_days_ago = now - timedelta(days=90)
        one_year_ago = now - timedelta(days=365)
        
        # Calculate analytics
        analytics = {
            "overview": {
                "total_companies": len(companies),
                "total_client_users": len(all_client_users),
                "active_client_users": len([user for user in all_client_users if user.isActive]),
                "approved_client_users": len([user for user in all_client_users if user.isApproval]),
                "total_jobs": len(all_jobs),
                "active_jobs": len([job for job in all_jobs if job.is_active])
            },
            "recent_activity": {
                "new_companies_30_days": 0,  # Would need created_at field on companies
                "new_users_30_days": len([user for user in all_client_users if hasattr(user, 'created_at') and user.created_at >= thirty_days_ago]),
                "new_jobs_30_days": len([job for job in all_jobs if job.created_at >= thirty_days_ago]),
                "jobs_completed_30_days": 0  # Would need completed_at field
            },
            "top_clients": [
                {
                    "company_id": company.id,
                    "company_name": company.name,
                    "job_count": len([job for job in all_jobs if job.client_company_id == company.id]),
                    "active_job_count": len([job for job in all_jobs if job.client_company_id == company.id and job.is_active]),
                    "user_count": len([user for user in all_client_users if user.client_company_id == company.id])
                }
                for company in companies
            ]
        }
        
        # Sort top clients by job count
        analytics["top_clients"].sort(key=lambda x: x["job_count"], reverse=True)
        analytics["top_clients"] = analytics["top_clients"][:10]  # Top 10
        
        return {"request_id": 213, "success": True, "data": analytics}
        
    except Exception as e:
        print(f"Error in handle_get_client_analytics: {e}")
        return {"request_id": 213, "success": False, "error": str(e)}
