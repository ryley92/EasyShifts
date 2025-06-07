import React, { useState, useEffect } from 'react';

const NotificationSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    email_notifications_enabled: true,
    notify_on_shift_requests: true,
    notify_on_worker_assignments: true,
    notify_on_timesheet_submissions: true,
    notify_on_schedule_changes: true,
    sms_notifications_enabled: false,
    sms_urgent_only: true,
    push_notifications_enabled: true,
    notification_sound_enabled: true,
  });

  const notificationTypes = [
    {
      key: 'notify_on_shift_requests',
      title: 'Shift Requests',
      description: 'When workers request shifts or make changes to requests',
      icon: '📋'
    },
    {
      key: 'notify_on_worker_assignments',
      title: 'Worker Assignments',
      description: 'When workers are assigned or unassigned from shifts',
      icon: '👥'
    },
    {
      key: 'notify_on_timesheet_submissions',
      title: 'Timesheet Submissions',
      description: 'When workers submit timesheets for approval',
      icon: '⏰'
    },
    {
      key: 'notify_on_schedule_changes',
      title: 'Schedule Changes',
      description: 'When shifts are created, modified, or cancelled',
      icon: '📅'
    }
  ];

  useEffect(() => {
    if (settings?.notifications) {
      setFormData({
        email_notifications_enabled: settings.notifications.email_enabled ?? true,
        notify_on_shift_requests: settings.notifications.notify_shift_requests ?? true,
        notify_on_worker_assignments: settings.notifications.notify_worker_assignments ?? true,
        notify_on_timesheet_submissions: settings.notifications.notify_timesheet_submissions ?? true,
        notify_on_schedule_changes: settings.notifications.notify_schedule_changes ?? true,
        sms_notifications_enabled: settings.notifications.sms_enabled ?? false,
        sms_urgent_only: settings.notifications.sms_urgent_only ?? true,
        push_notifications_enabled: settings.notifications.push_enabled ?? true,
        notification_sound_enabled: settings.notifications.notification_sound ?? true,
      });
    }
  }, [settings]);

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    onMarkUnsaved();
  };

  const handleSave = () => {
    onUpdate('notifications', formData);
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="toggle-slider"></span>
    </label>
  );

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Notification Settings</h2>
        <p className="section-description">
          Configure how and when you receive notifications about workplace activities.
        </p>
      </div>

      {/* Main notification channels */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📧</span>
          <h3 className="settings-card-title">Email Notifications</h3>
        </div>
        <p className="settings-card-description">
          Receive notifications via email. Email notifications provide detailed information and are recommended for important updates.
        </p>
        <div className="notification-type">
          <div className="notification-info">
            <div className="notification-title">Enable Email Notifications</div>
            <div className="notification-description">
              Turn on/off all email notifications
            </div>
          </div>
          <ToggleSwitch
            checked={formData.email_notifications_enabled}
            onChange={() => handleToggle('email_notifications_enabled')}
          />
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📱</span>
          <h3 className="settings-card-title">SMS Notifications</h3>
        </div>
        <p className="settings-card-description">
          Receive text message notifications for urgent updates. SMS notifications are brief and immediate.
        </p>
        <div className="notification-type">
          <div className="notification-info">
            <div className="notification-title">Enable SMS Notifications</div>
            <div className="notification-description">
              Turn on/off SMS text message notifications
            </div>
          </div>
          <ToggleSwitch
            checked={formData.sms_notifications_enabled}
            onChange={() => handleToggle('sms_notifications_enabled')}
          />
        </div>
        {formData.sms_notifications_enabled && (
          <div className="notification-type" style={{ marginTop: '10px' }}>
            <div className="notification-info">
              <div className="notification-title">Urgent Only</div>
              <div className="notification-description">
                Only send SMS for urgent notifications (recommended)
              </div>
            </div>
            <ToggleSwitch
              checked={formData.sms_urgent_only}
              onChange={() => handleToggle('sms_urgent_only')}
            />
          </div>
        )}
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔔</span>
          <h3 className="settings-card-title">Push Notifications</h3>
        </div>
        <p className="settings-card-description">
          Receive instant notifications in your browser or mobile app when you're online.
        </p>
        <div className="notification-type">
          <div className="notification-info">
            <div className="notification-title">Enable Push Notifications</div>
            <div className="notification-description">
              Turn on/off browser and app push notifications
            </div>
          </div>
          <ToggleSwitch
            checked={formData.push_notifications_enabled}
            onChange={() => handleToggle('push_notifications_enabled')}
          />
        </div>
        {formData.push_notifications_enabled && (
          <div className="notification-type" style={{ marginTop: '10px' }}>
            <div className="notification-info">
              <div className="notification-title">Notification Sound</div>
              <div className="notification-description">
                Play a sound when receiving push notifications
              </div>
            </div>
            <ToggleSwitch
              checked={formData.notification_sound_enabled}
              onChange={() => handleToggle('notification_sound_enabled')}
            />
          </div>
        )}
      </div>

      {/* Notification types */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⚙️</span>
          <h3 className="settings-card-title">Notification Types</h3>
        </div>
        <p className="settings-card-description">
          Choose which types of activities you want to be notified about. These settings apply to all enabled notification channels.
        </p>
        <div className="notification-types">
          {notificationTypes.map(type => (
            <div key={type.key} className="notification-type">
              <div className="notification-info">
                <div className="notification-title">
                  <span style={{ marginRight: '8px' }}>{type.icon}</span>
                  {type.title}
                </div>
                <div className="notification-description">
                  {type.description}
                </div>
              </div>
              <ToggleSwitch
                checked={formData[type.key]}
                onChange={() => handleToggle(type.key)}
                disabled={!formData.email_notifications_enabled && 
                          !formData.sms_notifications_enabled && 
                          !formData.push_notifications_enabled}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification preview */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👁️</span>
          <h3 className="settings-card-title">Notification Preview</h3>
        </div>
        <p className="settings-card-description">
          Based on your current settings, you will receive notifications via:
        </p>
        <div style={{ marginTop: '15px' }}>
          {formData.email_notifications_enabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#27ae60', fontSize: '1.2em' }}>✓</span>
              <span>Email notifications</span>
            </div>
          )}
          {formData.sms_notifications_enabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#27ae60', fontSize: '1.2em' }}>✓</span>
              <span>SMS notifications {formData.sms_urgent_only ? '(urgent only)' : '(all types)'}</span>
            </div>
          )}
          {formData.push_notifications_enabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#27ae60', fontSize: '1.2em' }}>✓</span>
              <span>Push notifications {formData.notification_sound_enabled ? '(with sound)' : '(silent)'}</span>
            </div>
          )}
          {!formData.email_notifications_enabled && 
           !formData.sms_notifications_enabled && 
           !formData.push_notifications_enabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c' }}>
              <span style={{ fontSize: '1.2em' }}>⚠️</span>
              <span>No notification channels enabled - you won't receive any notifications</span>
            </div>
          )}
        </div>
      </div>

      <div className="settings-actions-bottom">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="save-button"
        >
          {isLoading ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
