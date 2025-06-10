import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../utils';
import ClientCompanyCard from './ClientCompanyCard';
import ClientAnalytics from './ClientAnalytics';
import ClientSearch from './ClientSearch';
import './ClientDirectory.css';

const ClientDirectory = () => {
  const socket = useSocket();
  const [clientDirectory, setClientDirectory] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [summary, setSummary] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'analytics'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'jobs', 'users', 'recent'

  const fetchClientDirectory = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      setError('');
      const request = { request_id: 210 }; // GET_CLIENT_DIRECTORY
      socket.send(JSON.stringify(request));
    } else {
      setError('Cannot fetch client directory: WebSocket is not connected.');
    }
  }, [socket]);

  const fetchClientAnalytics = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const request = { request_id: 213 }; // GET_CLIENT_ANALYTICS
      socket.send(JSON.stringify(request));
    }
  }, [socket]);

  // Filter and sort clients
  useEffect(() => {
    let filtered = [...clientDirectory];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.users.some(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => {
        const hasActiveUsers = client.users.some(user => user.isActive);
        return filterStatus === 'active' ? hasActiveUsers : !hasActiveUsers;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'jobs':
          return b.statistics.total_jobs - a.statistics.total_jobs;
        case 'users':
          return b.statistics.total_users - a.statistics.total_users;
        case 'recent':
          return b.statistics.recent_jobs_count - a.statistics.recent_jobs_count;
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  }, [clientDirectory, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    if (socket) {
      fetchClientDirectory();
      fetchClientAnalytics();
    }
  }, [socket, fetchClientDirectory, fetchClientAnalytics]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        setIsLoading(false);

        if (response.request_id === 210) { // Client Directory
          if (response.success) {
            setClientDirectory(response.data.companies);
            setSummary(response.data.summary);
          } else {
            setError(response.error || 'Failed to fetch client directory.');
          }
        } else if (response.request_id === 213) { // Client Analytics
          if (response.success) {
            setAnalytics(response.data);
          } else {
            console.error('Failed to fetch analytics:', response.error);
          }
        }
      } catch (e) {
        setIsLoading(false);
        setError('Error processing server response.');
        console.error('WebSocket message error in ClientDirectory:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const handleRefresh = () => {
    fetchClientDirectory();
    fetchClientAnalytics();
  };

  return (
    <div className="client-directory-container">
      <div className="client-directory-header">
        <div className="header-content">
          <h1>Client Directory</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{summary.total_companies || 0}</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{summary.total_client_users || 0}</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{summary.active_jobs || 0}</span>
              <span className="stat-label">Active Jobs</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-button" disabled={isLoading}>
            {isLoading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      <div className="client-directory-tabs">
        <button
          className={`tab-button ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => setActiveTab('directory')}
        >
          📋 Directory
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'directory' && (
        <div className="directory-content">
          <ClientSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading && <div className="loading-message">Loading client directory...</div>}

          {!isLoading && filteredClients.length === 0 && !error && (
            <div className="empty-state">
              <p>No clients found matching your criteria.</p>
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search-button">
                  Clear Search
                </button>
              )}
            </div>
          )}

          <div className="clients-grid">
            {filteredClients.map((client) => (
              <ClientCompanyCard
                key={client.id}
                client={client}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <ClientAnalytics analytics={analytics} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default ClientDirectory;
