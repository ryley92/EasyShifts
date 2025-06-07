import React, { useState, useEffect } from 'react';

const SchedulingSettings = ({ settings, onUpdate, onMarkUnsaved, isLoading }) => {
  const [formData, setFormData] = useState({
    shifts_per_day: 2,
    max_workers_per_shift: 10,
    min_workers_per_shift: 1,
    business_start_time: '',
    business_end_time: '',
    default_shift_duration_hours: 8,
    break_duration_minutes: 30,
    closed_days: [],
    operating_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  useEffect(() => {
    if (settings?.scheduling) {
      setFormData({
        shifts_per_day: settings.scheduling.shifts_per_day || 2,
        max_workers_per_shift: settings.scheduling.max_workers_per_shift || 10,
        min_workers_per_shift: settings.scheduling.min_workers_per_shift || 1,
        business_start_time: settings.scheduling.business_start_time ? 
          new Date(settings.scheduling.business_start_time).toTimeString().slice(0, 5) : '',
        business_end_time: settings.scheduling.business_end_time ? 
          new Date(settings.scheduling.business_end_time).toTimeString().slice(0, 5) : '',
        default_shift_duration_hours: settings.scheduling.default_shift_duration_hours || 8,
        break_duration_minutes: settings.scheduling.break_duration_minutes || 30,
        closed_days: settings.scheduling.closed_days || [],
        operating_days: settings.scheduling.operating_days || 
          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      });
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onMarkUnsaved();
  };

  const handleDayToggle = (day, isOperating) => {
    if (isOperating) {
      // Toggle operating day
      const newOperatingDays = formData.operating_days.includes(day)
        ? formData.operating_days.filter(d => d !== day)
        : [...formData.operating_days, day];
      
      // Remove from closed days if adding to operating
      const newClosedDays = newOperatingDays.includes(day)
        ? formData.closed_days.filter(d => d !== day)
        : formData.closed_days;
      
      setFormData(prev => ({
        ...prev,
        operating_days: newOperatingDays,
        closed_days: newClosedDays
      }));
    } else {
      // Toggle closed day
      const newClosedDays = formData.closed_days.includes(day)
        ? formData.closed_days.filter(d => d !== day)
        : [...formData.closed_days, day];
      
      // Remove from operating days if adding to closed
      const newOperatingDays = newClosedDays.includes(day)
        ? formData.operating_days.filter(d => d !== day)
        : formData.operating_days;
      
      setFormData(prev => ({
        ...prev,
        closed_days: newClosedDays,
        operating_days: newOperatingDays
      }));
    }
    onMarkUnsaved();
  };

  const handleSave = () => {
    // Convert time strings to datetime objects if provided
    const dataToSend = { ...formData };
    
    if (formData.business_start_time) {
      const startDate = new Date();
      const [hours, minutes] = formData.business_start_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      dataToSend.business_start_time = startDate.toISOString();
    }
    
    if (formData.business_end_time) {
      const endDate = new Date();
      const [hours, minutes] = formData.business_end_time.split(':');
      endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      dataToSend.business_end_time = endDate.toISOString();
    }
    
    onUpdate('scheduling', dataToSend);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Scheduling Settings</h2>
        <p className="section-description">
          Configure how shifts are scheduled, timing preferences, and operating hours for your workplace.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Shifts Per Day</label>
          <select
            className="form-select"
            value={formData.shifts_per_day}
            onChange={(e) => handleInputChange('shifts_per_day', parseInt(e.target.value))}
          >
            <option value={1}>1 Shift</option>
            <option value={2}>2 Shifts</option>
            <option value={3}>3 Shifts</option>
            <option value={4}>4 Shifts</option>
            <option value={5}>5 Shifts</option>
          </select>
          <p className="form-help">Maximum number of shifts that can be scheduled per day</p>
        </div>

        <div className="form-group">
          <label className="form-label">Default Shift Duration (Hours)</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="24"
            value={formData.default_shift_duration_hours}
            onChange={(e) => handleInputChange('default_shift_duration_hours', parseInt(e.target.value))}
          />
          <p className="form-help">Default length for new shifts</p>
        </div>

        <div className="form-group">
          <label className="form-label">Maximum Workers Per Shift</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="100"
            value={formData.max_workers_per_shift}
            onChange={(e) => handleInputChange('max_workers_per_shift', parseInt(e.target.value))}
          />
          <p className="form-help">Maximum number of workers that can be assigned to a single shift</p>
        </div>

        <div className="form-group">
          <label className="form-label">Minimum Workers Per Shift</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="50"
            value={formData.min_workers_per_shift}
            onChange={(e) => handleInputChange('min_workers_per_shift', parseInt(e.target.value))}
          />
          <p className="form-help">Minimum number of workers required for a shift</p>
        </div>

        <div className="form-group">
          <label className="form-label">Business Start Time</label>
          <input
            type="time"
            className="form-input"
            value={formData.business_start_time}
            onChange={(e) => handleInputChange('business_start_time', e.target.value)}
          />
          <p className="form-help">Default start time for shifts (optional)</p>
        </div>

        <div className="form-group">
          <label className="form-label">Business End Time</label>
          <input
            type="time"
            className="form-input"
            value={formData.business_end_time}
            onChange={(e) => handleInputChange('business_end_time', e.target.value)}
          />
          <p className="form-help">Default end time for shifts (optional)</p>
        </div>

        <div className="form-group">
          <label className="form-label">Break Duration (Minutes)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="480"
            step="15"
            value={formData.break_duration_minutes}
            onChange={(e) => handleInputChange('break_duration_minutes', parseInt(e.target.value))}
          />
          <p className="form-help">Standard break time per shift</p>
        </div>
      </div>

      <div className="form-group full-width">
        <label className="form-label">Operating Days</label>
        <div className="days-grid">
          {daysOfWeek.map(day => (
            <div key={day.value} className="day-selector">
              <div className="day-name">{day.label}</div>
              <div className="day-options">
                <label className="day-option">
                  <input
                    type="radio"
                    name={`${day.value}-status`}
                    checked={formData.operating_days.includes(day.value)}
                    onChange={() => handleDayToggle(day.value, true)}
                  />
                  <span className="option-label operating">Operating</span>
                </label>
                <label className="day-option">
                  <input
                    type="radio"
                    name={`${day.value}-status`}
                    checked={formData.closed_days.includes(day.value)}
                    onChange={() => handleDayToggle(day.value, false)}
                  />
                  <span className="option-label closed">Closed</span>
                </label>
                <label className="day-option">
                  <input
                    type="radio"
                    name={`${day.value}-status`}
                    checked={!formData.operating_days.includes(day.value) && !formData.closed_days.includes(day.value)}
                    onChange={() => {
                      setFormData(prev => ({
                        ...prev,
                        operating_days: prev.operating_days.filter(d => d !== day.value),
                        closed_days: prev.closed_days.filter(d => d !== day.value)
                      }));
                      onMarkUnsaved();
                    }}
                  />
                  <span className="option-label flexible">Flexible</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <p className="form-help">
          Set which days you normally operate. Operating days will be suggested for scheduling, 
          closed days will be avoided, and flexible days can be used as needed.
        </p>
      </div>

      <div className="settings-actions-bottom">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="save-button"
        >
          {isLoading ? 'Saving...' : 'Save Scheduling Settings'}
        </button>
      </div>
    </div>
  );
};

export default SchedulingSettings;
