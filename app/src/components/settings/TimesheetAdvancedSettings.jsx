import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const TimesheetAdvancedSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Clock In/Out Rules
    require_photo_clock_in: false,
    require_location_verification: true,
    location_verification_radius_feet: 100,
    allow_early_clock_in_minutes: 15,
    allow_late_clock_out_minutes: 15,
    auto_clock_out_hours: 12,
    
    // Multiple Clock In/Out Support
    max_clock_pairs_per_shift: 3,
    require_break_documentation: true,
    auto_deduct_unpaid_breaks: true,
    unpaid_break_threshold_minutes: 30,
    
    // Overtime Policies
    overtime_threshold_daily: 8,
    overtime_threshold_weekly: 40,
    overtime_rate_multiplier: 1.5,
    double_time_threshold_daily: 12,
    double_time_rate_multiplier: 2.0,
    weekend_overtime_enabled: false,
    holiday_overtime_enabled: true,
    
    // Approval Workflows
    require_manager_approval: true,
    require_client_approval: false,
    auto_approve_regular_hours: false,
    auto_approve_overtime: false,
    approval_timeout_hours: 48,
    escalate_unapproved_timesheets: true,
    
    // Time Tracking Accuracy
    round_time_to_nearest_minutes: 15,
    allow_manual_time_adjustments: true,
    require_adjustment_justification: true,
    track_gps_location: true,
    require_supervisor_witness: false,
    
    // Crew Chief Permissions
    crew_chiefs_can_edit_team_times: true,
    crew_chiefs_can_mark_absent: true,
    crew_chiefs_can_add_notes: true,
    crew_chiefs_can_approve_breaks: true,
    crew_chiefs_can_end_shift_for_all: true,
    
    // Client Access
    clients_can_view_timesheets: true,
    clients_can_edit_timesheets: false,
    clients_can_dispute_hours: true,
    clients_can_add_timesheet_notes: true,
    show_worker_names_to_clients: true,
    
    // Payroll Integration
    export_format: 'csv',
    include_break_details: true,
    include_location_data: false,
    include_photo_timestamps: false,
    auto_calculate_taxes: false,
    
    // Compliance & Auditing
    retain_timesheet_data_years: 7,
    require_digital_signatures: false,
    track_all_timesheet_changes: true,
    require_change_justification: true,
    audit_log_retention_years: 10,
    
    // Notifications
    notify_late_clock_in: true,
    notify_missed_clock_out: true,
    notify_overtime_threshold: true,
    notify_approval_required: true,
    send_daily_timesheet_summary: false,
    
    // Mobile & Offline
    allow_offline_time_entry: true,
    sync_when_online: true,
    offline_data_retention_days: 7,
    require_network_for_clock_in: false,
  });

  const [payrollExportFields, setPayrollExportFields] = useState([
    { field: 'employee_id', label: 'Employee ID', included: true, required: true },
    { field: 'employee_name', label: 'Employee Name', included: true, required: true },
    { field: 'shift_date', label: 'Shift Date', included: true, required: true },
    { field: 'clock_in_time', label: 'Clock In Time', included: true, required: true },
    { field: 'clock_out_time', label: 'Clock Out Time', included: true, required: true },
    { field: 'regular_hours', label: 'Regular Hours', included: true, required: true },
    { field: 'overtime_hours', label: 'Overtime Hours', included: true, required: false },
    { field: 'double_time_hours', label: 'Double Time Hours', included: false, required: false },
    { field: 'break_duration', label: 'Break Duration', included: false, required: false },
    { field: 'job_location', label: 'Job Location', included: true, required: false },
    { field: 'client_name', label: 'Client Name', included: true, required: false },
    { field: 'role_assigned', label: 'Role Assigned', included: true, required: false },
    { field: 'hourly_rate', label: 'Hourly Rate', included: false, required: false },
    { field: 'total_pay', label: 'Total Pay', included: false, required: false },
  ]);

  useEffect(() => {
    if (settings?.timesheet_advanced) {
      setFormData(prev => ({
        ...prev,
        ...settings.timesheet_advanced
      }));
      if (settings.timesheet_advanced.payroll_export_fields) {
        setPayrollExportFields(settings.timesheet_advanced.payroll_export_fields);
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

  const handleExportFieldToggle = (field) => {
    setPayrollExportFields(prev => 
      prev.map(item => 
        item.field === field ? { ...item, included: !item.included } : item
      )
    );
    onMarkUnsaved();
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      payroll_export_fields: payrollExportFields
    };
    onUpdate('timesheet-advanced', dataToSave);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Advanced Timesheet Settings</h2>
        <p>Configure advanced time tracking, overtime policies, approval workflows, and payroll integration.</p>
      </div>

      {/* Clock In/Out Rules */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⏱️</span>
          <h3 className="settings-card-title">Clock In/Out Rules</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Photo Clock In</div>
                <div className="toggle-description">Workers must take a photo when clocking in</div>
              </div>
              <ToggleSwitch
                checked={formData.require_photo_clock_in}
                onChange={() => handleToggle('require_photo_clock_in')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Location Verification</div>
                <div className="toggle-description">Verify worker location when clocking in/out</div>
              </div>
              <ToggleSwitch
                checked={formData.require_location_verification}
                onChange={() => handleToggle('require_location_verification')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location Verification Radius (Feet)</label>
            <input
              type="number"
              min="10"
              max="1000"
              className="form-input"
              value={formData.location_verification_radius_feet}
              onChange={(e) => handleInputChange('location_verification_radius_feet', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Allow Early Clock In (Minutes)</label>
            <input
              type="number"
              min="0"
              max="60"
              className="form-input"
              value={formData.allow_early_clock_in_minutes}
              onChange={(e) => handleInputChange('allow_early_clock_in_minutes', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Auto Clock Out After (Hours)</label>
            <input
              type="number"
              min="8"
              max="24"
              className="form-input"
              value={formData.auto_clock_out_hours}
              onChange={(e) => handleInputChange('auto_clock_out_hours', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Multiple Clock In/Out Support */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔄</span>
          <h3 className="settings-card-title">Multiple Clock In/Out Support</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Max Clock Pairs Per Shift</label>
            <input
              type="number"
              min="1"
              max="5"
              className="form-input"
              value={formData.max_clock_pairs_per_shift}
              onChange={(e) => handleInputChange('max_clock_pairs_per_shift', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Break Documentation</div>
                <div className="toggle-description">Workers must document reason for breaks</div>
              </div>
              <ToggleSwitch
                checked={formData.require_break_documentation}
                onChange={() => handleToggle('require_break_documentation')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Deduct Unpaid Breaks</div>
                <div className="toggle-description">Automatically deduct unpaid break time</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_deduct_unpaid_breaks}
                onChange={() => handleToggle('auto_deduct_unpaid_breaks')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Unpaid Break Threshold (Minutes)</label>
            <input
              type="number"
              min="15"
              max="120"
              className="form-input"
              value={formData.unpaid_break_threshold_minutes}
              onChange={(e) => handleInputChange('unpaid_break_threshold_minutes', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Overtime Policies */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">💰</span>
          <h3 className="settings-card-title">Overtime Policies</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Daily Overtime Threshold (Hours)</label>
            <input
              type="number"
              min="6"
              max="12"
              className="form-input"
              value={formData.overtime_threshold_daily}
              onChange={(e) => handleInputChange('overtime_threshold_daily', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Weekly Overtime Threshold (Hours)</label>
            <input
              type="number"
              min="35"
              max="50"
              className="form-input"
              value={formData.overtime_threshold_weekly}
              onChange={(e) => handleInputChange('overtime_threshold_weekly', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Overtime Rate Multiplier</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              className="form-input"
              value={formData.overtime_rate_multiplier}
              onChange={(e) => handleInputChange('overtime_rate_multiplier', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Double Time Threshold (Hours)</label>
            <input
              type="number"
              min="10"
              max="16"
              className="form-input"
              value={formData.double_time_threshold_daily}
              onChange={(e) => handleInputChange('double_time_threshold_daily', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Double Time Rate Multiplier</label>
            <input
              type="number"
              step="0.1"
              min="1.5"
              max="3.0"
              className="form-input"
              value={formData.double_time_rate_multiplier}
              onChange={(e) => handleInputChange('double_time_rate_multiplier', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Weekend Overtime</div>
                <div className="toggle-description">Apply overtime rates for weekend work</div>
              </div>
              <ToggleSwitch
                checked={formData.weekend_overtime_enabled}
                onChange={() => handleToggle('weekend_overtime_enabled')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Approval Workflows */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">✅</span>
          <h3 className="settings-card-title">Approval Workflows</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Manager Approval</div>
                <div className="toggle-description">Timesheets must be approved by managers</div>
              </div>
              <ToggleSwitch
                checked={formData.require_manager_approval}
                onChange={() => handleToggle('require_manager_approval')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Client Approval</div>
                <div className="toggle-description">Clients must approve timesheets for their jobs</div>
              </div>
              <ToggleSwitch
                checked={formData.require_client_approval}
                onChange={() => handleToggle('require_client_approval')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Approve Regular Hours</div>
                <div className="toggle-description">Automatically approve regular hours without overtime</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_approve_regular_hours}
                onChange={() => handleToggle('auto_approve_regular_hours')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Approve Overtime</div>
                <div className="toggle-description">Automatically approve overtime hours</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_approve_overtime}
                onChange={() => handleToggle('auto_approve_overtime')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Approval Timeout (Hours)</label>
            <input
              type="number"
              min="12"
              max="168"
              className="form-input"
              value={formData.approval_timeout_hours}
              onChange={(e) => handleInputChange('approval_timeout_hours', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Crew Chief Permissions */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👑</span>
          <h3 className="settings-card-title">Crew Chief Permissions</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Edit Team Times</div>
                <div className="toggle-description">Crew chiefs can edit their team's clock in/out times</div>
              </div>
              <ToggleSwitch
                checked={formData.crew_chiefs_can_edit_team_times}
                onChange={() => handleToggle('crew_chiefs_can_edit_team_times')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Mark Absent</div>
                <div className="toggle-description">Crew chiefs can mark team members as absent</div>
              </div>
              <ToggleSwitch
                checked={formData.crew_chiefs_can_mark_absent}
                onChange={() => handleToggle('crew_chiefs_can_mark_absent')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Add Notes</div>
                <div className="toggle-description">Crew chiefs can add notes to timesheets</div>
              </div>
              <ToggleSwitch
                checked={formData.crew_chiefs_can_add_notes}
                onChange={() => handleToggle('crew_chiefs_can_add_notes')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can End Shift for All</div>
                <div className="toggle-description">Crew chiefs can end the shift for all team members</div>
              </div>
              <ToggleSwitch
                checked={formData.crew_chiefs_can_end_shift_for_all}
                onChange={() => handleToggle('crew_chiefs_can_end_shift_for_all')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Time Tracking Accuracy */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🎯</span>
          <h3 className="settings-card-title">Time Tracking Accuracy</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Round Time to Nearest (Minutes)</label>
            <select
              className="form-select"
              value={formData.round_time_to_nearest_minutes}
              onChange={(e) => handleInputChange('round_time_to_nearest_minutes', parseInt(e.target.value))}
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Manual Time Adjustments</div>
                <div className="toggle-description">Managers can manually adjust clock times</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_manual_time_adjustments}
                onChange={() => handleToggle('allow_manual_time_adjustments')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Adjustment Justification</div>
                <div className="toggle-description">Require reason for manual time adjustments</div>
              </div>
              <ToggleSwitch
                checked={formData.require_adjustment_justification}
                onChange={() => handleToggle('require_adjustment_justification')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Track GPS Location</div>
                <div className="toggle-description">Record GPS coordinates with clock in/out</div>
              </div>
              <ToggleSwitch
                checked={formData.track_gps_location}
                onChange={() => handleToggle('track_gps_location')}
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
          {isLoading ? 'Saving...' : 'Save Advanced Timesheet Settings'}
        </button>
      </div>
    </div>
  );
};

export default TimesheetAdvancedSettings;
