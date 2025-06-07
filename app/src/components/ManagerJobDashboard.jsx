import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useSocket } from '../utils';
// import './ManagerJobDashboard.css'; // CSS file to be created later

const ManagerJobDashboard = () => {
  const navigate = useNavigate(); // Add this line
  const socket = useSocket();
  const [clientCompanies, setClientCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for creating a new job
  const [newJobName, setNewJobName] = useState('');
  const [selectedClientCompany, setSelectedClientCompany] = useState('');

  const fetchClientCompanies = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      const request = { request_id: 200 }; // GET_ALL_CLIENT_COMPANIES
      socket.send(JSON.stringify(request));
    }
  }, [socket]);

  const fetchManagerJobs = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      const request = { request_id: 211 }; // GET_JOBS_BY_MANAGER
      socket.send(JSON.stringify(request));
    }
  }, [socket]);

  useEffect(() => {
    // Initial data fetch
    fetchClientCompanies();
    fetchManagerJobs();
  }, [fetchClientCompanies, fetchManagerJobs]); // Dependencies for initial fetch

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        setIsLoading(false); // Stop loading once a response is processed

        if (response.request_id === 200) { // Get All Client Companies
          if (response.success && Array.isArray(response.data)) {
            setClientCompanies(response.data);
          } else {
            setError(response.error || 'Failed to fetch client companies.');
            setClientCompanies([]); // Ensure it's an array in case of error
          }
        } else if (response.request_id === 211) { // Get Jobs by Manager
          if (response.success && Array.isArray(response.data)) {
            setJobs(response.data);
          } else {
            setError(response.error || 'Failed to fetch jobs.');
            setJobs([]); // Ensure it's an array
          }
        } else if (response.request_id === 210) { // Create Job
          if (response.success && response.data) {
            setSuccessMessage(`Job "${response.data.name}" created successfully!`);
            setJobs(prevJobs => [...prevJobs, response.data]);
            setNewJobName('');
            setSelectedClientCompany('');
            setError('');
          } else {
            setSuccessMessage('');
            setError(response.error || 'Failed to create job.');
          }
        }
      } catch (e) {
        setIsLoading(false);
        setError('Error processing server response.');
        console.error('WebSocket message error:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]); // Re-run if socket instance changes

  const handleCreateJobSubmit = (e) => {
    e.preventDefault();
    if (!newJobName.trim() || !selectedClientCompany) {
      setError('Job name and client company are required.');
      return;
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      const request = {
        request_id: 210, // CREATE_JOB
        data: {
          name: newJobName,
          client_company_id: parseInt(selectedClientCompany, 10),
        },
      };
      socket.send(JSON.stringify(request));
    } else {
      setError('WebSocket is not connected. Please ensure the server is running and refresh.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Job Management</h2>
        <button
          onClick={() => navigate('/enhanced-schedule')}
          style={{
            padding: '12px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📅 Enhanced Schedule View
        </button>
      </div>

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green', border: '1px solid green', padding: '10px', borderRadius: '4px' }}>{successMessage}</p>}

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h3>Create New Job</h3>
        <form onSubmit={handleCreateJobSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="jobName" style={{ display: 'block', marginBottom: '5px' }}>Job Name:</label>
            <input
              type="text"
              id="jobName"
              value={newJobName}
              onChange={(e) => setNewJobName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="clientCompany" style={{ display: 'block', marginBottom: '5px' }}>Client Company:</label>
            <select
              id="clientCompany"
              value={selectedClientCompany}
              onChange={(e) => setSelectedClientCompany(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="">Select a Client Company</option>
              {clientCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} (ID: {company.id})
                </option>
              ))}
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isLoading} 
            style={{ padding: '10px 20px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Processing...' : 'Create Job'}
          </button>
        </form>
      </div>

      <h3>Existing Jobs</h3>
      {isLoading && jobs.length === 0 && <p>Loading jobs...</p>}
      {!isLoading && jobs.length === 0 && !error && <p>No jobs found. Create one above!</p>}
      {jobs.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {jobs.map((job) => (
            <li key={job.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
              <h4>{job.name} (Job ID: {job.id})</h4>
              <p>Client Company ID: {job.client_company_id}</p>
              <button 
                onClick={() => navigate(`/manager-jobs/${job.id}/shifts`, { state: { jobName: job.name, clientCompanyId: job.client_company_id } })}
                style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Manage Shifts
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerJobDashboard;
