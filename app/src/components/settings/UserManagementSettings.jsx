import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const UserManagementSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Employee Management
    auto_approve_employees: false,
    require_manager_approval: true,
    allow_employee_self_registration: true,
    require_email_verification: true,
    employee_probation_period_days: 90,
    
    // Manager Permissions
    managers_can_create_employees: true,
    managers_can_edit_all_timesheets: true,
    managers_can_approve_overtime: true,
    managers_can_modify_rates: false,
    managers_can_access_reports: true,
    
    // Client Permissions
    clients_can_view_timesheets: true,
    clients_can_edit_timesheets: false,
    clients_can_request_workers: true,
    clients_can_modify_jobs: true,
    clients_can_cancel_shifts: false,
    
    // Role-Based Access
    crew_chiefs_can_edit_team_times: true,
    crew_chiefs_can_mark_absent: true,
    crew_chiefs_can_add_notes: true,
    forklift_operators_premium_rate: 2.00,
    truck_drivers_premium_rate: 3.00,
    crew_chief_premium_rate: 5.00,
    
    // Account Security
    password_min_length: 8,
    require_password_complexity: true,
    password_expiry_days: 90,
    max_login_attempts: 5,
    account_lockout_duration_minutes: 30,
    require_two_factor_auth: false,
    
    // Session Management
    session_timeout_minutes: 480, // 8 hours
    remember_me_duration_days: 30,
    force_logout_inactive_users: true,
    concurrent_sessions_allowed: 3,
    
    // User Directory
    show_employee_contact_info: true,
    show_employee_certifications: true,
    allow_employee_profile_editing: true,
    require_profile_photos: false,
    
    // Approval Workflows
    require_shift_assignment_approval: false,
    require_schedule_change_approval: true,
    require_overtime_pre_approval: true,
    auto_notify_approvers: true,
    approval_timeout_hours: 24,
  });

  useEffect(() => {
    if (settings?.user_management) {
      setFormData(prev => ({
        ...prev,
        ...settings.user_management
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
    onUpdate('user-management', formData);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>User Management Settings</h2>
        <p>Configure user roles, permissions, and access controls for employees, managers, and clients.</p>
      </div>

      {/* Employee Management */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👥</span>
          <h3 className="settings-card-title">Employee Management</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Approve New Employees</div>
                <div className="toggle-description">Automatically approve employee registrations without manager review</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_approve_employees}
                onChange={() => handleToggle('auto_approve_employees')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Manager Approval</div>
                <div className="toggle-description">New employees need manager approval before accessing the system</div>
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
                <div className="toggle-title">Allow Employee Self-Registration</div>
                <div className="toggle-description">Employees can create their own accounts</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_employee_self_registration}
                onChange={() => handleToggle('allow_employee_self_registration')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Email Verification</div>
                <div className="toggle-description">Users must verify their email address during registration</div>
              </div>
              <ToggleSwitch
                checked={formData.require_email_verification}
                onChange={() => handleToggle('require_email_verification')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Employee Probation Period (Days)</label>
            <input
              type="number"
              min="0"
              max="365"
              className="form-input"
              value={formData.employee_probation_period_days}
              onChange={(e) => handleInputChange('employee_probation_period_days', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Manager Permissions */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👔</span>
          <h3 className="settings-card-title">Manager Permissions</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Create Employee Accounts</div>
                <div className="toggle-description">Managers can create new employee accounts directly</div>
              </div>
              <ToggleSwitch
                checked={formData.managers_can_create_employees}
                onChange={() => handleToggle('managers_can_create_employees')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Edit All Timesheets</div>
                <div className="toggle-description">Managers can edit any employee's timesheet</div>
              </div>
              <ToggleSwitch
                checked={formData.managers_can_edit_all_timesheets}
                onChange={() => handleToggle('managers_can_edit_all_timesheets')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Approve Overtime</div>
                <div className="toggle-description">Managers can approve overtime hours</div>
              </div>
              <ToggleSwitch
                checked={formData.managers_can_approve_overtime}
                onChange={() => handleToggle('managers_can_approve_overtime')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Modify Pay Rates</div>
                <div className="toggle-description">Managers can change employee hourly rates</div>
              </div>
              <ToggleSwitch
                checked={formData.managers_can_modify_rates}
                onChange={() => handleToggle('managers_can_modify_rates')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Access Reports</div>
                <div className="toggle-description">Managers can view and generate reports</div>
              </div>
              <ToggleSwitch
                checked={formData.managers_can_access_reports}
                onChange={() => handleToggle('managers_can_access_reports')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client Permissions */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🤝</span>
          <h3 className="settings-card-title">Client Permissions</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can View Timesheets</div>
                <div className="toggle-description">Clients can view timesheets for their jobs</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_view_timesheets}
                onChange={() => handleToggle('clients_can_view_timesheets')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Edit Timesheets</div>
                <div className="toggle-description">Clients can edit timesheet details</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_edit_timesheets}
                onChange={() => handleToggle('clients_can_edit_timesheets')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Request Workers</div>
                <div className="toggle-description">Clients can request specific workers for jobs</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_request_workers}
                onChange={() => handleToggle('clients_can_request_workers')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Modify Jobs</div>
                <div className="toggle-description">Clients can edit their job details</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_modify_jobs}
                onChange={() => handleToggle('clients_can_modify_jobs')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Cancel Shifts</div>
                <div className="toggle-description">Clients can cancel shifts for their jobs</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_cancel_shifts}
                onChange={() => handleToggle('clients_can_cancel_shifts')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Access & Premiums */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🎭</span>
          <h3 className="settings-card-title">Role-Based Access & Premiums</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Crew Chiefs Can Edit Team Times</div>
                <div className="toggle-description">Crew chiefs can edit clock in/out times for their team</div>
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
                <div className="toggle-title">Crew Chiefs Can Mark Absent</div>
                <div className="toggle-description">Crew chiefs can mark team members as absent</div>
              </div>
              <ToggleSwitch
                checked={formData.crew_chiefs_can_mark_absent}
                onChange={() => handleToggle('crew_chiefs_can_mark_absent')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Forklift Operator Premium ($/hour)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              className="form-input"
              value={formData.forklift_operators_premium_rate}
              onChange={(e) => handleInputChange('forklift_operators_premium_rate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Truck Driver Premium ($/hour)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              className="form-input"
              value={formData.truck_drivers_premium_rate}
              onChange={(e) => handleInputChange('truck_drivers_premium_rate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Crew Chief Premium ($/hour)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              className="form-input"
              value={formData.crew_chief_premium_rate}
              onChange={(e) => handleInputChange('crew_chief_premium_rate', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          onClick={handleSave} 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save User Management Settings'}
        </button>
      </div>
    </div>
  );
};

export default UserManagementSettings;
