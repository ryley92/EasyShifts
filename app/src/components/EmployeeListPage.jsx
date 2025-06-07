import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useSocket } from '../utils';
import './../css/EmployeeListPage.css';

const EmployeeListPage = () => {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const socket = useSocket();

    const fetchEmployees = useCallback(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setError(''); // Clear previous errors
            setSuccessMessage(''); // Clear previous success messages
            const request = {
                request_id: 60, // FETCH_EMPLOYEES
            };
            socket.send(JSON.stringify(request));
        } else {
            console.error('WebSocket connection not open when trying to fetch employees.');
            setError('Cannot fetch employees: WebSocket is not connected.');
        }
    }, [socket]); // Dependency: socket

    const handleApprove = (userName) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setError('');
            setSuccessMessage('');
            const request = {
                request_id: 62, // APPROVE_EMPLOYEE
                data: { userName },
            };
            socket.send(JSON.stringify(request));
        } else {
            console.error('WebSocket connection not open when trying to approve employee.');
            setError('Cannot approve employee: WebSocket is not connected.');
        }
    };

    const handleReject = (userName) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            setError('');
            setSuccessMessage('');
            const request = {
                request_id: 64, // REJECT_EMPLOYEE
                data: { userName },
            };
            socket.send(JSON.stringify(request));
        } else {
            console.error('WebSocket connection not open when trying to reject employee.');
            setError('Cannot reject employee: WebSocket is not connected.');
        }
    };

    useEffect(() => {
        if (socket) {
            fetchEmployees(); // Initial fetch when socket is ready

            const handleMessage = (event) => {
                try {
                    const response = JSON.parse(event.data);

                    if (response.request_id === 60) { // Fetch employees response
                        if (response.success && Array.isArray(response.data)) {
                            setEmployees(response.data);
                        } else {
                            setError(response.error || 'Error fetching employees list.');
                            setEmployees([]); // Clear employees on error
                        }
                    } else if (response.request_id === 62) { // Approve employee response
                        if (response.success) {
                            setSuccessMessage(response.message || 'Employee approved successfully.');
                            fetchEmployees(); // Re-fetch the list
                        } else {
                            setError(response.error || 'Failed to approve employee.');
                        }
                    } else if (response.request_id === 64) { // Reject employee response
                        if (response.success) {
                            setSuccessMessage(response.message || 'Employee rejected successfully.');
                            fetchEmployees(); // Re-fetch the list
                        } else {
                            setError(response.error || 'Failed to reject employee.');
                        }
                    }
                } catch (e) {
                    console.error('Error parsing WebSocket message in EmployeeListPage:', e);
                    setError('Error processing server response.');
                }
            };

            socket.addEventListener('message', handleMessage);

            return () => {
                socket.removeEventListener('message', handleMessage);
            };
        }
    }, [socket, fetchEmployees]); // fetchEmployees is now a stable useCallback dependency

    return (
        <div className="employee-container">
            <h1 className="employee-title">Employee Management</h1>

            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

            <h2 className="section-title">Approved Employees</h2>
            {employees.filter(emp => emp.approved).length > 0 ? (
                <ul className="employee-list">
                    {employees.filter(employee => employee.approved).map(employee => (
                        <li key={employee.userName} className="employee-item approved">
                            {employee.name} ({employee.userName})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No approved employees.</p>
            )}

            <h2 className="section-title">Waiting for Approval</h2>
            {employees.filter(emp => !emp.approved).length > 0 ? (
                <ul className="employee-list">
                    {employees.filter(employee => !employee.approved).map(employee => (
                        <li key={employee.userName} className="employee-item">
                            <span>{employee.name} ({employee.userName})</span>
                            <div>
                                <button className="approve-button" onClick={() => handleApprove(employee.userName)}>
                                    Approve
                                </button>
                                <button className="reject-button" onClick={() => handleReject(employee.userName)}>
                                    Reject
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No employees awaiting approval.</p>
            )}
        </div>
    );
};

export default EmployeeListPage;
