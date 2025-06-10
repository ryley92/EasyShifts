import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const CompanyProfileSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    company_name: 'Hands on Labor',
    company_tagline: 'Professional Labor Staffing Solutions',
    company_description: 'San Diego-based labor staffing agency specializing in stage setup, teardown, and event support services.',
    company_website: 'https://handsonlabor.com',
    company_email: 'info@handsonlabor.com',
    company_phone: '(619) 555-0123',
    company_address: '123 Labor Street, San Diego, CA 92101',
    company_logo_url: '',
    company_primary_color: '#2563eb',
    company_secondary_color: '#1e40af',
    business_license: '',
    tax_id: '',
    workers_comp_policy: '',
    liability_insurance_policy: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_email: '',
    operating_hours_start: '06:00',
    operating_hours_end: '22:00',
    time_zone: 'America/Los_Angeles',
    default_hourly_rate: 25.00,
    overtime_rate_multiplier: 1.5,
    show_company_branding: true,
    allow_public_job_postings: false,
    require_background_checks: true,
    drug_testing_required: false,
  });

  useEffect(() => {
    if (settings?.company_profile) {
      setFormData(prev => ({
        ...prev,
        ...settings.company_profile
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
    onUpdate('company-profile', formData);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Company Profile Settings</h2>
        <p>Configure your company information, branding, and basic business details.</p>
      </div>

      {/* Company Information */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🏢</span>
          <h3 className="settings-card-title">Company Information</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input
              type="text"
              className="form-input"
              value={formData.company_tagline}
              onChange={(e) => handleInputChange('company_tagline', e.target.value)}
              placeholder="Brief company tagline"
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Company Description</label>
            <textarea
              className="form-textarea"
              value={formData.company_description}
              onChange={(e) => handleInputChange('company_description', e.target.value)}
              placeholder="Describe your company and services"
              rows="3"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📞</span>
          <h3 className="settings-card-title">Contact Information</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Website</label>
            <input
              type="url"
              className="form-input"
              value={formData.company_website}
              onChange={(e) => handleInputChange('company_website', e.target.value)}
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              placeholder="info@yourcompany.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              value={formData.company_phone}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              placeholder="(619) 555-0123"
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.company_address}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              placeholder="123 Main St, City, State ZIP"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🎨</span>
          <h3 className="settings-card-title">Branding & Appearance</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Logo URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.company_logo_url}
              onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Primary Color</label>
            <input
              type="color"
              className="form-input color-input"
              value={formData.company_primary_color}
              onChange={(e) => handleInputChange('company_primary_color', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Secondary Color</label>
            <input
              type="color"
              className="form-input color-input"
              value={formData.company_secondary_color}
              onChange={(e) => handleInputChange('company_secondary_color', e.target.value)}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Show Company Branding</div>
                <div className="toggle-description">Display company logo and colors throughout the app</div>
              </div>
              <ToggleSwitch
                checked={formData.show_company_branding}
                onChange={() => handleToggle('show_company_branding')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📋</span>
          <h3 className="settings-card-title">Business Details</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Business License</label>
            <input
              type="text"
              className="form-input"
              value={formData.business_license}
              onChange={(e) => handleInputChange('business_license', e.target.value)}
              placeholder="License number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tax ID / EIN</label>
            <input
              type="text"
              className="form-input"
              value={formData.tax_id}
              onChange={(e) => handleInputChange('tax_id', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Workers' Comp Policy</label>
            <input
              type="text"
              className="form-input"
              value={formData.workers_comp_policy}
              onChange={(e) => handleInputChange('workers_comp_policy', e.target.value)}
              placeholder="Policy number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Liability Insurance</label>
            <input
              type="text"
              className="form-input"
              value={formData.liability_insurance_policy}
              onChange={(e) => handleInputChange('liability_insurance_policy', e.target.value)}
              placeholder="Policy number"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🚨</span>
          <h3 className="settings-card-title">Emergency Contact</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Contact Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.emergency_contact_name}
              onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
              placeholder="Emergency contact person"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="tel"
              className="form-input"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
              placeholder="(619) 555-0123"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.emergency_contact_email}
              onChange={(e) => handleInputChange('emergency_contact_email', e.target.value)}
              placeholder="emergency@yourcompany.com"
            />
          </div>
        </div>
      </div>

      {/* Operating Hours & Rates */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⏰</span>
          <h3 className="settings-card-title">Operating Hours & Rates</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Operating Hours Start</label>
            <input
              type="time"
              className="form-input"
              value={formData.operating_hours_start}
              onChange={(e) => handleInputChange('operating_hours_start', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Operating Hours End</label>
            <input
              type="time"
              className="form-input"
              value={formData.operating_hours_end}
              onChange={(e) => handleInputChange('operating_hours_end', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time Zone</label>
            <select
              className="form-select"
              value={formData.time_zone}
              onChange={(e) => handleInputChange('time_zone', e.target.value)}
            >
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/New_York">Eastern Time</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default Hourly Rate ($)</label>
            <input
              type="number"
              step="0.25"
              min="0"
              className="form-input"
              value={formData.default_hourly_rate}
              onChange={(e) => handleInputChange('default_hourly_rate', parseFloat(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Overtime Rate Multiplier</label>
            <input
              type="number"
              step="0.1"
              min="1"
              className="form-input"
              value={formData.overtime_rate_multiplier}
              onChange={(e) => handleInputChange('overtime_rate_multiplier', parseFloat(e.target.value))}
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
          {isLoading ? 'Saving...' : 'Save Company Profile Settings'}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfileSettings;
