import React, { useState, useEffect } from 'react';
import { useSocket } from '../utils';
import SchedulingSettings from './settings/SchedulingSettings';
import NotificationSettings from './settings/NotificationSettings';
import RequestWindowSettings from './settings/RequestWindowSettings';
import WorkerManagementSettings from './settings/WorkerManagementSettings';
import TimesheetSettings from './settings/TimesheetSettings';
import DisplaySettings from './settings/DisplaySettings';
import SecuritySettings from './settings/SecuritySettings';
import IntegrationSettings from './settings/IntegrationSettings';
import CustomFieldsSettings from './settings/CustomFieldsSettings';
import './EnhancedSettingsPage.css';

const EnhancedSettingsPage = () => {
  const socket = useSocket();
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('scheduling');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'scheduling', label: 'Scheduling', icon: '📅', description: 'Shift scheduling and timing preferences' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Email, SMS, and push notification settings' },
    { id: 'request-windows', label: 'Request Windows', icon: '⏰', description: 'When workers can request shifts' },
    { id: 'worker-management', label: 'Worker Management', icon: '👥', description: 'Auto-assignment and worker rules' },
    { id: 'timesheet', label: 'Timesheet & Payroll', icon: '💰', description: 'Time tracking and overtime settings' },
    { id: 'display', label: 'Display & UI', icon: '🎨', description: 'Interface appearance and preferences' },
    { id: 'security', label: 'Security', icon: '🔒', description: 'Access control and data retention' },
    { id: 'integrations', label: 'Integrations', icon: '🔗', description: 'External system connections' },
    { id: 'custom-fields', label: 'Custom Fields', icon: '📝', description: 'Custom data fields for shifts and workers' },
  ];

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      loadSettings();
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      const handleMessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.request_id === 995) { // Get all settings
          setIsLoading(false);
          if (response.success) {
            setSettings(response.data);
            setError('');
          } else {
            setError(response.error || 'Failed to load settings');
          }
        } else if ([996, 997, 998, 999, 1000, 1001].includes(response.request_id)) {
          // Update settings responses
          setIsSaving(false);
          if (response.success) {
            setSettings(response.data);
            setSuccessMessage('Settings updated successfully!');
            setHasUnsavedChanges(false);
            setTimeout(() => setSuccessMessage(''), 3000);
          } else {
            setError(response.error || 'Failed to update settings');
          }
        } else if (response.request_id === 1002) { // Reset to defaults
          setIsSaving(false);
          if (response.success) {
            setSettings(response.data);
            setSuccessMessage('Settings reset to defaults successfully!');
            setHasUnsavedChanges(false);
            setTimeout(() => setSuccessMessage(''), 3000);
          } else {
            setError(response.error || 'Failed to reset settings');
          }
        }
      };

      socket.addEventListener('message', handleMessage);
      return () => socket.removeEventListener('message', handleMessage);
    }
  }, [socket]);

  const loadSettings = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      setError('');
      const request = { request_id: 995 }; // Get all settings
      socket.send(JSON.stringify(request));
    }
  };

  const updateSettings = (category, data) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Connection lost. Please refresh the page.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    const requestIdMap = {
      'scheduling': 996,
      'notifications': 997,
      'request-windows': 998,
      'worker-management': 999,
      'timesheet': 1000,
      'display': 1001,
    };

    const request = {
      request_id: requestIdMap[category],
      data: data
    };

    socket.send(JSON.stringify(request));
  };

  const resetToDefaults = () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsSaving(true);
      setError('');
      const request = { request_id: 1002 }; // Reset to defaults
      socket.send(JSON.stringify(request));
    }
  };

  const handleTabChange = (tabId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
        return;
      }
      setHasUnsavedChanges(false);
    }
    setActiveTab(tabId);
    setError('');
    setSuccessMessage('');
  };

  const renderTabContent = () => {
    if (!settings) return null;

    const commonProps = {
      settings,
      onUpdate: updateSettings,
      onMarkUnsaved: () => setHasUnsavedChanges(true),
      isLoading: isSaving
    };

    switch (activeTab) {
      case 'scheduling':
        return <SchedulingSettings {...commonProps} />;
      case 'notifications':
        return <NotificationSettings {...commonProps} />;
      case 'request-windows':
        return <RequestWindowSettings {...commonProps} />;
      case 'worker-management':
        return <WorkerManagementSettings {...commonProps} />;
      case 'timesheet':
        return <TimesheetSettings {...commonProps} />;
      case 'display':
        return <DisplaySettings {...commonProps} />;
      case 'security':
        return <SecuritySettings {...commonProps} />;
      case 'integrations':
        return <IntegrationSettings {...commonProps} />;
      case 'custom-fields':
        return <CustomFieldsSettings {...commonProps} />;
      default:
        return <div>Select a settings category</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Workplace Settings</h1>
        <div className="settings-actions">
          {hasUnsavedChanges && (
            <span className="unsaved-indicator">● Unsaved changes</span>
          )}
          <button 
            onClick={resetToDefaults} 
            className="reset-button"
            disabled={isSaving}
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {successMessage}
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
                disabled={isSaving}
              >
                <span className="nav-icon">{tab.icon}</span>
                <div className="nav-content">
                  <span className="nav-label">{tab.label}</span>
                  <span className="nav-description">{tab.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsPage;
