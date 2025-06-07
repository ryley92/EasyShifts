import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../utils';
// import './ManagerClientCompaniesPage.css'; // To be created later

const ManagerClientCompaniesPage = () => {
  const socket = useSocket();
  const [clientCompanies, setClientCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClientCompanies = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      setError('');
      const request = { request_id: 200 }; // GET_ALL_CLIENT_COMPANIES
      socket.send(JSON.stringify(request));
    } else {
      setError('Cannot fetch client companies: WebSocket is not connected.');
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      fetchClientCompanies();
    }
  }, [socket, fetchClientCompanies]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        setIsLoading(false);

        if (response.request_id === 200) { // Get All Client Companies
          if (response.success && Array.isArray(response.data)) {
            setClientCompanies(response.data);
          } else {
            setError(response.error || 'Failed to fetch client companies.');
            setClientCompanies([]);
          }
        }
      } catch (e) {
        setIsLoading(false);
        setError('Error processing server response for client companies.');
        console.error('WebSocket message error in ManagerClientCompaniesPage:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, fetchClientCompanies]); // Added fetchClientCompanies to ensure re-fetch if it changes, though it's stable with useCallback

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Client Companies Directory</h2>

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
      
      {isLoading && <p>Loading client companies...</p>}
      
      {!isLoading && clientCompanies.length === 0 && !error && <p>No client companies found.</p>}
      
      {clientCompanies.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {clientCompanies.map((company) => (
            <li key={company.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
              <h4>{company.name}</h4>
              <p>Client ID: {company.id}</p>
              {/* Future: Add link to view jobs for this client, or contact details etc. */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerClientCompaniesPage;
