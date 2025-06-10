import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useSocket } from '../utils';
// import './ManagerJobDashboard.css'; // CSS file to be created later

const ManagerJobDashboard = () => {
  const navigate = useNavigate(); // Add this line
  const { socket, connectionStatus, reconnect } = useSocket();
  const [clientCompanies, setClientCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for creating a new job
  const [newJobName, setNewJobName] = useState('');
  const [selectedClientCompany, setSelectedClientCompany] = useState('');
  const [newJobVenueName, setNewJobVenueName] = useState('');
  const [newJobVenueAddress, setNewJobVenueAddress] = useState('');
  const [newJobVenueContact, setNewJobVenueContact] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');

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

  const getConnectionStatusDisplay = () => {
    switch (connectionStatus) {
      case 'connecting':
        return { text: 'Connecting...', color: '#ffa500', showReconnect: false };
      case 'connected':
        return { text: 'Connected', color: '#28a745', showReconnect: false };
      case 'disconnected':
        return { text: 'Disconnected', color: '#dc3545', showReconnect: true };
      case 'reconnecting':
        return { text: 'Reconnecting...', color: '#ffa500', showReconnect: false };
      case 'failed':
        return { text: 'Connection Failed', color: '#dc3545', showReconnect: true };
      case 'error':
        return { text: 'Connection Error', color: '#dc3545', showReconnect: true };
      default:
        return { text: 'Unknown', color: '#6c757d', showReconnect: true };
    }
  };

  const isConnected = connectionStatus === 'connected';

  // Helper function to get company name by ID
  const getCompanyNameById = (companyId) => {
    const company = clientCompanies.find(c => c.id === companyId);
    return company ? company.name : `Unknown Company (ID: ${companyId})`;
  };

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
            setNewJobVenueName('');
            setNewJobVenueAddress('');
            setNewJobVenueContact('');
            setNewJobDescription('');
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
    if (!newJobName.trim() || !selectedClientCompany || !newJobVenueName.trim() || !newJobVenueAddress.trim()) {
      setError('Job name, client company, venue name, and venue address are required.');
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
          venue_name: newJobVenueName,
          venue_address: newJobVenueAddress,
          venue_contact_info: newJobVenueContact,
          description: newJobDescription,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h2>Job Management</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              color: getConnectionStatusDisplay().color,
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              ● {getConnectionStatusDisplay().text}
            </span>
            {getConnectionStatusDisplay().showReconnect && (
              <button
                onClick={reconnect}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/enhanced-schedule')}
          disabled={!isConnected}
          style={{
            padding: '12px 20px',
            backgroundColor: isConnected ? '#3498db' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
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
        <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
          Each job represents a specific project at a specific venue. All shifts for this job will be at the same location.
        </p>
        <form onSubmit={handleCreateJobSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="jobName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Name: *</label>
              <input
                type="text"
                id="jobName"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                placeholder="e.g., CRSSD Festival Setup"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label htmlFor="clientCompany" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Client Company: *</label>
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
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="venueName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Venue Name: *</label>
              <input
                type="text"
                id="venueName"
                value={newJobVenueName}
                onChange={(e) => setNewJobVenueName(e.target.value)}
                placeholder="e.g., Waterfront Park"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label htmlFor="venueContact" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Venue Contact:</label>
              <input
                type="text"
                id="venueContact"
                value={newJobVenueContact}
                onChange={(e) => setNewJobVenueContact(e.target.value)}
                placeholder="e.g., John Doe - (555) 123-4567"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="venueAddress" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Venue Address: *</label>
            <input
              type="text"
              id="venueAddress"
              value={newJobVenueAddress}
              onChange={(e) => setNewJobVenueAddress(e.target.value)}
              placeholder="e.g., 1600 Pacific Hwy, San Diego, CA 92101"
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="jobDescription" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Job Description:</label>
            <textarea
              id="jobDescription"
              value={newJobDescription}
              onChange={(e) => setNewJobDescription(e.target.value)}
              placeholder="e.g., Stage setup and teardown for 3-day music festival"
              rows="3"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !isConnected}
            style={{
              padding: '12px 24px',
              backgroundColor: (isLoading || !isConnected) ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || !isConnected) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Creating Job...' : 'Create Job'}
          </button>
        </form>
      </div>

      <h3>Existing Jobs</h3>
      {isLoading && jobs.length === 0 && <p>Loading jobs...</p>}
      {!isLoading && jobs.length === 0 && !error && <p>No jobs found. Create one above!</p>}
      {jobs.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {jobs.map((job) => (
            <li key={job.id} style={{ border: '1px solid #eee', padding: '20px', marginBottom: '15px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>{job.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', color: '#666' }}>
                    <div>
                      <strong>Job ID:</strong> {job.id}
                    </div>
                    <div>
                      <strong>Client:</strong> {getCompanyNameById(job.client_company_id)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/manager-jobs/${job.id}/shifts`, {
                    state: {
                      jobName: job.name,
                      clientCompanyId: job.client_company_id,
                      clientCompanyName: getCompanyNameById(job.client_company_id),
                      venueName: job.venue_name,
                      venueAddress: job.venue_address
                    }
                  })}
                  style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Manage Shifts
                </button>
              </div>

              {(job.venue_name || job.venue_address) && (
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#495057', fontSize: '14px', fontWeight: 'bold' }}>📍 Location</h5>
                  {job.venue_name && (
                    <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                      <strong>Venue:</strong> {job.venue_name}
                    </div>
                  )}
                  {job.venue_address && (
                    <div style={{ marginBottom: '5px', fontSize: '14px' }}>
                      <strong>Address:</strong> {job.venue_address}
                    </div>
                  )}
                  {job.venue_contact_info && (
                    <div style={{ fontSize: '14px' }}>
                      <strong>Contact:</strong> {job.venue_contact_info}
                    </div>
                  )}
                </div>
              )}

              {job.description && (
                <div style={{ marginBottom: '10px' }}>
                  <h5 style={{ margin: '0 0 5px 0', color: '#495057', fontSize: '14px', fontWeight: 'bold' }}>Description</h5>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{job.description}</p>
                </div>
              )}

              {(job.estimated_start_date || job.estimated_end_date) && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                  {job.estimated_start_date && (
                    <span style={{ marginRight: '15px' }}>
                      <strong>Est. Start:</strong> {new Date(job.estimated_start_date).toLocaleDateString()}
                    </span>
                  )}
                  {job.estimated_end_date && (
                    <span>
                      <strong>Est. End:</strong> {new Date(job.estimated_end_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerJobDashboard;
