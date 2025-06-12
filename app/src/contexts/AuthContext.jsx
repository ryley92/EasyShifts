import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket, logDebug, logError, logWarning, logInfo } from '../utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const { socket, connectionStatus, isConnected } = useSocket();

  logDebug('AuthProvider', 'AuthProvider rendering', {
    isAuthenticated,
    isLoading,
    connectionStatus,
    hasUser: !!user
  });

  // Check for existing authentication on app load
  useEffect(() => {
    try {
      logDebug('AuthProvider', 'Checking for saved authentication');
      const savedUser = localStorage.getItem('easyshifts_user');

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          logInfo('AuthProvider', 'Found saved user data', {
            username: userData.username,
            isManager: userData.isManager,
            loginTime: userData.loginTime
          });

          // Restore session data if available
          const savedSession = sessionStorage.getItem('easyshifts_session');
          if (savedSession) {
            try {
              const sessionData = JSON.parse(savedSession);
              userData.sessionId = sessionData.sessionId;
              userData.csrfToken = sessionData.csrfToken;
            } catch (sessionError) {
              logWarning('AuthProvider', 'Invalid session data, removing', sessionError);
              sessionStorage.removeItem('easyshifts_session');
            }
          }

          // Validate saved user data structure
          if (userData.username && typeof userData.isManager === 'boolean') {
            setUser(userData);
            setIsAuthenticated(true);
            setAuthError(null);
          } else {
            logWarning('AuthProvider', 'Invalid saved user data structure', userData);
            localStorage.removeItem('easyshifts_user');
            sessionStorage.removeItem('easyshifts_session');
          }
        } catch (parseError) {
          logError('AuthProvider', 'Error parsing saved user data', parseError);
          localStorage.removeItem('easyshifts_user');
          sessionStorage.removeItem('easyshifts_session');
          setAuthError('Invalid saved authentication data');
        }
      } else {
        logDebug('AuthProvider', 'No saved authentication found');
      }
    } catch (error) {
      logError('AuthProvider', 'Error during authentication check', error);
      setAuthError('Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    return new Promise((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected to the server. Please try again later.'));
        return;
      }

      const request = {
        request_id: 10,
        data: { username, password },
      };

      const handleMessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          
          if (response.request_id === 10) {
            socket.removeEventListener('message', handleMessage);
            
            if (response.data && response.data.user_exists) {
              // Handle new secure session format
              const userData = {
                username,
                isManager: response.data.is_manager,
                isAdmin: response.data.is_admin,
                loginTime: new Date().toISOString(),
                // Store secure session data
                sessionId: response.data.session_id,
                csrfToken: response.data.csrf_token,
                userId: response.data.user_data?.user_id,
                email: response.data.user_data?.email
              };

              setUser(userData);
              setIsAuthenticated(true);

              // Persist to localStorage (excluding sensitive tokens for security)
              const persistData = {
                username: userData.username,
                isManager: userData.isManager,
                isAdmin: userData.isAdmin,
                loginTime: userData.loginTime,
                userId: userData.userId,
                email: userData.email
              };
              localStorage.setItem('easyshifts_user', JSON.stringify(persistData));

              // Store session data securely (could be moved to sessionStorage for better security)
              sessionStorage.setItem('easyshifts_session', JSON.stringify({
                sessionId: userData.sessionId,
                csrfToken: userData.csrfToken
              }));

              resolve(userData);
            } else {
              const errorMessage = response.data?.error || 'Invalid username or password';
              reject(new Error(errorMessage));
            }
          }
        } catch (error) {
          socket.removeEventListener('message', handleMessage);
          reject(new Error('Error processing login response'));
        }
      };

      socket.addEventListener('message', handleMessage);
      socket.send(JSON.stringify(request));

      // Timeout after 10 seconds
      setTimeout(() => {
        socket.removeEventListener('message', handleMessage);
        reject(new Error('Login request timed out'));
      }, 10000);
    });
  };

  const googleLogin = async (userData) => {
    try {
      logDebug('AuthContext', 'Starting Google login session creation', {
        username: userData.username,
        isManager: userData.isManager
      });

      // Create a proper session for Google users via WebSocket
      const socket = new WebSocket(WS_URL);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          socket.close();
          reject(new Error('Google session creation timed out'));
        }, 10000);

        socket.onopen = () => {
          logDebug('AuthContext', 'WebSocket connected for Google session creation');

          // Send a special Google login request to create session
          const request = {
            username: userData.username,
            isManager: userData.isManager,
            email: userData.email,
            googleId: userData.googleId,
            request_id: 69  // Use the correct request_id for Google session creation
          };

          socket.send(JSON.stringify(request));
        };

        socket.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.request_id === request.request_id) {
              clearTimeout(timeout);
              socket.close();

              if (response.success) {
                logDebug('AuthContext', 'Google session created successfully', response);

                // Store user data with session info
                const completeUserData = {
                  ...userData,
                  sessionId: response.sessionId,
                  csrfToken: response.csrfToken,
                  loginMethod: 'google'
                };

                setUser(completeUserData);
                setIsAuthenticated(true);
                setAuthError(null);

                // Persist user data
                const persistData = {
                  username: completeUserData.username,
                  isManager: completeUserData.isManager,
                  userId: completeUserData.userId,
                  email: completeUserData.email,
                  googleId: completeUserData.googleId,
                  loginMethod: 'google'
                };
                localStorage.setItem('easyshifts_user', JSON.stringify(persistData));

                // Store session data
                sessionStorage.setItem('easyshifts_session', JSON.stringify({
                  sessionId: response.sessionId,
                  csrfToken: response.csrfToken
                }));

                resolve(completeUserData);
              } else {
                const errorMessage = response.error || 'Failed to create Google session';
                logError('AuthContext', 'Google session creation failed', { error: errorMessage });
                reject(new Error(errorMessage));
              }
            }
          } catch (error) {
            clearTimeout(timeout);
            socket.close();
            logError('AuthContext', 'Error processing Google session response', error);
            reject(error);
          }
        };

        socket.onerror = (error) => {
          clearTimeout(timeout);
          logError('AuthContext', 'WebSocket error during Google session creation', error);
          reject(new Error('WebSocket connection failed'));
        };
      });

    } catch (error) {
      logError('AuthContext', 'Google login session creation failed', error);

      // Fallback: Set user without session (will need to handle this gracefully)
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError('Session creation failed, some features may be limited');

      // Store basic user data
      localStorage.setItem('easyshifts_user', JSON.stringify({
        ...userData,
        loginMethod: 'google',
        sessionFailed: true
      }));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('easyshifts_user');
    sessionStorage.removeItem('easyshifts_session');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    logout,
    isManager: user?.isManager || false,
    username: user?.username || ''
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
