import { useEffect, useState, useCallback, useRef } from "react";
import { ENV } from './utils/env';

let socket_obj = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

export function useSocket() {
    const [socket, setSocket] = useState(/** @type {WebSocket | null} */ (socket_obj));
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const reconnectTimeoutRef = useRef(null);

    const connectWebSocket = useCallback(() => {
        if (socket_obj && socket_obj.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        const wsUrl = ENV.API_URL;
        console.log('Connecting to WebSocket:', wsUrl);

        try {
            const newSocket = new WebSocket(wsUrl);

            newSocket.onopen = () => {
                console.log('WebSocket connection established successfully.');
                setConnectionStatus('connected');
                reconnectAttempts = 0; // Reset reconnect attempts on successful connection
                socket_obj = newSocket;
                setSocket(newSocket);
            };

            newSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
            };

            newSocket.onclose = (event) => {
                console.log('WebSocket connection closed:', event.code, event.reason);
                setConnectionStatus('disconnected');
                socket_obj = null;
                setSocket(null);

                // Attempt to reconnect if not manually closed
                if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    console.log(`Attempting to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
                    setConnectionStatus('reconnecting');

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectWebSocket();
                    }, RECONNECT_DELAY);
                } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                    console.error('Max reconnection attempts reached. Please refresh the page.');
                    setConnectionStatus('failed');
                }
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionStatus('error');
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
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectAttempts = 0;
        if (socket_obj) {
            socket_obj.close();
        }
        socket_obj = null;
        setSocket(null);
        connectWebSocket();
    }, [connectWebSocket]);

    return { socket, connectionStatus, reconnect };
}
