import React from 'react';
import './RoleRequirementBuilder.css';

const RoleRequirementBuilder = ({ 
  requiredCounts, 
  onCountChange, 
  disabled = false 
}) => {
  const roleTypes = [
    { 
      key: 'crew_chief', 
      label: 'Crew Chief', 
      icon: '👷‍♂️', 
      color: '#dc3545',
      description: 'Lead teams and coordinate operations'
    },
    { 
      key: 'stagehand', 
      label: 'Stagehand', 
      icon: '🔧', 
      color: '#28a745',
      description: 'General labor and equipment handling'
    },
    { 
      key: 'fork_operator', 
      label: 'Forklift Operator', 
      icon: '🚜', 
      color: '#ffc107',
      description: 'Operate forklifts and heavy equipment'
    },
    { 
      key: 'pickup_truck_driver', 
      label: 'Truck Driver', 
      icon: '🚛', 
      color: '#17a2b8',
      description: 'Drive trucks and transport materials'
    }
  ];

  const handleCountChange = (roleKey, value) => {
    const count = parseInt(value, 10);
    onCountChange(roleKey, Math.max(0, count || 0));
  };

  const getTotalWorkers = () => {
    return Object.values(requiredCounts).reduce((sum, count) => sum + (count || 0), 0);
  };

  return (
    <div className="role-requirement-builder">
      <div className="builder-header">
        <h4>Required Workers by Role</h4>
        <div className="total-count">
          Total Workers: <span className="count-badge">{getTotalWorkers()}</span>
        </div>
      </div>
      
      <div className="role-grid">
        {roleTypes.map(role => (
          <div 
            key={role.key} 
            className={`role-card ${(requiredCounts[role.key] || 0) > 0 ? 'active' : ''}`}
            style={{ '--role-color': role.color }}
          >
            <div className="role-header">
              <span className="role-icon">{role.icon}</span>
              <div className="role-info">
                <h5 className="role-title">{role.label}</h5>
                <p className="role-description">{role.description}</p>
              </div>
            </div>
            
            <div className="role-counter">
              <button
                type="button"
                className="counter-btn decrease"
                onClick={() => handleCountChange(role.key, (requiredCounts[role.key] || 0) - 1)}
                disabled={disabled || (requiredCounts[role.key] || 0) <= 0}
              >
                −
              </button>
              
              <input
                type="number"
                className="counter-input"
                min="0"
                max="99"
                value={requiredCounts[role.key] || 0}
                onChange={(e) => handleCountChange(role.key, e.target.value)}
                disabled={disabled}
              />
              
              <button
                type="button"
                className="counter-btn increase"
                onClick={() => handleCountChange(role.key, (requiredCounts[role.key] || 0) + 1)}
                disabled={disabled}
              >
                +
              </button>
            </div>
            
            {(requiredCounts[role.key] || 0) > 0 && (
              <div className="role-summary">
                {requiredCounts[role.key]} {role.label}{requiredCounts[role.key] > 1 ? 's' : ''} needed
              </div>
            )}
          </div>
        ))}
      </div>
      
      {getTotalWorkers() === 0 && (
        <div className="no-workers-warning">
          ⚠️ No workers required. Add at least one worker to create the shift.
        </div>
      )}
    </div>
  );
};

export default RoleRequirementBuilder;
