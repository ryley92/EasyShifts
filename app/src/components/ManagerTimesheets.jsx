import React, { useState, useEffect } from 'react';
import { useSocket } from '../utils';
import '../css/ManagerTimesheets.css';

const ManagerTimesheets = () => {
  const socket = useSocket();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchTimesheets = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not available.');
      setLoading(false);
      return;
    }

    const request = {
      request_id: 103, // Request ID for fetching all submitted timesheets for manager
    };
    socket.send(JSON.stringify(request));
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.request_id === 103) {
          if (response.success && response.data) {
            setTimesheets(response.data);
          } else {
            setError(response.error || 'Failed to fetch timesheets.');
          }
          setLoading(false);
        } else if (response.request_id === 104) {
          if (response.success) {
            setSuccessMessage(response.message || 'Timesheet status updated successfully!');
            // Re-fetch timesheets to reflect the updated status
            fetchTimesheets();
          } else {
            setError(response.error || 'Failed to update timesheet status.');
          }
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
        setError('Error processing response from server.');
        setLoading(false);
      }
    };

    socket.addEventListener('message', handleMessage);

    fetchTimesheets(); // Initial fetch

    return () => {
      if (socket && typeof socket.removeEventListener === 'function') {
        socket.removeEventListener('message', handleMessage);
      }
    };
  }, [socket]);

  const handleApproveReject = (timesheet, isApproved) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('WebSocket connection not available.');
      return;
    }

    const request = {
      request_id: 104, // Request ID for updating timesheet status
      data: {
        shift_id: timesheet.shift_id,
        user_id: timesheet.user_id,
        role_assigned: timesheet.role_assigned,
        is_approved: isApproved,
      },
    };
    socket.send(JSON.stringify(request));
  };

  if (loading) {
    return <div className="manager-timesheets-loading">Loading timesheets...</div>;
  }

  if (error) {
    return <div className="manager-timesheets-error">Error: {error}</div>;
  }

  return (
    <div className="manager-timesheets-container">
      <h2>Employee Timesheets</h2>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {timesheets.length === 0 ? (
        <p>No timesheets submitted yet.</p>
      ) : (
        <table className="timesheets-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
              <th>Shift Date</th>
              <th>Shift Part</th>
              <th>Job Name</th>
              <th>Client Company</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Submitted At</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((ts) => (
              <tr key={`${ts.shift_id}-${ts.user_id}-${ts.role_assigned}`}>
                <td>{ts.employee_name}</td>
                <td>{ts.role_assigned}</td>
                <td>{new Date(ts.shift_date).toLocaleDateString()}</td>
                <td>{ts.shift_part}</td>
                <td>{ts.job_name}</td>
                <td>{ts.client_company_name}</td>
                <td>{ts.clock_in_time ? new Date(ts.clock_in_time).toLocaleString() : 'N/A'}</td>
                <td>{ts.clock_out_time ? new Date(ts.clock_out_time).toLocaleString() : 'N/A'}</td>
                <td>{ts.times_submitted_at ? new Date(ts.times_submitted_at).toLocaleString() : 'N/A'}</td>
                <td>{ts.is_approved ? 'Approved' : 'Pending'}</td>
                <td>
                  {!ts.is_approved && (
                    <button onClick={() => handleApproveReject(ts, true)} className="approve-button">Approve</button>
                  )}
                  {ts.is_approved && (
                    <button onClick={() => handleApproveReject(ts, false)} className="reject-button">Reject</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagerTimesheets;
