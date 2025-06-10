import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const JobConfigurationSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Job Templates
    enable_job_templates: true,
    default_job_duration_hours: 8,
    allow_multi_day_jobs: true,
    max_job_duration_days: 30,
    
    // Shift Configuration
    default_shift_duration_hours: 8,
    min_shift_duration_hours: 2,
    max_shift_duration_hours: 16,
    allow_split_shifts: true,
    break_duration_minutes: 30,
    lunch_break_duration_minutes: 60,
    max_breaks_per_shift: 3,
    
    // Role Requirements
    require_crew_chief_per_shift: true,
    max_workers_per_crew_chief: 8,
    allow_role_upgrades_during_shift: true,
    require_role_certification_verification: true,
    
    // Location Management
    require_job_location: true,
    allow_multiple_locations_per_job: false,
    require_location_coordinates: true,
    default_setup_time_minutes: 30,
    default_teardown_time_minutes: 30,
    
    // Equipment & Resources
    track_equipment_usage: true,
    require_equipment_checkout: false,
    allow_equipment_requests: true,
    require_safety_equipment: true,
    
    // Scheduling Rules
    min_notice_hours_new_jobs: 24,
    max_advance_scheduling_days: 90,
    allow_overlapping_shifts: false,
    require_rest_period_between_shifts: true,
    min_rest_period_hours: 8,
    
    // Worker Assignment
    auto_assign_workers: false,
    assignment_priority: 'seniority', // seniority, availability, skills, random
    allow_worker_preferences: true,
    respect_worker_availability: true,
    
    // Job Status Management
    auto_activate_jobs: false,
    require_manager_approval: true,
    allow_job_modifications_after_approval: false,
    auto_close_completed_jobs: true,
    
    // Quality Control
    require_job_photos: true,
    require_completion_checklist: false,
    require_client_sign_off: false,
    track_job_performance_metrics: true,
    
    // Emergency Procedures
    require_emergency_contact_info: true,
    require_safety_briefing: true,
    emergency_evacuation_procedures: true,
    incident_reporting_required: true,
  });

  const [jobTemplates, setJobTemplates] = useState([
    {
      id: 1,
      name: 'Stage Setup',
      description: 'Standard stage setup and teardown',
      duration_hours: 8,
      required_roles: {
        crew_chief: 1,
        stagehand: 6,
        forklift_operator: 1,
        truck_driver: 1
      },
      equipment: ['Forklifts', 'Hand Tools', 'Safety Equipment'],
      default_location_type: 'venue'
    },
    {
      id: 2,
      name: 'Trade Show Setup',
      description: 'Trade show booth setup and breakdown',
      duration_hours: 6,
      required_roles: {
        crew_chief: 1,
        stagehand: 4,
        forklift_operator: 0,
        truck_driver: 0
      },
      equipment: ['Hand Tools', 'Safety Equipment'],
      default_location_type: 'convention_center'
    }
  ]);

  const [equipmentCategories, setEquipmentCategories] = useState([
    { id: 1, name: 'Forklifts', required_certification: true, checkout_required: true },
    { id: 2, name: 'Hand Tools', required_certification: false, checkout_required: false },
    { id: 3, name: 'Safety Equipment', required_certification: false, checkout_required: true },
    { id: 4, name: 'Rigging Equipment', required_certification: true, checkout_required: true },
  ]);

  useEffect(() => {
    if (settings?.job_configuration) {
      setFormData(prev => ({
        ...prev,
        ...settings.job_configuration
      }));
      if (settings.job_configuration.job_templates) {
        setJobTemplates(settings.job_configuration.job_templates);
      }
      if (settings.job_configuration.equipment_categories) {
        setEquipmentCategories(settings.job_configuration.equipment_categories);
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

  const handleTemplateChange = (id, field, value) => {
    setJobTemplates(prev => 
      prev.map(template => 
        template.id === id ? { ...template, [field]: value } : template
      )
    );
    onMarkUnsaved();
  };

  const handleTemplateRoleChange = (id, role, count) => {
    setJobTemplates(prev => 
      prev.map(template => 
        template.id === id 
          ? { ...template, required_roles: { ...template.required_roles, [role]: count } }
          : template
      )
    );
    onMarkUnsaved();
  };

  const addJobTemplate = () => {
    const newId = Math.max(...jobTemplates.map(t => t.id), 0) + 1;
    setJobTemplates(prev => [
      ...prev,
      {
        id: newId,
        name: '',
        description: '',
        duration_hours: 8,
        required_roles: {
          crew_chief: 1,
          stagehand: 4,
          forklift_operator: 0,
          truck_driver: 0
        },
        equipment: [],
        default_location_type: 'venue'
      }
    ]);
    onMarkUnsaved();
  };

  const removeJobTemplate = (id) => {
    setJobTemplates(prev => prev.filter(template => template.id !== id));
    onMarkUnsaved();
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      job_templates: jobTemplates,
      equipment_categories: equipmentCategories
    };
    onUpdate('job-configuration', dataToSave);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Job & Shift Configuration Settings</h2>
        <p>Configure job templates, shift requirements, location management, and scheduling rules.</p>
      </div>

      {/* Basic Job Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⚙️</span>
          <h3 className="settings-card-title">Basic Job Settings</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Job Templates</div>
                <div className="toggle-description">Use predefined job templates for quick setup</div>
              </div>
              <ToggleSwitch
                checked={formData.enable_job_templates}
                onChange={() => handleToggle('enable_job_templates')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Default Job Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className="form-input"
              value={formData.default_job_duration_hours}
              onChange={(e) => handleInputChange('default_job_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Multi-Day Jobs</div>
                <div className="toggle-description">Jobs can span multiple days</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_multi_day_jobs}
                onChange={() => handleToggle('allow_multi_day_jobs')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Max Job Duration (Days)</label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-input"
              value={formData.max_job_duration_days}
              onChange={(e) => handleInputChange('max_job_duration_days', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Shift Configuration */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🕐</span>
          <h3 className="settings-card-title">Shift Configuration</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Default Shift Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className="form-input"
              value={formData.default_shift_duration_hours}
              onChange={(e) => handleInputChange('default_shift_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Shift Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="12"
              className="form-input"
              value={formData.min_shift_duration_hours}
              onChange={(e) => handleInputChange('min_shift_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Shift Duration (Hours)</label>
            <input
              type="number"
              min="8"
              max="24"
              className="form-input"
              value={formData.max_shift_duration_hours}
              onChange={(e) => handleInputChange('max_shift_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Split Shifts</div>
                <div className="toggle-description">Workers can have multiple shifts in one day</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_split_shifts}
                onChange={() => handleToggle('allow_split_shifts')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Break Duration (Minutes)</label>
            <input
              type="number"
              min="15"
              max="60"
              className="form-input"
              value={formData.break_duration_minutes}
              onChange={(e) => handleInputChange('break_duration_minutes', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lunch Break Duration (Minutes)</label>
            <input
              type="number"
              min="30"
              max="120"
              className="form-input"
              value={formData.lunch_break_duration_minutes}
              onChange={(e) => handleInputChange('lunch_break_duration_minutes', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Role Requirements */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">👥</span>
          <h3 className="settings-card-title">Role Requirements</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Crew Chief Per Shift</div>
                <div className="toggle-description">Every shift must have at least one crew chief</div>
              </div>
              <ToggleSwitch
                checked={formData.require_crew_chief_per_shift}
                onChange={() => handleToggle('require_crew_chief_per_shift')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Max Workers Per Crew Chief</label>
            <input
              type="number"
              min="1"
              max="20"
              className="form-input"
              value={formData.max_workers_per_crew_chief}
              onChange={(e) => handleInputChange('max_workers_per_crew_chief', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Role Upgrades During Shift</div>
                <div className="toggle-description">Workers can be upgraded to higher roles during shifts</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_role_upgrades_during_shift}
                onChange={() => handleToggle('allow_role_upgrades_during_shift')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Role Certification Verification</div>
                <div className="toggle-description">Verify certifications before assigning specialized roles</div>
              </div>
              <ToggleSwitch
                checked={formData.require_role_certification_verification}
                onChange={() => handleToggle('require_role_certification_verification')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Management */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📍</span>
          <h3 className="settings-card-title">Location Management</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Job Location</div>
                <div className="toggle-description">All jobs must have a specified location</div>
              </div>
              <ToggleSwitch
                checked={formData.require_job_location}
                onChange={() => handleToggle('require_job_location')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Multiple Locations Per Job</div>
                <div className="toggle-description">Jobs can have multiple work locations</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_multiple_locations_per_job}
                onChange={() => handleToggle('allow_multiple_locations_per_job')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Location Coordinates</div>
                <div className="toggle-description">GPS coordinates required for all job locations</div>
              </div>
              <ToggleSwitch
                checked={formData.require_location_coordinates}
                onChange={() => handleToggle('require_location_coordinates')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Default Setup Time (Minutes)</label>
            <input
              type="number"
              min="0"
              max="240"
              className="form-input"
              value={formData.default_setup_time_minutes}
              onChange={(e) => handleInputChange('default_setup_time_minutes', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Default Teardown Time (Minutes)</label>
            <input
              type="number"
              min="0"
              max="240"
              className="form-input"
              value={formData.default_teardown_time_minutes}
              onChange={(e) => handleInputChange('default_teardown_time_minutes', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Scheduling Rules */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📅</span>
          <h3 className="settings-card-title">Scheduling Rules</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Min Notice for New Jobs (Hours)</label>
            <input
              type="number"
              min="1"
              max="168"
              className="form-input"
              value={formData.min_notice_hours_new_jobs}
              onChange={(e) => handleInputChange('min_notice_hours_new_jobs', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Advance Scheduling (Days)</label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-input"
              value={formData.max_advance_scheduling_days}
              onChange={(e) => handleInputChange('max_advance_scheduling_days', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow Overlapping Shifts</div>
                <div className="toggle-description">Workers can have overlapping shift assignments</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_overlapping_shifts}
                onChange={() => handleToggle('allow_overlapping_shifts')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Require Rest Period Between Shifts</div>
                <div className="toggle-description">Enforce minimum rest time between shifts</div>
              </div>
              <ToggleSwitch
                checked={formData.require_rest_period_between_shifts}
                onChange={() => handleToggle('require_rest_period_between_shifts')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Min Rest Period (Hours)</label>
            <input
              type="number"
              min="4"
              max="24"
              className="form-input"
              value={formData.min_rest_period_hours}
              onChange={(e) => handleInputChange('min_rest_period_hours', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Job Templates */}
      {formData.enable_job_templates && (
        <div className="settings-card">
          <div className="settings-card-header">
            <span className="settings-card-icon">📋</span>
            <h3 className="settings-card-title">Job Templates</h3>
          </div>
          <div className="job-templates">
            {jobTemplates.map((template) => (
              <div key={template.id} className="job-template-row">
                <div className="template-basic-info">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Template name"
                    value={template.name}
                    onChange={(e) => handleTemplateChange(template.id, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description"
                    value={template.description}
                    onChange={(e) => handleTemplateChange(template.id, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Duration (hours)"
                    min="1"
                    max="24"
                    value={template.duration_hours}
                    onChange={(e) => handleTemplateChange(template.id, 'duration_hours', parseInt(e.target.value))}
                  />
                </div>
                <div className="template-roles">
                  <label>Crew Chief:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={template.required_roles.crew_chief}
                    onChange={(e) => handleTemplateRoleChange(template.id, 'crew_chief', parseInt(e.target.value))}
                  />
                  <label>Stagehand:</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={template.required_roles.stagehand}
                    onChange={(e) => handleTemplateRoleChange(template.id, 'stagehand', parseInt(e.target.value))}
                  />
                  <label>Forklift:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={template.required_roles.forklift_operator}
                    onChange={(e) => handleTemplateRoleChange(template.id, 'forklift_operator', parseInt(e.target.value))}
                  />
                  <label>Truck Driver:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={template.required_roles.truck_driver}
                    onChange={(e) => handleTemplateRoleChange(template.id, 'truck_driver', parseInt(e.target.value))}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeJobTemplate(template.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addJobTemplate}
            >
              + Add Job Template
            </button>
          </div>
        </div>
      )}

      <div className="settings-actions">
        <button 
          onClick={handleSave} 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Job Configuration Settings'}
        </button>
      </div>
    </div>
  );
};

export default JobConfigurationSettings;
