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

          // Validate saved user data structure
          if (userData.username && typeof userData.isManager === 'boolean') {
            setUser(userData);
            setIsAuthenticated(true);
            setAuthError(null);
          } else {
            logWarning('AuthProvider', 'Invalid saved user data structure', userData);
            localStorage.removeItem('easyshifts_user');
          }
        } catch (parseError) {
          logError('AuthProvider', 'Error parsing saved user data', parseError);
          localStorage.removeItem('easyshifts_user');
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
              const userData = {
                username,
                isManager: response.data.is_manager,
                loginTime: new Date().toISOString()
              };
              
              setUser(userData);
              setIsAuthenticated(true);
              
              // Persist to localStorage
              localStorage.setItem('easyshifts_user', JSON.stringify(userData));
              
              resolve(userData);
            } else {
              reject(new Error('Invalid username or password'));
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

  const googleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Persist to localStorage
    localStorage.setItem('easyshifts_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('easyshifts_user');
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
