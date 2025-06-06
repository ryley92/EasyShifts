import React, { useState, useEffect } from 'react';
import { useSocket } from '../utils';
import ManagerProfile from './ManagerProfile';
import EmployeeProfile from './EmployeeProfile';
import './../css/Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const socket = useSocket();

    const handleLogin = () => {
        if (username.trim() === '' || password.trim() === '') {
            setError('Please fill in all fields');
        }
        else if (socket && socket.readyState === WebSocket.OPEN) {
            const request = {
                request_id: 10,
                data: { username, password },
            };

            socket.send(JSON.stringify(request));
            // Add event listener specifically for this request, and remove it once handled.
            socket.addEventListener('message', handleMessage);
        } else {
            console.error('Not connected to the server');
            setError('Not connected to the server. Please try again later.');
        }
    };

    const handleMessage = (event) => {
        // Remove listener immediately to avoid processing other messages with this handler
        if (socket) {
            socket.removeEventListener('message', handleMessage);
        }

        if (event.data == null) {
            console.error('Received null or undefined data in login.');
            setError('Received empty login response.');
            return;
        }

        try {
            const packetPayload = JSON.parse(event.data);
            console.log("Login response received:", packetPayload);

            // Check if it's the specific response for login (request_id: 10)
            if (packetPayload && packetPayload.request_id === 10 && packetPayload.data) {
                const loginData = packetPayload.data;
                const userExists = loginData.user_exists;
                const isManagerResponse = loginData.is_manager; // Renamed to avoid conflict with state setter

                if (userExists === false) {
                    setError('Invalid Username or Password');
                } else {
                    setIsManager(isManagerResponse === true);
                    setLoggedIn(true);
                }
            } else if (packetPayload && packetPayload.success === false && packetPayload.error) {
                // Handle generic error response from the server (e.g., from server's main try-catch)
                setError(packetPayload.error);
            } else {
                // Fallback for unexpected response structures that might not be for this request
                // This check helps if the listener wasn't removed fast enough or if server sends non-standard responses
                console.warn('Received an unexpected response, possibly not for login:', packetPayload);
                // Avoid setting a generic error if it might be a valid message for another component
                // setError('Received an unexpected response from the server.');
            }
        } catch (e) {
            console.error('Error parsing login response:', e);
            setError('Failed to process login response.');
        }
    };

    if (loggedIn) {
        return (
            <div>
                {isManager ? <ManagerProfile /> : <EmployeeProfile />}
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-form">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" value={username}
                       onChange={(e) => setUsername(e.target.value)} required/>
                <br/>
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={password}
                       onChange={(e) => setPassword(e.target.value)} required/>
                <br/>
                <button type="submit" onClick={handleLogin}>Log In</button>
                <div id="log">{error}</div>
                <div className="signup-link">
                    Don't have an account? <a href="/signup">Sign Up</a>
                </div>
            </div>
        </div>
    );
}

export default Login;
