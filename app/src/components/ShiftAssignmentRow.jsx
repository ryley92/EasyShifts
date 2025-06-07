import React, { useState } from 'react';
import Select from 'react-select';

const ShiftAssignmentRow = ({
  shiftId,
  role, // The key for the role, e.g., 'crew_chief'
  roleLabel, // The display name, e.g., 'Crew Chief'
  requiredCount,
  assignedWorkers, // Array of worker objects { id, name } currently assigned to this role on this shift
  availableWorkers, // Array of all worker objects { id, name, employee_type } for the manager
  onAssignWorker, // Callback: (shiftId, userId, role) => void
  onUnassignWorker, // Callback: (shiftId, userId, role) => void
  isLoading // Boolean to disable controls during operations
}) => {
  const [selectedWorkerToAssign, setSelectedWorkerToAssign] = useState(null);

  const numAssigned = assignedWorkers.length;

  // Filter available workers for the dropdown:
  // - They should not already be assigned to this specific role on this shift.
  // - (Optional, for future enhancement) They should be suitable for the role (e.g., based on worker.employee_type).
  //   For now, we'll list all workers not currently assigned to this specific slot.
  const assignableWorkerOptions = availableWorkers
    .filter(aw => !assignedWorkers.some(sw => sw.id === aw.id))
    .map(worker => ({
      value: worker.id,
      label: `${worker.name} (ID: ${worker.id}, Type: ${worker.employee_type || 'N/A'})`
    }));

  const handleAssignClick = () => {
    if (selectedWorkerToAssign && selectedWorkerToAssign.value) {
      onAssignWorker(shiftId, selectedWorkerToAssign.value, role);
      setSelectedWorkerToAssign(null); // Reset dropdown after assignment
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid #eee'
    }}>
      <div style={{ flex: 1, fontWeight: 'bold' }}>{roleLabel}: {numAssigned}/{requiredCount}</div>
      
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {assignedWorkers.map(worker => (
          <div key={worker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{worker.name} (ID: {worker.id})</span>
            <button
              onClick={() => onUnassignWorker(shiftId, worker.id, role)}
              disabled={isLoading}
              style={{ marginLeft: '10px', padding: '3px 8px', fontSize: '0.8em', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Unassign
            </button>
          </div>
        ))}
      </div>

      <div style={{ flex: 2, marginLeft: '10px' }}>
        {numAssigned < requiredCount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Select
              options={assignableWorkerOptions}
              value={selectedWorkerToAssign}
              onChange={setSelectedWorkerToAssign}
              placeholder="Select worker to assign..."
              isClearable
              isDisabled={isLoading}
              menuPortalTarget={document.body} // Avoids z-index issues with parent elements
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), container: base => ({...base, flexGrow: 1}) }}
            />
            <button
              onClick={handleAssignClick}
              disabled={!selectedWorkerToAssign || isLoading}
              style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
            >
              Assign
            </button>
          </div>
        ) : (
          <span style={{ color: 'green', fontSize: '0.9em' }}>Fully Staffed</span>
        )}
      </div>
    </div>
  );
};

export default ShiftAssignmentRow;
