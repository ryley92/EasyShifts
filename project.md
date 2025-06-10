
This file provides guidance to AiderDesk when working with code in this repository.

## Common Commands

### Frontend (`app/`)
The frontend is a React application bootstrapped with Create React App.
-   **Install Dependencies:** `npm install`
-   **Start Development Server:** `npm start` (Runs the app at `http://localhost:3000`)
-   **Run Tests:** `npm test` (Launches the interactive test runner)
-   **Build for Production:** `npm run build` (Outputs optimized build to `app/build`)

### Backend (`Backend/`)
The backend is a Python application.
-   **Install Dependencies:** `pip install -r Backend/requirements.txt`
-   **Run Server:** `python -u Backend/Server.py` (Starts the WebSocket and HTTP server)
-   **Run Database Migrations:** `python Backend/run_migration.py`
-   **Run Tests:** Individual test files can be executed directly, e.g., `python Backend/test_schedule_data.py`

## High-Level Architecture

This project consists of a decoupled frontend and backend, communicating primarily via WebSockets.

### Frontend (`app/`)
The `app/` directory contains a React single-page application. It is responsible for the user interface and interacts with the backend through a WebSocket connection. Components are organized under `app/src/components/`, with shared utilities in `app/src/utils.jsx` and `app/src/contexts/`.

### Backend (`Backend/`)
The `Backend/` directory houses the Python server application.
-   **Server Entry Point:** `Backend/Server.py` is the main entry point, handling WebSocket and HTTP requests using `aiohttp`. It dispatches incoming requests based on a `request_id` to specific handler functions.
-   **Database Interaction:**
    -   **`Backend/main.py`**: Manages SQLAlchemy engine and session factory initialization, connecting to a MySQL/MariaDB database.
    -   **`Backend/db/models.py`**: Defines the SQLAlchemy ORM models (e.g., `User`, `Shift`, `ShiftWorker`).
    -   **`Backend/db/repositories/`**: Contains repository classes (e.g., `UsersRepository`, `ShiftsRepository`) that encapsulate direct database CRUD operations for specific models.
    -   **`Backend/db/services/`**: Implements business logic, often coordinating operations across multiple repositories.
    -   **`Backend/db/controllers/`**: Provides a clean interface for handlers to interact with the database, abstracting away direct service/repository calls.
-   **Request Handling:**
    -   **`Backend/handlers/`**: Contains modules (e.g., `login.py`, `manager_schedule.py`, `enhanced_settings_handlers.py`) that implement the logic for various client requests, identified by a unique `request_id`. These handlers utilize the controllers and services to perform operations.
-   **User Session Management:** `Backend/user_session.py` defines the `UserSession` class, which holds user-specific state and permissions for authenticated interactions.
-   **Configuration:** `Backend/config/` stores application configurations, including database credentials (`private_password.py`) and constants.

### Communication Protocol
The frontend and backend communicate using a custom WebSocket protocol. Requests are JSON objects containing a `request_id` and `data`. The `request_id` determines which backend handler processes the request.

### Deployment
Both the frontend and backend have separate `Dockerfile`s for containerization. The project appears to be set up for deployment on Google Cloud Run, indicated by `cloudrun-frontend.yaml` and `cloudrun-backend.yaml` files.