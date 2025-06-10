import { useEffect, useState, useCallback, useRef } from "react";
import { ENV } from './utils/env';

// Debug logging utility
const DEBUG_ENABLED = true; // Set to false in production

export const logDebug = (component, message, data = null) => {
  if (DEBUG_ENABLED) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [DEBUG] [${component}] ${message}`;
    console.log(logMessage, data || '');
  }
};

export const logError = (component, message, error = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] [${component}] ${message}`;
  console.error(logMessage, error || '');

  // In production, you might want to send errors to a logging service
  if (!DEBUG_ENABLED && window.gtag) {
    window.gtag('event', 'exception', {
      description: `${component}: ${message}`,
      fatal: false
    });
  }
};

export const logWarning = (component, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [WARNING] [${component}] ${message}`;
  console.warn(logMessage, data || '');
};

export const logInfo = (component, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [INFO] [${component}] ${message}`;
  console.info(logMessage, data || '');
};

let socket_obj = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

export function useSocket() {
    const [socket, setSocket] = useState(/** @type {WebSocket | null} */ (socket_obj));
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [lastError, setLastError] = useState(null);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const reconnectTimeoutRef = useRef(null);

    const connectWebSocket = useCallback(() => {
        try {
            logDebug('useSocket', 'connectWebSocket called', {
                currentSocketState: socket_obj?.readyState,
                reconnectAttempts,
                connectionStatus
            });

            if (socket_obj && socket_obj.readyState === WebSocket.OPEN) {
                logDebug('useSocket', 'Socket already connected, skipping connection attempt');
                return; // Already connected
            }

            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                logError('useSocket', 'Maximum reconnection attempts reached', { attempts: reconnectAttempts });
                setConnectionStatus('failed');
                setLastError(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts`);
                return;
            }

            const wsUrl = ENV.API_URL;
            if (!wsUrl) {
                logError('useSocket', 'WebSocket URL is not configured');
                setConnectionStatus('error');
                setLastError('WebSocket URL not configured');
                return;
            }

            logDebug('useSocket', 'Attempting WebSocket connection', { url: wsUrl, attempt: reconnectAttempts + 1 });
            setConnectionAttempts(prev => prev + 1);

            const newSocket = new WebSocket(wsUrl);

            // Set up event handlers with comprehensive error handling
            newSocket.onopen = () => {
                logDebug('useSocket', 'WebSocket connection established successfully');
                setConnectionStatus('connected');
                setLastError(null);
                reconnectAttempts = 0; // Reset reconnect attempts on successful connection
                socket_obj = newSocket;
                setSocket(newSocket);
            };

            newSocket.onerror = (error) => {
                logError('useSocket', 'WebSocket error occurred', error);
                setConnectionStatus('error');
                setLastError('WebSocket connection error');
            };

            newSocket.onclose = (event) => {
                logDebug('useSocket', 'WebSocket connection closed', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });

                setConnectionStatus('disconnected');
                socket_obj = null;
                setSocket(null);

                // Attempt to reconnect if not manually closed
                if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    logDebug('useSocket', `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, {
                        delay: RECONNECT_DELAY
                    });
                    setConnectionStatus('reconnecting');

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, RECONNECT_DELAY);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    logError('useSocket', 'Maximum reconnection attempts reached');
                    setConnectionStatus('failed');
                    setLastError('Connection failed after maximum retry attempts');
                } else {
                    logDebug('useSocket', 'Clean connection close, not attempting reconnect');
                }
            };

        } catch (error) {
            logError('useSocket', 'Failed to create WebSocket connection', error);
            setConnectionStatus('error');
            setLastError(`Connection creation failed: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        if (!socket_obj) {
            connectWebSocket();
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connectWebSocket]);

    // Provide a manual reconnect function
    const reconnect = useCallback(() => {
        try {
            logDebug('useSocket', 'Manual reconnect triggered');

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectAttempts = 0;
            setConnectionAttempts(0);
            setLastError(null);

            if (socket_obj) {
                logDebug('useSocket', 'Closing existing socket for reconnect');
                socket_obj.close();
            }

            socket_obj = null;
            setSocket(null);
            setConnectionStatus('connecting');
            connectWebSocket();
        } catch (error) {
            logError('useSocket', 'Error during manual reconnect', error);
            setLastError(`Reconnect failed: ${error.message}`);
        }
    }, [connectWebSocket]);

    return {
        socket,
        connectionStatus,
        reconnect,
        lastError,
        connectionAttempts,
        isConnected: connectionStatus === 'connected',
        isConnecting: connectionStatus === 'connecting' || connectionStatus === 'reconnecting',
        hasError: connectionStatus === 'error' || connectionStatus === 'failed'
    };
}