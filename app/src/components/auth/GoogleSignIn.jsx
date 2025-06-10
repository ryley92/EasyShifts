import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { useGoogleAuth } from '../../contexts/GoogleAuthContext';
import { useSocket } from '../../utils';
import './GoogleSignIn.css';

const GoogleSignIn = ({ onSuccess, onError, buttonText = "Continue with Google" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { googleLogin } = useAuth();
  const { isConfigured } = useGoogleAuth();
  const socket = useSocket();

  // Don't render if Google OAuth is not configured
  if (!isConfigured) {
    return (
      <div className="google-signin-container">
        <div className="google-signin-disabled">
          <div className="config-notice">
            <span className="config-icon">⚙️</span>
            <div className="config-text">
              <strong>Google Sign-In Setup Required</strong>
              <p>To enable Google signup, please:</p>
              <ol style={{textAlign: 'left', fontSize: '12px', marginTop: '8px'}}>
                <li>Add <code>http://localhost:3000</code> to authorized origins in Google Cloud Console</li>
                <li>Verify the Google Client ID is correctly configured</li>
                <li>Check the troubleshooting guide for detailed steps</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    
    try {
      // Send Google credential to backend for verification
      if (socket && socket.readyState === WebSocket.OPEN) {
        const request = {
          request_id: 66, // GOOGLE_AUTH_LOGIN
          data: {
            credential: credentialResponse.credential,
            clientId: credentialResponse.clientId
          }
        };

        // Set up message listener for Google auth response
        const handleMessage = (event) => {
          try {
            const response = JSON.parse(event.data);

            if (response.request_id === 66) {
              socket.removeEventListener('message', handleMessage);

              if (response.success && response.data) {
                // If user exists, log them in
                if (response.data.user_exists) {
                  const userData = {
                    username: response.data.username,
                    isManager: response.data.is_manager,
                    loginTime: new Date().toISOString(),
                    googleLinked: true,
                    email: response.data.email
                  };

                  // Update auth context
                  googleLogin(userData);

                  if (onSuccess) {
                    onSuccess(userData);
                  }
                } else {
                  // User doesn't exist, check if this is signup or login context
                  if (buttonText === "signup_with") {
                    // This is a signup flow, redirect to signup completion
                    if (onSuccess) {
                      onSuccess({
                        needsSignup: true,
                        googleData: response.data.google_user_info
                      });
                    }
                  } else {
                    // This is a login flow, redirect to account linking
                    if (onSuccess) {
                      onSuccess({
                        needsLinking: true,
                        googleData: response.data.google_user_info
                      });
                    }
                  }
                }
              } else {
                throw new Error(response.error || 'Google authentication failed');
              }
            } else if (response.error && response.error.includes('Unknown request ID: 66')) {
              // Backend doesn't support Google OAuth yet
              socket.removeEventListener('message', handleMessage);
              if (onError) {
                onError('Google Sign-In requires backend support. Please contact your administrator to enable Google OAuth.');
              }
            }
          } catch (error) {
            socket.removeEventListener('message', handleMessage);
            console.error('Google auth error:', error);

            // Check if it's a backend support issue
            if (error.message && error.message.includes('Unknown request ID')) {
              if (onError) {
                onError('Google Sign-In requires backend support. Please contact your administrator to enable Google OAuth.');
              }
            } else {
              if (onError) {
                onError(error.message || 'Authentication failed');
              }
            }
          } finally {
            setIsLoading(false);
          }
        };

        socket.addEventListener('message', handleMessage);
        socket.send(JSON.stringify(request));

        // Timeout after 10 seconds
        setTimeout(() => {
          socket.removeEventListener('message', handleMessage);
          setIsLoading(false);
          if (onError) {
            onError('Authentication request timed out');
          }
        }, 10000);

      } else {
        throw new Error('Not connected to server');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Google sign-in error:', error);
      if (onError) {
        onError(error.message || 'Authentication failed');
      }
    }
  };

  const handleGoogleError = (error) => {
    setIsLoading(false);
    console.error('Google OAuth Error:', error);

    let errorMessage = 'Google sign-in failed';

    if (error && error.error) {
      switch (error.error) {
        case 'popup_blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
          break;
        case 'access_denied':
          errorMessage = 'Access denied. Please try again.';
          break;
        case 'popup_closed_by_user':
          errorMessage = 'Sign-in was cancelled.';
          break;
        default:
          errorMessage = `Google sign-in error: ${error.error}`;
      }
    }

    if (onError) {
      onError(errorMessage);
    }
  };

  return (
    <div className="google-signin-container">
      {isLoading ? (
        <div className="google-signin-loading">
          <div className="loading-spinner"></div>
          <span>Authenticating with Google...</span>
        </div>
      ) : (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text={buttonText}
          theme="outline"
          size="large"
          width={400}
          shape="rectangular"
        />
      )}
    </div>
  );
};

export default GoogleSignIn;
