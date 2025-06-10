import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const CertificationsSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Certification Requirements
    require_crew_chief_certification: true,
    require_forklift_certification: true,
    require_truck_driver_license: true,
    require_safety_training: true,
    require_background_check: true,
    
    // Certification Validity
    crew_chief_cert_validity_months: 24,
    forklift_cert_validity_months: 36,
    safety_training_validity_months: 12,
    background_check_validity_months: 12,
    
    // Training Requirements
    mandatory_safety_orientation: true,
    safety_orientation_duration_hours: 4,
    require_annual_safety_refresher: true,
    require_equipment_specific_training: true,
    
    // Role Definitions
    stagehand_min_experience_months: 0,
    crew_chief_min_experience_months: 12,
    forklift_operator_min_experience_months: 6,
    truck_driver_min_experience_months: 3,
    
    // Certification Tracking
    auto_notify_expiring_certs: true,
    cert_expiry_warning_days: 30,
    suspend_expired_cert_workers: true,
    require_cert_photo_upload: true,
    
    // Training Providers
    approved_training_providers: [
      'OSHA Training Institute',
      'National Safety Council',
      'Forklift Academy',
      'Commercial Driver Training'
    ],
    
    // Verification Settings
    require_manager_cert_verification: true,
    allow_self_reported_experience: false,
    require_reference_verification: true,
    background_check_provider: 'Sterling Talent Solutions',
    
    // Skill Assessments
    require_practical_skill_test: true,
    skill_test_validity_months: 12,
    allow_skill_test_retakes: true,
    max_skill_test_attempts: 3,
    
    // Documentation
    require_cert_documentation: true,
    accept_digital_certificates: true,
    require_original_documents: false,
    document_retention_years: 7,
  });

  const [customCertifications, setCustomCertifications] = useState([
    { id: 1, name: 'Rigging Certification', required: false, validity_months: 24 },
    { id: 2, name: 'First Aid/CPR', required: true, validity_months: 24 },
    { id: 3, name: 'Confined Space Entry', required: false, validity_months: 12 },
    { id: 4, name: 'Fall Protection', required: true, validity_months: 36 },
  ]);

  useEffect(() => {
    if (settings?.certifications) {
      setFormData(prev => ({
        ...prev,
        ...settings.certifications
      }));
      if (settings.certifications.custom_certifications) {
        setCustomCertifications(settings.certifications.custom_certifications);
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

  const handleCustomCertChange = (id, field, value) => {
    setCustomCertifications(prev => 
      prev.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
    onMarkUnsaved();
  };

  const addCustomCertification = () => {
    const newId = Math.max(...customCertifications.map(c => c.id), 0) + 1;
    setCustomCertifications(prev => [
      ...prev,
      { id: newId, name: '', required: false, validity_months: 12 }
    ]);
    onMarkUnsaved();
  };

  const removeCustomCertification = (id) => {
    setCustomCertifications(prev => prev.filter(cert => cert.id !== id));
    onMarkUnsaved();
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      custom_certifications: customCertifications
    };
    onUpdate('certifications', dataToSave);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Certifications & Roles Settings</h2>
        <p>Configure employee certification requirements, role definitions, and training standards.</p>
      </div>

      {/* Core Certification Requirements */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🎓</span>
          <h3 className="settings-card-title">Core Certification Requirements</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Crew Chief Certification</div>
                <div className="toggle-description">Crew chiefs must have valid certification</div>
              </div>
              <ToggleSwitch
                checked={formData.require_crew_chief_certification}
                onChange={() => handleToggle('require_crew_chief_certification')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Forklift Certification</div>
                <div className="toggle-description">Forklift operators must have valid certification</div>
              </div>
              <ToggleSwitch
                checked={formData.require_forklift_certification}
                onChange={() => handleToggle('require_forklift_certification')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Truck Driver License</div>
                <div className="toggle-description">Truck drivers must have valid commercial license</div>
              </div>
              <ToggleSwitch
                checked={formData.require_truck_driver_license}
                onChange={() => handleToggle('require_truck_driver_license')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Safety Training</div>
                <div className="toggle-description">All employees must complete safety training</div>
              </div>
              <ToggleSwitch
                checked={formData.require_safety_training}
                onChange={() => handleToggle('require_safety_training')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Background Check</div>
                <div className="toggle-description">All employees must pass background check</div>
              </div>
              <ToggleSwitch
                checked={formData.require_background_check}
                onChange={() => handleToggle('require_background_check')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Certification Validity Periods */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📅</span>
          <h3 className="settings-card-title">Certification Validity Periods</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Crew Chief Certification (Months)</label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={formData.crew_chief_cert_validity_months}
              onChange={(e) => handleInputChange('crew_chief_cert_validity_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Forklift Certification (Months)</label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={formData.forklift_cert_validity_months}
              onChange={(e) => handleInputChange('forklift_cert_validity_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Safety Training (Months)</label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={formData.safety_training_validity_months}
              onChange={(e) => handleInputChange('safety_training_validity_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Background Check (Months)</label>
            <input
              type="number"
              min="1"
              max="60"
              className="form-input"
              value={formData.background_check_validity_months}
              onChange={(e) => handleInputChange('background_check_validity_months', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Role Experience Requirements */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⏱️</span>
          <h3 className="settings-card-title">Minimum Experience Requirements</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Stagehand (Months)</label>
            <input
              type="number"
              min="0"
              max="120"
              className="form-input"
              value={formData.stagehand_min_experience_months}
              onChange={(e) => handleInputChange('stagehand_min_experience_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Crew Chief (Months)</label>
            <input
              type="number"
              min="0"
              max="120"
              className="form-input"
              value={formData.crew_chief_min_experience_months}
              onChange={(e) => handleInputChange('crew_chief_min_experience_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Forklift Operator (Months)</label>
            <input
              type="number"
              min="0"
              max="120"
              className="form-input"
              value={formData.forklift_operator_min_experience_months}
              onChange={(e) => handleInputChange('forklift_operator_min_experience_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Truck Driver (Months)</label>
            <input
              type="number"
              min="0"
              max="120"
              className="form-input"
              value={formData.truck_driver_min_experience_months}
              onChange={(e) => handleInputChange('truck_driver_min_experience_months', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Training Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📚</span>
          <h3 className="settings-card-title">Training Requirements</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Mandatory Safety Orientation</div>
                <div className="toggle-description">All new employees must complete safety orientation</div>
              </div>
              <ToggleSwitch
                checked={formData.mandatory_safety_orientation}
                onChange={() => handleToggle('mandatory_safety_orientation')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Safety Orientation Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="40"
              className="form-input"
              value={formData.safety_orientation_duration_hours}
              onChange={(e) => handleInputChange('safety_orientation_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Annual Safety Refresher</div>
                <div className="toggle-description">Require annual safety training refresher</div>
              </div>
              <ToggleSwitch
                checked={formData.require_annual_safety_refresher}
                onChange={() => handleToggle('require_annual_safety_refresher')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Equipment-Specific Training</div>
                <div className="toggle-description">Require training for specific equipment operation</div>
              </div>
              <ToggleSwitch
                checked={formData.require_equipment_specific_training}
                onChange={() => handleToggle('require_equipment_specific_training')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Certifications */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📋</span>
          <h3 className="settings-card-title">Custom Certifications</h3>
        </div>
        <div className="custom-certifications">
          {customCertifications.map((cert) => (
            <div key={cert.id} className="custom-cert-row">
              <input
                type="text"
                className="form-input"
                placeholder="Certification name"
                value={cert.name}
                onChange={(e) => handleCustomCertChange(cert.id, 'name', e.target.value)}
              />
              <input
                type="number"
                className="form-input"
                placeholder="Validity (months)"
                min="1"
                max="120"
                value={cert.validity_months}
                onChange={(e) => handleCustomCertChange(cert.id, 'validity_months', parseInt(e.target.value))}
              />
              <div className="toggle-setting">
                <ToggleSwitch
                  checked={cert.required}
                  onChange={() => handleCustomCertChange(cert.id, 'required', !cert.required)}
                />
                <span className="toggle-label">Required</span>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeCustomCertification(cert.id)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCustomCertification}
          >
            + Add Custom Certification
          </button>
        </div>
      </div>

      {/* Verification Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">✅</span>
          <h3 className="settings-card-title">Verification & Tracking</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Notify Expiring Certifications</div>
                <div className="toggle-description">Automatically notify when certifications are expiring</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_notify_expiring_certs}
                onChange={() => handleToggle('auto_notify_expiring_certs')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Warning (Days)</label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-input"
              value={formData.cert_expiry_warning_days}
              onChange={(e) => handleInputChange('cert_expiry_warning_days', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Suspend Expired Cert Workers</div>
                <div className="toggle-description">Automatically suspend workers with expired certifications</div>
              </div>
              <ToggleSwitch
                checked={formData.suspend_expired_cert_workers}
                onChange={() => handleToggle('suspend_expired_cert_workers')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Certificate Photo Upload</div>
                <div className="toggle-description">Employees must upload photos of their certificates</div>
              </div>
              <ToggleSwitch
                checked={formData.require_cert_photo_upload}
                onChange={() => handleToggle('require_cert_photo_upload')}
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
          {isLoading ? 'Saving...' : 'Save Certifications Settings'}
        </button>
      </div>
    </div>
  );
};

export default CertificationsSettings;
