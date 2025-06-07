import React, { useState, useEffect, useCallback } from "react"; // Added useEffect, useCallback
import SettingsForm from "./SettingsForm";
import "../css/ManagerSetting.css";
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import { useSocket } from "../utils";

export default function ManagerSettings() {
    const socket = useSocket();

    // State for Schedule Window
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [isLoadingWindow, setIsLoadingWindow] = useState(false);
    const [windowSuccessMessage, setWindowSuccessMessage] = useState('');
    const [windowErrorMessage, setWindowErrorMessage] = useState('');

    const fetchRequestWindowTimes = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setIsLoadingWindow(true);
            setWindowErrorMessage('');
            setWindowSuccessMessage('');
            const request = { request_id: 42 }; // GET_REQUEST_WINDOW_TIMES
            socket.send(JSON.stringify(request));
        } else {
            setWindowErrorMessage("WebSocket is not connected. Cannot fetch window times.");
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            fetchRequestWindowTimes();
        }
    }, [socket, fetchRequestWindowTimes]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                if (response.request_id === 42) { // Response for GET_REQUEST_WINDOW_TIMES
                    setIsLoadingWindow(false);
                    if (response.success && response.data) {
                        if (response.data.requests_window_start) {
                            setStartTime(new Date(response.data.requests_window_start));
                        }
                        if (response.data.requests_window_end) {
                            setEndTime(new Date(response.data.requests_window_end));
                        }
                    } else {
                        setWindowErrorMessage(response.error || "Failed to fetch request window times.");
                    }
                } else if (response.request_id === 992) { // Response for SAVE_SCHEDULE_WINDOW
                    setIsLoadingWindow(false);
                    if (response.success) {
                        setWindowSuccessMessage(response.message || "Schedule window saved successfully!");
                        setWindowErrorMessage('');
                        // Optionally re-fetch to confirm, though backend should be source of truth
                        // fetchRequestWindowTimes(); 
                    } else {
                        setWindowErrorMessage(response.error || "Failed to save schedule window.");
                        setWindowSuccessMessage('');
                    }
                }
            } catch (e) {
                setIsLoadingWindow(false);
                setWindowErrorMessage("Error processing server response for schedule window.");
                console.error('WebSocket message error in ManagerSettings (Schedule Window):', e);
            }
        };

        socket.addEventListener('message', handleMessage);
        return () => {
            socket.removeEventListener('message', handleMessage);
        };
    }, [socket, fetchRequestWindowTimes]); // Added fetchRequestWindowTimes

    function handleWindowSubmit(event) {
        event.preventDefault();
        setWindowSuccessMessage('');
        setWindowErrorMessage('');

        if (!(startTime instanceof Date && !isNaN(startTime)) || !(endTime instanceof Date && !isNaN(endTime))) {
            setWindowErrorMessage("Invalid date selected for start or end time.");
            return;
        }

        if (endTime <= startTime) {
            setWindowErrorMessage("End time must be after start time.");
            return;
        }

        if (socket && socket.readyState === WebSocket.OPEN) {
            setIsLoadingWindow(true);
            const request = {
                request_id: 992, // SAVE_SCHEDULE_WINDOW
                data: {
                    requests_window_start: startTime.toISOString(),
                    requests_window_end: endTime.toISOString(),
                },
            };
            socket.send(JSON.stringify(request));
            console.log("Sent schedule window to server: ", request);
        } else {
            setWindowErrorMessage("Socket not connected. Cannot save schedule window.");
            console.error("Socket is not open");
        }
    }

    return (
        <div>
            <div className="setting-box">
                <div className="title-box">Preferences</div>
                <div className="selects-container">
                    <SettingsForm /> {/* Removed className, handled in SettingsForm itself */}
                </div>
            </div>

            <div className="setting-box" style={{ marginTop: '20px' }}> {/* Added margin for separation */}
                <div className="container"> {/* Ensure this class is defined or use a more descriptive one */}
                    <div className="title-box">Schedule Request Window</div>
                    {windowSuccessMessage && <p style={{ color: 'green', textAlign: 'center' }}>{windowSuccessMessage}</p>}
                    {windowErrorMessage && <p style={{ color: 'red', textAlign: 'center' }}>Error: {windowErrorMessage}</p>}
                    {isLoadingWindow && <p style={{textAlign: 'center'}}>Loading/Saving window times...</p>}
                    
                    <form onSubmit={handleWindowSubmit} style={{padding: '0 20px 20px 20px'}}>
                        <label htmlFor="startTime" style={{ fontWeight: 'bold', color: "GrayText", textAlign: 'left', display: 'block', marginBottom: '5px' }}>Start Time:</label>
                        <DateTime
                            inputId="startTime"
                            inputProps={{ className: "datetime" }}
                            value={startTime}
                            onChange={date => setStartTime(date instanceof Date || typeof date === 'string' ? new Date(date) : new Date())}
                        />

                        <label htmlFor="endTime" style={{ fontWeight: 'bold', color: "GrayText", textAlign: 'left', display: 'block', marginTop: '15px', marginBottom: '5px' }}>End Time:</label>
                        <DateTime
                            inputId="endTime"
                            inputProps={{ className: "datetime" }}
                            value={endTime}
                            onChange={date => setEndTime(date instanceof Date || typeof date === 'string' ? new Date(date) : new Date())}
                        />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', padding: '10px 15px' }} disabled={isLoadingWindow}>
                            {isLoadingWindow ? 'Saving...' : 'Save Window Times'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
