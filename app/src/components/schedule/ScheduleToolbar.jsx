import React from 'react';
import './ScheduleToolbar.css';

const ScheduleToolbar = ({
  currentView,
  currentDate,
  onViewChange,
  onNavigate,
  onToday,
  onCreateShift,
  onToggleWorkerPanel,
  isWorkerPanelOpen
}) => {
  const formatDateRange = () => {
    switch (currentView) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'week':
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
        } else {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startOfWeek.getFullYear()}`;
        }
      
      case 'month':
        return currentDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        });
      
      default:
        return '';
    }
  };

  const viewButtons = [
    { key: 'day', label: 'Day', icon: '📅' },
    { key: 'week', label: 'Week', icon: '📊' },
    { key: 'month', label: 'Month', icon: '🗓️' }
  ];

  return (
    <div className="schedule-toolbar">
      <div className="toolbar-section toolbar-left">
        <button
          onClick={onToday}
          className="today-button"
        >
          📍 Today
        </button>
        
        <div className="navigation-controls">
          <button
            onClick={() => onNavigate('prev')}
            className="nav-button prev-button"
            title="Previous"
          >
            ◀
          </button>
          
          <div className="date-display">
            {formatDateRange()}
          </div>
          
          <button
            onClick={() => onNavigate('next')}
            className="nav-button next-button"
            title="Next"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="toolbar-section toolbar-center">
        <div className="view-selector">
          {viewButtons.map(button => (
            <button
              key={button.key}
              onClick={() => onViewChange(button.key)}
              className={`view-button ${currentView === button.key ? 'active' : ''}`}
            >
              <span className="view-icon">{button.icon}</span>
              <span className="view-label">{button.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section toolbar-right">
        <button
          onClick={onToggleWorkerPanel}
          className={`panel-toggle-button ${isWorkerPanelOpen ? 'active' : ''}`}
          title={isWorkerPanelOpen ? 'Hide Worker Panel' : 'Show Worker Panel'}
        >
          <span className="panel-icon">👥</span>
          <span className="panel-label">
            {isWorkerPanelOpen ? 'Hide Workers' : 'Show Workers'}
          </span>
        </button>
        
        <button
          onClick={onCreateShift}
          className="create-shift-button"
        >
          <span className="create-icon">➕</span>
          <span className="create-label">New Shift</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleToolbar;
