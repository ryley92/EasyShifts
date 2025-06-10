import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const GoogleIntegrationSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // OAuth Configuration
    google_oauth_enabled: true,
    google_client_id: '',
    google_client_secret: '',
    oauth_redirect_uri: 'https://easyshifts.app/auth/google/callback',
    
    // Calendar Integration
    google_calendar_sync_enabled: false,
    calendar_sync_direction: 'both', // 'to_google', 'from_google', 'both'
    default_calendar_name: 'EasyShifts Work Schedule',
    sync_shift_assignments: true,
    sync_shift_requests: false,
    sync_timesheet_deadlines: true,
    
    // Gmail Integration
    gmail_notifications_enabled: false,
    gmail_send_from_address: 'noreply@handsonlabor.com',
    gmail_template_style: 'professional',
    include_company_branding: true,
    
    // Google Drive Integration
    google_drive_enabled: false,
    drive_folder_structure: 'by_date', // 'by_date', 'by_client', 'by_job'
    auto_backup_timesheets: false,
    auto_backup_schedules: false,
    backup_frequency: 'weekly',
    
    // Google Maps Integration
    google_maps_enabled: true,
    maps_api_key: '',
    show_job_locations_on_map: true,
    calculate_travel_distances: true,
    optimize_route_planning: false,
    
    // Google Workspace Integration
    workspace_domain: '',
    restrict_to_workspace_domain: false,
    auto_create_workspace_users: false,
    sync_workspace_contacts: false,
    
    // Authentication Settings
    allow_google_signup: true,
    require_email_verification: true,
    auto_link_existing_accounts: true,
    google_profile_photo_sync: true,
    
    // Data Sync Settings
    sync_frequency_minutes: 15,
    sync_during_business_hours_only: false,
    business_hours_start: '06:00',
    business_hours_end: '22:00',
    
    // Privacy & Security
    store_google_tokens_encrypted: true,
    token_refresh_threshold_days: 7,
    revoke_tokens_on_deactivation: true,
    audit_google_api_calls: true,
    
    // Error Handling
    retry_failed_syncs: true,
    max_retry_attempts: 3,
    sync_error_notifications: true,
    fallback_to_manual_entry: true,
  });

  const [syncStatus, setSyncStatus] = useState({
    last_sync: null,
    sync_in_progress: false,
    sync_errors: [],
    total_synced_events: 0,
    failed_sync_count: 0
  });

  useEffect(() => {
    if (settings?.google_integration) {
      setFormData(prev => ({
        ...prev,
        ...settings.google_integration
      }));
      if (settings.google_integration.sync_status) {
        setSyncStatus(settings.google_integration.sync_status);
      }
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    onMarkUnsaved();
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    onMarkUnsaved();
  };

  const handleTestConnection = () => {
    // This would trigger a test of the Google API connection
    console.log('Testing Google API connection...');
  };

  const handleManualSync = () => {
    // This would trigger a manual sync with Google services
    console.log('Starting manual sync...');
  };

  const handleSave = () => {
    onUpdate('google-integration', formData);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Google Integration Settings</h2>
        <p>Configure Google OAuth, Calendar sync, Gmail notifications, and other Google services integration.</p>
      </div>

      {/* OAuth Configuration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔐</span>
          <h3 className="settings-card-title">Google OAuth Configuration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Google OAuth</div>
                <div className="toggle-description">Allow users to sign in with their Google accounts</div>
              </div>
              <ToggleSwitch
                checked={formData.google_oauth_enabled}
                onChange={() => handleToggle('google_oauth_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Google Client ID</label>
            <input
              type="text"
              className="form-input"
              value={formData.google_client_id}
              onChange={(e) => handleInputChange('google_client_id', e.target.value)}
              placeholder="Your Google OAuth Client ID"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Google Client Secret</label>
            <input
              type="password"
              className="form-input"
              value={formData.google_client_secret}
              onChange={(e) => handleInputChange('google_client_secret', e.target.value)}
              placeholder="Your Google OAuth Client Secret"
            />
          </div>
          <div className="form-group">
            <label className="form-label">OAuth Redirect URI</label>
            <input
              type="url"
              className="form-input"
              value={formData.oauth_redirect_uri}
              onChange={(e) => handleInputChange('oauth_redirect_uri', e.target.value)}
              placeholder="https://yourapp.com/auth/google/callback"
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Google Signup</div>
                <div className="toggle-description">New users can create accounts using Google</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_google_signup}
                onChange={() => handleToggle('allow_google_signup')}
              />
            </div>
          </div>
        </div>
        <div className="settings-actions">
          <button 
            onClick={handleTestConnection} 
            className="btn btn-secondary"
            disabled={!formData.google_client_id || !formData.google_client_secret}
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Calendar Integration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📅</span>
          <h3 className="settings-card-title">Google Calendar Integration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Calendar Sync</div>
                <div className="toggle-description">Sync shifts and schedules with Google Calendar</div>
              </div>
              <ToggleSwitch
                checked={formData.google_calendar_sync_enabled}
                onChange={() => handleToggle('google_calendar_sync_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Sync Direction</label>
            <select
              className="form-select"
              value={formData.calendar_sync_direction}
              onChange={(e) => handleInputChange('calendar_sync_direction', e.target.value)}
              disabled={!formData.google_calendar_sync_enabled}
            >
              <option value="to_google">EasyShifts → Google Calendar</option>
              <option value="from_google">Google Calendar → EasyShifts</option>
              <option value="both">Bidirectional Sync</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default Calendar Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.default_calendar_name}
              onChange={(e) => handleInputChange('default_calendar_name', e.target.value)}
              disabled={!formData.google_calendar_sync_enabled}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Sync Shift Assignments</div>
                <div className="toggle-description">Add assigned shifts to employee calendars</div>
              </div>
              <ToggleSwitch
                checked={formData.sync_shift_assignments}
                onChange={() => handleToggle('sync_shift_assignments')}
                disabled={!formData.google_calendar_sync_enabled}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Sync Timesheet Deadlines</div>
                <div className="toggle-description">Add timesheet submission deadlines to calendars</div>
              </div>
              <ToggleSwitch
                checked={formData.sync_timesheet_deadlines}
                onChange={() => handleToggle('sync_timesheet_deadlines')}
                disabled={!formData.google_calendar_sync_enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gmail Integration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📧</span>
          <h3 className="settings-card-title">Gmail Integration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Gmail Notifications</div>
                <div className="toggle-description">Send notifications through Gmail API</div>
              </div>
              <ToggleSwitch
                checked={formData.gmail_notifications_enabled}
                onChange={() => handleToggle('gmail_notifications_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Send From Address</label>
            <input
              type="email"
              className="form-input"
              value={formData.gmail_send_from_address}
              onChange={(e) => handleInputChange('gmail_send_from_address', e.target.value)}
              disabled={!formData.gmail_notifications_enabled}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Template Style</label>
            <select
              className="form-select"
              value={formData.gmail_template_style}
              onChange={(e) => handleInputChange('gmail_template_style', e.target.value)}
              disabled={!formData.gmail_notifications_enabled}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="branded">Branded</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Include Company Branding</div>
                <div className="toggle-description">Add company logo and colors to emails</div>
              </div>
              <ToggleSwitch
                checked={formData.include_company_branding}
                onChange={() => handleToggle('include_company_branding')}
                disabled={!formData.gmail_notifications_enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Integration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">💾</span>
          <h3 className="settings-card-title">Google Drive Integration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Google Drive</div>
                <div className="toggle-description">Backup data to Google Drive</div>
              </div>
              <ToggleSwitch
                checked={formData.google_drive_enabled}
                onChange={() => handleToggle('google_drive_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Folder Structure</label>
            <select
              className="form-select"
              value={formData.drive_folder_structure}
              onChange={(e) => handleInputChange('drive_folder_structure', e.target.value)}
              disabled={!formData.google_drive_enabled}
            >
              <option value="by_date">Organize by Date</option>
              <option value="by_client">Organize by Client</option>
              <option value="by_job">Organize by Job</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Backup Timesheets</div>
                <div className="toggle-description">Automatically backup timesheet data</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_backup_timesheets}
                onChange={() => handleToggle('auto_backup_timesheets')}
                disabled={!formData.google_drive_enabled}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Backup Frequency</label>
            <select
              className="form-select"
              value={formData.backup_frequency}
              onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
              disabled={!formData.google_drive_enabled}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Google Maps Integration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🗺️</span>
          <h3 className="settings-card-title">Google Maps Integration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Google Maps</div>
                <div className="toggle-description">Use Google Maps for location services</div>
              </div>
              <ToggleSwitch
                checked={formData.google_maps_enabled}
                onChange={() => handleToggle('google_maps_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Maps API Key</label>
            <input
              type="password"
              className="form-input"
              value={formData.maps_api_key}
              onChange={(e) => handleInputChange('maps_api_key', e.target.value)}
              placeholder="Your Google Maps API Key"
              disabled={!formData.google_maps_enabled}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Show Job Locations on Map</div>
                <div className="toggle-description">Display job locations on interactive maps</div>
              </div>
              <ToggleSwitch
                checked={formData.show_job_locations_on_map}
                onChange={() => handleToggle('show_job_locations_on_map')}
                disabled={!formData.google_maps_enabled}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Calculate Travel Distances</div>
                <div className="toggle-description">Calculate travel time and distance to job sites</div>
              </div>
              <ToggleSwitch
                checked={formData.calculate_travel_distances}
                onChange={() => handleToggle('calculate_travel_distances')}
                disabled={!formData.google_maps_enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sync Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔄</span>
          <h3 className="settings-card-title">Data Sync Settings</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Sync Frequency (Minutes)</label>
            <select
              className="form-select"
              value={formData.sync_frequency_minutes}
              onChange={(e) => handleInputChange('sync_frequency_minutes', parseInt(e.target.value))}
            >
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Sync During Business Hours Only</div>
                <div className="toggle-description">Limit syncing to business hours</div>
              </div>
              <ToggleSwitch
                checked={formData.sync_during_business_hours_only}
                onChange={() => handleToggle('sync_during_business_hours_only')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Business Hours Start</label>
            <input
              type="time"
              className="form-input"
              value={formData.business_hours_start}
              onChange={(e) => handleInputChange('business_hours_start', e.target.value)}
              disabled={!formData.sync_during_business_hours_only}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Business Hours End</label>
            <input
              type="time"
              className="form-input"
              value={formData.business_hours_end}
              onChange={(e) => handleInputChange('business_hours_end', e.target.value)}
              disabled={!formData.sync_during_business_hours_only}
            />
          </div>
        </div>
        <div className="sync-status">
          <h4>Sync Status</h4>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Last Sync:</span>
              <span className="status-value">{syncStatus.last_sync || 'Never'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Total Events Synced:</span>
              <span className="status-value">{syncStatus.total_synced_events}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Failed Syncs:</span>
              <span className="status-value">{syncStatus.failed_sync_count}</span>
            </div>
          </div>
          <button 
            onClick={handleManualSync} 
            className="btn btn-secondary"
            disabled={syncStatus.sync_in_progress}
          >
            {syncStatus.sync_in_progress ? 'Syncing...' : 'Manual Sync'}
          </button>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          onClick={handleSave} 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Google Integration Settings'}
        </button>
      </div>
    </div>
  );
};

export default GoogleIntegrationSettings;
