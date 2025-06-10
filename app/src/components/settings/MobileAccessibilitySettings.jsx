import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const MobileAccessibilitySettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Mobile App Settings
    mobile_app_enabled: true,
    force_mobile_app_updates: false,
    allow_mobile_web_access: true,
    mobile_session_timeout_minutes: 240,
    
    // Offline Capabilities
    enable_offline_mode: true,
    offline_data_sync_hours: 24,
    cache_shift_schedules: true,
    cache_employee_directory: false,
    cache_timesheet_data: true,
    
    // Push Notifications
    mobile_push_notifications: true,
    push_shift_reminders: true,
    push_schedule_changes: true,
    push_timesheet_deadlines: true,
    push_emergency_alerts: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '06:00',
    
    // Location Services
    gps_tracking_enabled: true,
    location_accuracy_meters: 50,
    background_location_tracking: false,
    geofencing_enabled: true,
    auto_clock_in_geofence: false,
    
    // Accessibility Features
    high_contrast_mode: false,
    large_text_support: true,
    voice_over_support: true,
    screen_reader_optimized: true,
    keyboard_navigation: true,
    
    // Visual Accessibility
    font_size_multiplier: 1.0,
    color_blind_friendly_colors: false,
    reduce_motion_effects: false,
    increase_touch_targets: false,
    
    // Audio Accessibility
    audio_feedback_enabled: false,
    notification_sounds: true,
    haptic_feedback: true,
    voice_commands_enabled: false,
    
    // Language & Localization
    default_language: 'en',
    auto_detect_language: true,
    right_to_left_support: false,
    currency_localization: true,
    date_format_localization: true,
    
    // Device Compatibility
    minimum_ios_version: '13.0',
    minimum_android_version: '8.0',
    tablet_optimized_layout: true,
    landscape_mode_support: true,
    
    // Security Features
    biometric_authentication: true,
    pin_code_backup: true,
    auto_lock_minutes: 5,
    screenshot_prevention: false,
    app_backgrounding_security: true,
    
    // Data Usage
    compress_images: true,
    limit_background_data: false,
    wifi_only_sync: false,
    data_usage_warnings: true,
    
    // Performance
    image_quality: 'medium',
    animation_speed: 'normal',
    preload_next_screens: true,
    cache_size_mb: 100,
  });

  const [supportedLanguages] = useState([
    { code: 'en', name: 'English', enabled: true },
    { code: 'es', name: 'Spanish', enabled: true },
    { code: 'fr', name: 'French', enabled: false },
    { code: 'de', name: 'German', enabled: false },
    { code: 'it', name: 'Italian', enabled: false },
    { code: 'pt', name: 'Portuguese', enabled: false },
    { code: 'zh', name: 'Chinese', enabled: false },
    { code: 'ja', name: 'Japanese', enabled: false },
  ]);

  useEffect(() => {
    if (settings?.mobile_accessibility) {
      setFormData(prev => ({
        ...prev,
        ...settings.mobile_accessibility
      }));
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

  const handleSave = () => {
    onUpdate('mobile-accessibility', formData);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Mobile & Accessibility Settings</h2>
        <p>Configure mobile app features, offline capabilities, accessibility options, and device compatibility.</p>
      </div>

      {/* Mobile App Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📱</span>
          <h3 className="settings-card-title">Mobile App Settings</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Mobile App</div>
                <div className="toggle-description">Allow access through mobile applications</div>
              </div>
              <ToggleSwitch
                checked={formData.mobile_app_enabled}
                onChange={() => handleToggle('mobile_app_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Force App Updates</div>
                <div className="toggle-description">Require users to update to the latest app version</div>
              </div>
              <ToggleSwitch
                checked={formData.force_mobile_app_updates}
                onChange={() => handleToggle('force_mobile_app_updates')}
                disabled={!formData.mobile_app_enabled}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Mobile Web Access</div>
                <div className="toggle-description">Allow access through mobile web browsers</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_mobile_web_access}
                onChange={() => handleToggle('allow_mobile_web_access')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Session Timeout (Minutes)</label>
            <input
              type="number"
              min="30"
              max="1440"
              className="form-input"
              value={formData.mobile_session_timeout_minutes}
              onChange={(e) => handleInputChange('mobile_session_timeout_minutes', parseInt(e.target.value))}
              disabled={!formData.mobile_app_enabled}
            />
          </div>
        </div>
      </div>

      {/* Offline Capabilities */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📶</span>
          <h3 className="settings-card-title">Offline Capabilities</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Offline Mode</div>
                <div className="toggle-description">Allow app functionality without internet connection</div>
              </div>
              <ToggleSwitch
                checked={formData.enable_offline_mode}
                onChange={() => handleToggle('enable_offline_mode')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Offline Data Sync (Hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              className="form-input"
              value={formData.offline_data_sync_hours}
              onChange={(e) => handleInputChange('offline_data_sync_hours', parseInt(e.target.value))}
              disabled={!formData.enable_offline_mode}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Cache Shift Schedules</div>
                <div className="toggle-description">Store shift schedules for offline viewing</div>
              </div>
              <ToggleSwitch
                checked={formData.cache_shift_schedules}
                onChange={() => handleToggle('cache_shift_schedules')}
                disabled={!formData.enable_offline_mode}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Cache Timesheet Data</div>
                <div className="toggle-description">Store timesheet data for offline entry</div>
              </div>
              <ToggleSwitch
                checked={formData.cache_timesheet_data}
                onChange={() => handleToggle('cache_timesheet_data')}
                disabled={!formData.enable_offline_mode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔔</span>
          <h3 className="settings-card-title">Push Notifications</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Push Notifications</div>
                <div className="toggle-description">Send push notifications to mobile devices</div>
              </div>
              <ToggleSwitch
                checked={formData.mobile_push_notifications}
                onChange={() => handleToggle('mobile_push_notifications')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Shift Reminders</div>
                <div className="toggle-description">Send reminders before shifts start</div>
              </div>
              <ToggleSwitch
                checked={formData.push_shift_reminders}
                onChange={() => handleToggle('push_shift_reminders')}
                disabled={!formData.mobile_push_notifications}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Schedule Changes</div>
                <div className="toggle-description">Notify about schedule modifications</div>
              </div>
              <ToggleSwitch
                checked={formData.push_schedule_changes}
                onChange={() => handleToggle('push_schedule_changes')}
                disabled={!formData.mobile_push_notifications}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Emergency Alerts</div>
                <div className="toggle-description">Send emergency notifications</div>
              </div>
              <ToggleSwitch
                checked={formData.push_emergency_alerts}
                onChange={() => handleToggle('push_emergency_alerts')}
                disabled={!formData.mobile_push_notifications}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Quiet Hours Start</label>
            <input
              type="time"
              className="form-input"
              value={formData.quiet_hours_start}
              onChange={(e) => handleInputChange('quiet_hours_start', e.target.value)}
              disabled={!formData.mobile_push_notifications}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quiet Hours End</label>
            <input
              type="time"
              className="form-input"
              value={formData.quiet_hours_end}
              onChange={(e) => handleInputChange('quiet_hours_end', e.target.value)}
              disabled={!formData.mobile_push_notifications}
            />
          </div>
        </div>
      </div>

      {/* Location Services */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📍</span>
          <h3 className="settings-card-title">Location Services</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">GPS Tracking</div>
                <div className="toggle-description">Enable GPS location tracking</div>
              </div>
              <ToggleSwitch
                checked={formData.gps_tracking_enabled}
                onChange={() => handleToggle('gps_tracking_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location Accuracy (Meters)</label>
            <input
              type="number"
              min="10"
              max="500"
              className="form-input"
              value={formData.location_accuracy_meters}
              onChange={(e) => handleInputChange('location_accuracy_meters', parseInt(e.target.value))}
              disabled={!formData.gps_tracking_enabled}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Background Location Tracking</div>
                <div className="toggle-description">Track location when app is in background</div>
              </div>
              <ToggleSwitch
                checked={formData.background_location_tracking}
                onChange={() => handleToggle('background_location_tracking')}
                disabled={!formData.gps_tracking_enabled}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Geofencing</div>
                <div className="toggle-description">Enable location-based triggers</div>
              </div>
              <ToggleSwitch
                checked={formData.geofencing_enabled}
                onChange={() => handleToggle('geofencing_enabled')}
                disabled={!formData.gps_tracking_enabled}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">♿</span>
          <h3 className="settings-card-title">Accessibility Features</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">High Contrast Mode</div>
                <div className="toggle-description">Enable high contrast colors for better visibility</div>
              </div>
              <ToggleSwitch
                checked={formData.high_contrast_mode}
                onChange={() => handleToggle('high_contrast_mode')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Large Text Support</div>
                <div className="toggle-description">Support for larger text sizes</div>
              </div>
              <ToggleSwitch
                checked={formData.large_text_support}
                onChange={() => handleToggle('large_text_support')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Screen Reader Optimized</div>
                <div className="toggle-description">Optimize interface for screen readers</div>
              </div>
              <ToggleSwitch
                checked={formData.screen_reader_optimized}
                onChange={() => handleToggle('screen_reader_optimized')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Keyboard Navigation</div>
                <div className="toggle-description">Enable full keyboard navigation support</div>
              </div>
              <ToggleSwitch
                checked={formData.keyboard_navigation}
                onChange={() => handleToggle('keyboard_navigation')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Font Size Multiplier</label>
            <select
              className="form-select"
              value={formData.font_size_multiplier}
              onChange={(e) => handleInputChange('font_size_multiplier', parseFloat(e.target.value))}
            >
              <option value="0.8">Small (0.8x)</option>
              <option value="1.0">Normal (1.0x)</option>
              <option value="1.2">Large (1.2x)</option>
              <option value="1.5">Extra Large (1.5x)</option>
              <option value="2.0">Huge (2.0x)</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Color Blind Friendly</div>
                <div className="toggle-description">Use color blind friendly color schemes</div>
              </div>
              <ToggleSwitch
                checked={formData.color_blind_friendly_colors}
                onChange={() => handleToggle('color_blind_friendly_colors')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audio & Haptic Feedback */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔊</span>
          <h3 className="settings-card-title">Audio & Haptic Feedback</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Audio Feedback</div>
                <div className="toggle-description">Provide audio feedback for actions</div>
              </div>
              <ToggleSwitch
                checked={formData.audio_feedback_enabled}
                onChange={() => handleToggle('audio_feedback_enabled')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Notification Sounds</div>
                <div className="toggle-description">Play sounds for notifications</div>
              </div>
              <ToggleSwitch
                checked={formData.notification_sounds}
                onChange={() => handleToggle('notification_sounds')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Haptic Feedback</div>
                <div className="toggle-description">Provide vibration feedback for actions</div>
              </div>
              <ToggleSwitch
                checked={formData.haptic_feedback}
                onChange={() => handleToggle('haptic_feedback')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Voice Commands</div>
                <div className="toggle-description">Enable voice command functionality</div>
              </div>
              <ToggleSwitch
                checked={formData.voice_commands_enabled}
                onChange={() => handleToggle('voice_commands_enabled')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔐</span>
          <h3 className="settings-card-title">Mobile Security</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Biometric Authentication</div>
                <div className="toggle-description">Allow fingerprint/face ID authentication</div>
              </div>
              <ToggleSwitch
                checked={formData.biometric_authentication}
                onChange={() => handleToggle('biometric_authentication')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">PIN Code Backup</div>
                <div className="toggle-description">Require PIN as backup authentication</div>
              </div>
              <ToggleSwitch
                checked={formData.pin_code_backup}
                onChange={() => handleToggle('pin_code_backup')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Auto-Lock After (Minutes)</label>
            <select
              className="form-select"
              value={formData.auto_lock_minutes}
              onChange={(e) => handleInputChange('auto_lock_minutes', parseInt(e.target.value))}
            >
              <option value="1">1 minute</option>
              <option value="2">2 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Screenshot Prevention</div>
                <div className="toggle-description">Prevent screenshots of sensitive data</div>
              </div>
              <ToggleSwitch
                checked={formData.screenshot_prevention}
                onChange={() => handleToggle('screenshot_prevention')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          onClick={handleSave} 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Mobile & Accessibility Settings'}
        </button>
      </div>
    </div>
  );
};

export default MobileAccessibilitySettings;
