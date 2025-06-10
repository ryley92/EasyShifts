import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const ClientManagementSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Client Onboarding
    auto_approve_client_registrations: false,
    require_client_verification: true,
    require_business_license_verification: true,
    require_insurance_verification: true,
    client_onboarding_checklist_enabled: true,
    
    // Communication Preferences
    default_communication_method: 'email',
    allow_sms_notifications: true,
    require_job_confirmation: true,
    send_shift_reminders: true,
    shift_reminder_hours_before: 24,
    
    // Billing & Invoicing
    auto_generate_invoices: true,
    invoice_generation_frequency: 'weekly',
    default_payment_terms_days: 30,
    late_payment_fee_percentage: 2.5,
    require_po_numbers: true,
    allow_credit_applications: true,
    
    // Job Management
    clients_can_create_jobs: true,
    clients_can_modify_active_jobs: false,
    clients_can_cancel_jobs: true,
    job_cancellation_notice_hours: 24,
    allow_rush_job_requests: true,
    rush_job_premium_percentage: 25,
    
    // Worker Requests
    clients_can_request_specific_workers: true,
    clients_can_exclude_workers: false,
    allow_worker_rating_system: true,
    require_worker_feedback: false,
    
    // Timesheet & Approval
    clients_receive_daily_timesheets: true,
    require_client_timesheet_approval: false,
    timesheet_approval_deadline_hours: 48,
    auto_approve_if_no_response: true,
    
    // Pricing & Rates
    show_rates_to_clients: false,
    allow_client_rate_negotiation: false,
    use_tiered_pricing: true,
    volume_discount_threshold_hours: 100,
    volume_discount_percentage: 5,
    
    // Service Areas
    default_service_radius_miles: 50,
    charge_travel_time: true,
    travel_time_rate_percentage: 100,
    minimum_job_duration_hours: 4,
    
    // Quality Control
    require_job_completion_photos: true,
    send_client_satisfaction_surveys: true,
    survey_frequency: 'after_each_job',
    track_client_complaints: true,
    
    // Contract Management
    require_signed_contracts: true,
    use_digital_signatures: true,
    contract_auto_renewal: false,
    contract_renewal_notice_days: 30,
    
    // Emergency Procedures
    emergency_contact_required: true,
    after_hours_support_available: true,
    emergency_response_time_minutes: 30,
    
    // Data & Privacy
    share_worker_names_with_clients: true,
    share_worker_photos_with_clients: false,
    allow_client_worker_direct_contact: false,
    client_data_retention_years: 7,
  });

  const [customFields, setCustomFields] = useState([
    { id: 1, name: 'Industry Type', type: 'select', required: true, options: ['Entertainment', 'Corporate', 'Trade Show', 'Other'] },
    { id: 2, name: 'Preferred Contact Time', type: 'text', required: false, options: [] },
    { id: 3, name: 'Special Requirements', type: 'textarea', required: false, options: [] },
  ]);

  useEffect(() => {
    if (settings?.client_management) {
      setFormData(prev => ({
        ...prev,
        ...settings.client_management
      }));
      if (settings.client_management.custom_fields) {
        setCustomFields(settings.client_management.custom_fields);
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

  const handleCustomFieldChange = (id, field, value) => {
    setCustomFields(prev => 
      prev.map(customField => 
        customField.id === id ? { ...customField, [field]: value } : customField
      )
    );
    onMarkUnsaved();
  };

  const addCustomField = () => {
    const newId = Math.max(...customFields.map(f => f.id), 0) + 1;
    setCustomFields(prev => [
      ...prev,
      { id: newId, name: '', type: 'text', required: false, options: [] }
    ]);
    onMarkUnsaved();
  };

  const removeCustomField = (id) => {
    setCustomFields(prev => prev.filter(field => field.id !== id));
    onMarkUnsaved();
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      custom_fields: customFields
    };
    onUpdate('client-management', dataToSave);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Client Management Settings</h2>
        <p>Configure client onboarding, communication, billing, and service management preferences.</p>
      </div>

      {/* Client Onboarding */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🤝</span>
          <h3 className="settings-card-title">Client Onboarding</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Approve Client Registrations</div>
                <div className="toggle-description">Automatically approve new client registrations</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_approve_client_registrations}
                onChange={() => handleToggle('auto_approve_client_registrations')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Client Verification</div>
                <div className="toggle-description">Verify client business information before approval</div>
              </div>
              <ToggleSwitch
                checked={formData.require_client_verification}
                onChange={() => handleToggle('require_client_verification')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Business License</div>
                <div className="toggle-description">Clients must provide valid business license</div>
              </div>
              <ToggleSwitch
                checked={formData.require_business_license_verification}
                onChange={() => handleToggle('require_business_license_verification')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Insurance Verification</div>
                <div className="toggle-description">Clients must provide proof of insurance</div>
              </div>
              <ToggleSwitch
                checked={formData.require_insurance_verification}
                onChange={() => handleToggle('require_insurance_verification')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Communication */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">💬</span>
          <h3 className="settings-card-title">Communication Preferences</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Default Communication Method</label>
            <select
              className="form-select"
              value={formData.default_communication_method}
              onChange={(e) => handleInputChange('default_communication_method', e.target.value)}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone</option>
              <option value="app">App Notification</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Send Shift Reminders</div>
                <div className="toggle-description">Automatically send shift reminders to clients</div>
              </div>
              <ToggleSwitch
                checked={formData.send_shift_reminders}
                onChange={() => handleToggle('send_shift_reminders')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Shift Reminder Hours Before</label>
            <input
              type="number"
              min="1"
              max="168"
              className="form-input"
              value={formData.shift_reminder_hours_before}
              onChange={(e) => handleInputChange('shift_reminder_hours_before', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Job Confirmation</div>
                <div className="toggle-description">Clients must confirm job details before scheduling</div>
              </div>
              <ToggleSwitch
                checked={formData.require_job_confirmation}
                onChange={() => handleToggle('require_job_confirmation')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing & Invoicing */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">💰</span>
          <h3 className="settings-card-title">Billing & Invoicing</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Generate Invoices</div>
                <div className="toggle-description">Automatically create invoices after job completion</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_generate_invoices}
                onChange={() => handleToggle('auto_generate_invoices')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Generation Frequency</label>
            <select
              className="form-select"
              value={formData.invoice_generation_frequency}
              onChange={(e) => handleInputChange('invoice_generation_frequency', e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default Payment Terms (Days)</label>
            <input
              type="number"
              min="1"
              max="120"
              className="form-input"
              value={formData.default_payment_terms_days}
              onChange={(e) => handleInputChange('default_payment_terms_days', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Late Payment Fee (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="25"
              className="form-input"
              value={formData.late_payment_fee_percentage}
              onChange={(e) => handleInputChange('late_payment_fee_percentage', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require PO Numbers</div>
                <div className="toggle-description">Clients must provide purchase order numbers</div>
              </div>
              <ToggleSwitch
                checked={formData.require_po_numbers}
                onChange={() => handleToggle('require_po_numbers')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Job Management */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">💼</span>
          <h3 className="settings-card-title">Job Management</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Clients Can Create Jobs</div>
                <div className="toggle-description">Allow clients to create their own job postings</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_create_jobs}
                onChange={() => handleToggle('clients_can_create_jobs')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Modify Active Jobs</div>
                <div className="toggle-description">Clients can modify jobs that are already scheduled</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_modify_active_jobs}
                onChange={() => handleToggle('clients_can_modify_active_jobs')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Can Cancel Jobs</div>
                <div className="toggle-description">Clients can cancel their job postings</div>
              </div>
              <ToggleSwitch
                checked={formData.clients_can_cancel_jobs}
                onChange={() => handleToggle('clients_can_cancel_jobs')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Job Cancellation Notice (Hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              className="form-input"
              value={formData.job_cancellation_notice_hours}
              onChange={(e) => handleInputChange('job_cancellation_notice_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Rush Job Requests</div>
                <div className="toggle-description">Clients can request jobs with short notice</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_rush_job_requests}
                onChange={() => handleToggle('allow_rush_job_requests')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Rush Job Premium (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="form-input"
              value={formData.rush_job_premium_percentage}
              onChange={(e) => handleInputChange('rush_job_premium_percentage', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Pricing & Service Areas */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📍</span>
          <h3 className="settings-card-title">Pricing & Service Areas</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Show Rates to Clients</div>
                <div className="toggle-description">Display hourly rates to clients</div>
              </div>
              <ToggleSwitch
                checked={formData.show_rates_to_clients}
                onChange={() => handleToggle('show_rates_to_clients')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Use Tiered Pricing</div>
                <div className="toggle-description">Apply volume discounts for large jobs</div>
              </div>
              <ToggleSwitch
                checked={formData.use_tiered_pricing}
                onChange={() => handleToggle('use_tiered_pricing')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Service Radius (Miles)</label>
            <input
              type="number"
              min="1"
              max="500"
              className="form-input"
              value={formData.default_service_radius_miles}
              onChange={(e) => handleInputChange('default_service_radius_miles', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Charge Travel Time</div>
                <div className="toggle-description">Include travel time in billing</div>
              </div>
              <ToggleSwitch
                checked={formData.charge_travel_time}
                onChange={() => handleToggle('charge_travel_time')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Job Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className="form-input"
              value={formData.minimum_job_duration_hours}
              onChange={(e) => handleInputChange('minimum_job_duration_hours', parseInt(e.target.value))}
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
          {isLoading ? 'Saving...' : 'Save Client Management Settings'}
        </button>
      </div>
    </div>
  );
};

export default ClientManagementSettings;
