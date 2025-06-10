import React, { useState, useEffect } from 'react';
import { useSocket } from '../utils';

const WebSocketTest = () => {
    const { socket, connectionStatus, reconnect } = useSocket();
    const [testMessage, setTestMessage] = useState('');
    const [responses, setResponses] = useState([]);

    useEffect(() => {
        if (socket) {
            const handleMessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    setResponses(prev => [...prev, {
                        timestamp: new Date().toLocaleTimeString(),
                        data: response
                    }]);
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e);
                }
            };

            socket.addEventListener('message', handleMessage);

            return () => {
                socket.removeEventListener('message', handleMessage);
            };
        }
    }, [socket]);

    const sendTestMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const testRequest = {
                request_id: 1, // LOGIN_REQUEST
                data: {
                    username: 'manager',
                    password: 'password'
                }
            };
            socket.send(JSON.stringify(testRequest));
            setTestMessage('Test login request sent');
        } else {
            setTestMessage('Cannot send: WebSocket is not connected');
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#28a745';
            case 'connecting': return '#ffc107';
            case 'reconnecting': return '#fd7e14';
            case 'disconnected': return '#dc3545';
            case 'error': return '#dc3545';
            case 'failed': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return '✅';
            case 'connecting': return '🔄';
            case 'reconnecting': return '🔄';
            case 'disconnected': return '⚠️';
            case 'error': return '❌';
            case 'failed': return '❌';
            default: return '❓';
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>WebSocket Connection Test</h2>
            
            <div style={{ 
                padding: '15px', 
                border: '2px solid', 
                borderColor: getStatusColor(),
                borderRadius: '8px',
                marginBottom: '20px',
                backgroundColor: `${getStatusColor()}15`
            }}>
                <h3>Connection Status: {getStatusIcon()} {connectionStatus}</h3>
                <p>Socket Ready State: {socket ? socket.readyState : 'No socket'}</p>
                <p>WebSocket States: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED</p>
                
                {connectionStatus !== 'connected' && (
                    <button 
                        onClick={reconnect}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Reconnect
                    </button>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button 
                    onClick={sendTestMessage}
                    disabled={!socket || socket.readyState !== WebSocket.OPEN}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: socket && socket.readyState === WebSocket.OPEN ? '#28a745' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: socket && socket.readyState === WebSocket.OPEN ? 'pointer' : 'not-allowed'
                    }}
                >
                    Send Test Message
                </button>
                {testMessage && (
                    <p style={{ marginTop: '10px', fontStyle: 'italic' }}>{testMessage}</p>
                )}
            </div>

            <div>
                <h3>Recent Responses ({responses.length})</h3>
                <div style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    border: '1px solid #ccc', 
                    padding: '10px',
                    backgroundColor: '#f8f9fa'
                }}>
                    {responses.length === 0 ? (
                        <p>No responses yet</p>
                    ) : (
                        responses.slice(-10).reverse().map((response, index) => (
                            <div key={index} style={{ 
                                marginBottom: '10px', 
                                padding: '8px', 
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                fontSize: '12px'
                            }}>
                                <strong>{response.timestamp}:</strong>
                                <pre style={{ margin: '5px 0', whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(response.data, null, 2)}
                                </pre>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WebSocketTest;
