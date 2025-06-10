import React, { useState, useEffect, useCallback } from 'react';
import { useSocket, logDebug, logError, logWarning, logInfo } from '../../utils';
import ClientCompanyCard from './ClientCompanyCard';
import ClientAnalytics from './ClientAnalytics';
import ClientSearch from './ClientSearch';
import './ClientDirectory.css';

const ClientDirectory = () => {
  logDebug('ClientDirectory', 'Component rendering/re-rendering');

  const { socket, connectionStatus, lastError, isConnected, hasError } = useSocket();
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
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchClientDirectory = useCallback(() => {
    try {
      logDebug('ClientDirectory', 'fetchClientDirectory called', {
        socketState: socket?.readyState,
        connectionStatus,
        retryCount
      });

      if (!socket) {
        const errorMsg = 'WebSocket not available';
        logError('ClientDirectory', errorMsg);
        setError(errorMsg);
        return;
      }

      if (socket.readyState !== WebSocket.OPEN) {
        const errorMsg = `WebSocket not connected (state: ${socket.readyState})`;
        logWarning('ClientDirectory', errorMsg);
        setError('Connection not ready. Please wait or try refreshing.');
        return;
      }

      setIsLoading(true);
      setError('');
      setLastFetchTime(new Date().toISOString());

      const request = { request_id: 212 }; // GET_CLIENT_DIRECTORY

      logDebug('ClientDirectory', 'Sending client directory request', request);
      socket.send(JSON.stringify(request));

      // Set a timeout for the request
      setTimeout(() => {
        if (isLoading) {
          logWarning('ClientDirectory', 'Request timeout - no response received');
          setIsLoading(false);
          setError('Request timed out. Please try again.');
        }
      }, 10000); // 10 second timeout

    } catch (error) {
      logError('ClientDirectory', 'Error in fetchClientDirectory', error);
      setIsLoading(false);
      setError(`Failed to fetch data: ${error.message}`);
    }
  }, [socket, connectionStatus, retryCount, isLoading]);

  const fetchClientAnalytics = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const request = { request_id: 215 }; // GET_CLIENT_ANALYTICS
      socket.send(JSON.stringify(request));
    }
  }, [socket]);

  // Filter and sort clients
  useEffect(() => {
    console.log('ClientDirectory: Filtering clients', {
      clientDirectory: clientDirectory.length,
      searchTerm,
      filterStatus,
      sortBy
    });

    let filtered = [...clientDirectory];
    console.log('ClientDirectory: Initial filtered count:', filtered.length);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.users.some(user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      console.log('ClientDirectory: After search filter:', filtered.length);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => {
        const hasActiveUsers = client.users && client.users.length > 0 && client.users.some(user => user.isActive);
        console.log('ClientDirectory: Status filter check for', client.name, '- hasActiveUsers:', hasActiveUsers, 'filterStatus:', filterStatus, 'users:', client.users ? client.users.length : 0);
        if (filterStatus === 'active') {
          return hasActiveUsers;
        } else if (filterStatus === 'inactive') {
          // Show companies with no users OR companies with only inactive users
          return !hasActiveUsers;
        }
        return true;
      });
      console.log('ClientDirectory: After status filter:', filtered.length);
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

    console.log('ClientDirectory: Final filtered count:', filtered.length);
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
        logDebug('ClientDirectory', 'Received WebSocket message', {
          dataSize: event.data.length,
          timestamp: new Date().toISOString()
        });

        const response = JSON.parse(event.data);
        setIsLoading(false);

        logDebug('ClientDirectory', 'Parsed WebSocket response', {
          request_id: response.request_id,
          success: response.success,
          hasData: !!response.data
        });

        if (response.request_id === 212) { // Client Directory
          if (response.success) {
            if (!response.data || !response.data.companies) {
              logError('ClientDirectory', 'Invalid response structure - missing companies data', response);
              setError('Invalid data received from server.');
              return;
            }

            logInfo('ClientDirectory', 'Successfully received client directory data', {
              companiesCount: response.data.companies.length,
              summaryData: response.data.summary
            });

            // Validate data structure
            const companies = response.data.companies;
            if (!Array.isArray(companies)) {
              logError('ClientDirectory', 'Companies data is not an array', { companies });
              setError('Invalid companies data format.');
              return;
            }

            // Log first company structure for debugging
            if (companies.length > 0) {
              logDebug('ClientDirectory', 'First company structure', companies[0]);
            }

            setClientDirectory(companies);
            setSummary(response.data.summary || {});
            setError('');
            setRetryCount(0); // Reset retry count on success

          } else {
            const errorMsg = response.error || 'Failed to fetch client directory.';
            logError('ClientDirectory', 'Server returned error for client directory request', {
              error: errorMsg,
              response
            });
            setError(errorMsg);
          }
        } else if (response.request_id === 215) { // Client Analytics
          if (response.success) {
            logInfo('ClientDirectory', 'Successfully received analytics data');
            setAnalytics(response.data);
          } else {
            logError('ClientDirectory', 'Failed to fetch analytics', response.error);
            // Don't set main error for analytics failure
          }
        } else {
          logDebug('ClientDirectory', 'Received message for different request_id', {
            request_id: response.request_id
          });
        }
      } catch (e) {
        logError('ClientDirectory', 'Error processing WebSocket message', {
          error: e.message,
          stack: e.stack,
          rawData: event.data.substring(0, 200) + '...'
        });
        setIsLoading(false);
        setError('Error processing server response. Please try again.');
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const handleRefresh = () => {
    logInfo('ClientDirectory', 'Manual refresh triggered by user');
    setRetryCount(prev => prev + 1);
    fetchClientDirectory();
    fetchClientAnalytics();
  };

  const handleRetry = () => {
    logInfo('ClientDirectory', 'Retry triggered by user', { retryCount });
    setRetryCount(prev => prev + 1);
    setError('');
    fetchClientDirectory();
  };

  // Auto-retry mechanism for failed requests
  useEffect(() => {
    if (error && retryCount < 3 && !isLoading) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      logInfo('ClientDirectory', `Auto-retry scheduled in ${retryDelay}ms`, { retryCount, error });

      const timeoutId = setTimeout(() => {
        logInfo('ClientDirectory', 'Executing auto-retry');
        handleRetry();
      }, retryDelay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, retryCount, isLoading]);

  // Connection status monitoring
  useEffect(() => {
    logDebug('ClientDirectory', 'Connection status changed', {
      connectionStatus,
      hasError,
      lastError
    });

    if (hasError && lastError) {
      setError(`Connection error: ${lastError}`);
    }
  }, [connectionStatus, hasError, lastError]);

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

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-details">
              <div className="error-text">{error}</div>
              {retryCount > 0 && (
                <div className="error-meta">
                  Attempt {retryCount + 1} • Last tried: {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Unknown'}
                </div>
              )}
            </div>
            <button onClick={handleRetry} className="retry-button" disabled={isLoading}>
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="connection-warning">
          <span className="warning-icon">🔌</span>
          Connection status: {connectionStatus}
          {connectionStatus === 'reconnecting' && <span className="loading-dots">...</span>}
        </div>
      )}

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
