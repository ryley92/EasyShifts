import React, { useState, useEffect } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const ReportingSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    // Report Generation
    auto_generate_reports: true,
    report_generation_frequency: 'weekly',
    report_generation_day: 'monday',
    report_generation_time: '08:00',
    
    // Data Retention
    keep_timesheet_records_months: 24,
    keep_schedule_history_months: 12,
    keep_employee_records_years: 7,
    keep_client_records_years: 7,
    keep_audit_logs_years: 10,
    
    // Export Formats
    default_export_format: 'xlsx',
    allow_pdf_exports: true,
    allow_csv_exports: true,
    allow_json_exports: false,
    include_charts_in_exports: true,
    
    // Report Distribution
    auto_email_reports: false,
    email_recipients: [],
    include_summary_dashboard: true,
    password_protect_reports: false,
    
    // Analytics & Metrics
    track_employee_performance: true,
    track_client_satisfaction: true,
    track_job_profitability: true,
    track_equipment_utilization: false,
    calculate_labor_efficiency: true,
    
    // Custom Reports
    enable_custom_reports: true,
    max_custom_reports_per_user: 10,
    allow_scheduled_custom_reports: true,
    custom_report_retention_days: 90,
    
    // Data Privacy
    anonymize_employee_data: false,
    exclude_sensitive_fields: true,
    require_approval_for_detailed_reports: false,
    audit_report_access: true,
    
    // Performance Settings
    report_cache_duration_hours: 4,
    max_report_rows: 10000,
    enable_report_pagination: true,
    async_report_generation: true,
  });

  const [reportTemplates, setReportTemplates] = useState([
    {
      id: 1,
      name: 'Weekly Timesheet Summary',
      description: 'Summary of all timesheets for the week',
      frequency: 'weekly',
      enabled: true,
      recipients: ['managers'],
      format: 'xlsx'
    },
    {
      id: 2,
      name: 'Monthly Client Billing',
      description: 'Billing summary for all clients',
      frequency: 'monthly',
      enabled: true,
      recipients: ['managers', 'accounting'],
      format: 'pdf'
    },
    {
      id: 3,
      name: 'Employee Performance Report',
      description: 'Performance metrics for all employees',
      frequency: 'monthly',
      enabled: false,
      recipients: ['managers'],
      format: 'xlsx'
    }
  ]);

  useEffect(() => {
    if (settings?.reporting) {
      setFormData(prev => ({
        ...prev,
        ...settings.reporting
      }));
      if (settings.reporting.report_templates) {
        setReportTemplates(settings.reporting.report_templates);
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

  const handleTemplateToggle = (id) => {
    setReportTemplates(prev => 
      prev.map(template => 
        template.id === id ? { ...template, enabled: !template.enabled } : template
      )
    );
    onMarkUnsaved();
  };

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      report_templates: reportTemplates
    };
    onUpdate('reporting', dataToSave);
  };

  return (
    <div className="settings-section">
      <div className="settings-header">
        <h2>Reporting & Analytics Settings</h2>
        <p>Configure report generation, data retention, analytics tracking, and export preferences.</p>
      </div>

      {/* Report Generation */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📊</span>
          <h3 className="settings-card-title">Report Generation</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Auto-Generate Reports</div>
                <div className="toggle-description">Automatically generate scheduled reports</div>
              </div>
              <ToggleSwitch
                checked={formData.auto_generate_reports}
                onChange={() => handleToggle('auto_generate_reports')}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Generation Frequency</label>
            <select
              className="form-select"
              value={formData.report_generation_frequency}
              onChange={(e) => handleInputChange('report_generation_frequency', e.target.value)}
              disabled={!formData.auto_generate_reports}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Generation Day</label>
            <select
              className="form-select"
              value={formData.report_generation_day}
              onChange={(e) => handleInputChange('report_generation_day', e.target.value)}
              disabled={!formData.auto_generate_reports}
            >
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Generation Time</label>
            <input
              type="time"
              className="form-input"
              value={formData.report_generation_time}
              onChange={(e) => handleInputChange('report_generation_time', e.target.value)}
              disabled={!formData.auto_generate_reports}
            />
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🗄️</span>
          <h3 className="settings-card-title">Data Retention</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Timesheet Records (Months)</label>
            <input
              type="number"
              min="12"
              max="120"
              className="form-input"
              value={formData.keep_timesheet_records_months}
              onChange={(e) => handleInputChange('keep_timesheet_records_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule History (Months)</label>
            <input
              type="number"
              min="6"
              max="60"
              className="form-input"
              value={formData.keep_schedule_history_months}
              onChange={(e) => handleInputChange('keep_schedule_history_months', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Employee Records (Years)</label>
            <input
              type="number"
              min="3"
              max="20"
              className="form-input"
              value={formData.keep_employee_records_years}
              onChange={(e) => handleInputChange('keep_employee_records_years', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Client Records (Years)</label>
            <input
              type="number"
              min="3"
              max="20"
              className="form-input"
              value={formData.keep_client_records_years}
              onChange={(e) => handleInputChange('keep_client_records_years', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Audit Logs (Years)</label>
            <input
              type="number"
              min="5"
              max="25"
              className="form-input"
              value={formData.keep_audit_logs_years}
              onChange={(e) => handleInputChange('keep_audit_logs_years', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Export Formats */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📤</span>
          <h3 className="settings-card-title">Export Formats</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Default Export Format</label>
            <select
              className="form-select"
              value={formData.default_export_format}
              onChange={(e) => handleInputChange('default_export_format', e.target.value)}
            >
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="csv">CSV (.csv)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow PDF Exports</div>
                <div className="toggle-description">Enable PDF export option for reports</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_pdf_exports}
                onChange={() => handleToggle('allow_pdf_exports')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Allow CSV Exports</div>
                <div className="toggle-description">Enable CSV export option for reports</div>
              </div>
              <ToggleSwitch
                checked={formData.allow_csv_exports}
                onChange={() => handleToggle('allow_csv_exports')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Include Charts in Exports</div>
                <div className="toggle-description">Include charts and graphs in exported reports</div>
              </div>
              <ToggleSwitch
                checked={formData.include_charts_in_exports}
                onChange={() => handleToggle('include_charts_in_exports')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Metrics */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📈</span>
          <h3 className="settings-card-title">Analytics & Metrics</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Track Employee Performance</div>
                <div className="toggle-description">Monitor and analyze employee performance metrics</div>
              </div>
              <ToggleSwitch
                checked={formData.track_employee_performance}
                onChange={() => handleToggle('track_employee_performance')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Track Client Satisfaction</div>
                <div className="toggle-description">Monitor client satisfaction and feedback</div>
              </div>
              <ToggleSwitch
                checked={formData.track_client_satisfaction}
                onChange={() => handleToggle('track_client_satisfaction')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Track Job Profitability</div>
                <div className="toggle-description">Calculate and track profitability per job</div>
              </div>
              <ToggleSwitch
                checked={formData.track_job_profitability}
                onChange={() => handleToggle('track_job_profitability')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Calculate Labor Efficiency</div>
                <div className="toggle-description">Analyze labor efficiency and productivity</div>
              </div>
              <ToggleSwitch
                checked={formData.calculate_labor_efficiency}
                onChange={() => handleToggle('calculate_labor_efficiency')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Templates */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">📋</span>
          <h3 className="settings-card-title">Report Templates</h3>
        </div>
        <div className="report-templates">
          {reportTemplates.map((template) => (
            <div key={template.id} className="template-row">
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
                <div className="template-details">
                  <span className="frequency">{template.frequency}</span>
                  <span className="format">{template.format.toUpperCase()}</span>
                  <span className="recipients">{template.recipients.join(', ')}</span>
                </div>
              </div>
              <div className="template-controls">
                <ToggleSwitch
                  checked={template.enabled}
                  onChange={() => handleTemplateToggle(template.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Privacy */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">🔒</span>
          <h3 className="settings-card-title">Data Privacy & Security</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Anonymize Employee Data</div>
                <div className="toggle-description">Remove personally identifiable information from reports</div>
              </div>
              <ToggleSwitch
                checked={formData.anonymize_employee_data}
                onChange={() => handleToggle('anonymize_employee_data')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Exclude Sensitive Fields</div>
                <div className="toggle-description">Exclude sensitive data fields from reports</div>
              </div>
              <ToggleSwitch
                checked={formData.exclude_sensitive_fields}
                onChange={() => handleToggle('exclude_sensitive_fields')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Audit Report Access</div>
                <div className="toggle-description">Log all report access and downloads</div>
              </div>
              <ToggleSwitch
                checked={formData.audit_report_access}
                onChange={() => handleToggle('audit_report_access')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Password Protect Reports</div>
                <div className="toggle-description">Add password protection to exported reports</div>
              </div>
              <ToggleSwitch
                checked={formData.password_protect_reports}
                onChange={() => handleToggle('password_protect_reports')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Settings */}
      <div className="settings-card">
        <div className="settings-card-header">
          <span className="settings-card-icon">⚡</span>
          <h3 className="settings-card-title">Performance Settings</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Report Cache Duration (Hours)</label>
            <input
              type="number"
              min="1"
              max="24"
              className="form-input"
              value={formData.report_cache_duration_hours}
              onChange={(e) => handleInputChange('report_cache_duration_hours', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Max Report Rows</label>
            <input
              type="number"
              min="1000"
              max="100000"
              step="1000"
              className="form-input"
              value={formData.max_report_rows}
              onChange={(e) => handleInputChange('max_report_rows', parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Enable Report Pagination</div>
                <div className="toggle-description">Split large reports into pages</div>
              </div>
              <ToggleSwitch
                checked={formData.enable_report_pagination}
                onChange={() => handleToggle('enable_report_pagination')}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="toggle-setting">
              <div className="toggle-info">
                <div className="toggle-title">Async Report Generation</div>
                <div className="toggle-description">Generate large reports in the background</div>
              </div>
              <ToggleSwitch
                checked={formData.async_report_generation}
                onChange={() => handleToggle('async_report_generation')}
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
          {isLoading ? 'Saving...' : 'Save Reporting Settings'}
        </button>
      </div>
    </div>
  );
};

export default ReportingSettings;
