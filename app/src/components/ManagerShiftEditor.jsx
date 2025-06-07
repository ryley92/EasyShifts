import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../utils';
import ShiftAssignmentRow from './ShiftAssignmentRow'; // Import the new component
// import './ManagerShiftEditor.css'; // To be created later

// Helper to get EmployeeType values - in a real app, this might come from an API or a shared constant
const employeeTypes = [
  { value: 'crew_chief', label: 'Crew Chief' },
  { value: 'stagehand', label: 'Stagehand' },
  { value: 'fork_operator', label: 'Fork Operator' },
  { value: 'pickup_truck_driver', label: 'Pickup Truck Driver' },
  { value: 'general_employee', label: 'General Employee' },
];

const ManagerShiftEditor = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();

  const jobName = location.state?.jobName;
  const clientCompanyId = location.state?.clientCompanyId;

  const [shifts, setShifts] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]); // New state for workers
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for new shift
  const [newShiftDate, setNewShiftDate] = useState('');
  const [newShiftPart, setNewShiftPart] = useState('morning'); // Default to morning
  const [newClientPoNumber, setNewClientPoNumber] = useState('');
  const [newRequiredCounts, setNewRequiredCounts] = useState(
    employeeTypes.reduce((acc, type) => ({ ...acc, [type.value]: 0 }), {})
  );

  const fetchAvailableWorkers = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Potentially set a loading state for workers if needed
      const request = { request_id: 94 }; // GET_ALL_APPROVED_WORKER_DETAILS
      socket.send(JSON.stringify(request));
    }
  }, [socket]);

  const fetchShiftsForJob = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && jobId) {
      setIsLoading(true);
      setError('');
      const request = {
        request_id: 221, // GET_SHIFTS_BY_JOB
        data: { job_id: parseInt(jobId, 10) },
      };
      socket.send(JSON.stringify(request));
    }
  }, [socket, jobId]);

  useEffect(() => {
    if (!jobName || !jobId) {
      // If jobName or jobId is not available (e.g., direct navigation without state), redirect or show error
      console.warn('Job details not found, redirecting or showing error.');
      // navigate('/manager-jobs'); // Or some error page
      setError('Job details are missing. Please navigate from the Job Management page.');
      return;
    }
    fetchShiftsForJob();
    fetchAvailableWorkers();
  }, [jobId, jobName, fetchShiftsForJob, fetchAvailableWorkers, navigate]); // Add fetchAvailableWorkers to dependency array

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        setIsLoading(false);

        if (response.request_id === 221) { // Get Shifts by Job
          if (response.success && Array.isArray(response.data)) {
            setShifts(response.data);
          } else {
            setError(response.error || 'Failed to fetch shifts for this job.');
            setShifts([]);
          }
        } else if (response.request_id === 220) { // Create Shift
          if (response.success && response.data) {
            setSuccessMessage(`Shift created successfully!`);
            setShifts(prevShifts => [...prevShifts, response.data].sort((a, b) => new Date(a.shiftDate) - new Date(b.shiftDate) || a.shiftPart.localeCompare(b.shiftPart)));
            // Reset form
            setNewShiftDate('');
            setNewShiftPart('morning');
            setNewClientPoNumber('');
            setNewRequiredCounts(employeeTypes.reduce((acc, type) => ({ ...acc, [type.value]: 0 }), {}));
            setError('');
          } else {
            setSuccessMessage('');
            setError(response.error || 'Failed to create shift.');
          }
        } else if (response.request_id === 94) { // Get All Approved Worker Details
          if (response.success && Array.isArray(response.data)) {
            setAvailableWorkers(response.data);
          } else {
            setError(response.error || 'Failed to fetch available workers.');
            setAvailableWorkers([]); // Ensure it's an array in case of error
          }
        } else if (response.request_id === 230) { // Assign Worker to Shift
          if (response.success && response.data) {
            const { shiftID, userID, role_assigned } = response.data;
            const workerAssigned = availableWorkers.find(w => w.id === userID);
            if (workerAssigned) {
              setShifts(prevShifts => prevShifts.map(shift => {
                if (shift.id === shiftID) {
                  // Add new worker if not already present (shouldn't be, but good practice)
                  const existingWorkerIndex = shift.workers.findIndex(w => w.id === userID && w.role_assigned === role_assigned);
                  if (existingWorkerIndex === -1) {
                    return {
                      ...shift,
                      workers: [...shift.workers, { id: userID, name: workerAssigned.name, role_assigned }]
                    };
                  }
                }
                return shift;
              }));
              setSuccessMessage(`Worker ${workerAssigned.name} assigned to ${role_assigned.replace('_', ' ')}.`);
            } else {
              // Worker details not found in availableWorkers, might need a refresh or handle error
              setError('Assigned worker details not found, refreshing shifts might be needed.');
              fetchShiftsForJob(); // Optionally refresh all shifts for the job
            }
          } else {
            setError(response.error || 'Failed to assign worker.');
          }
        } else if (response.request_id === 231) { // Unassign Worker from Shift
          if (response.success) {
            // We need to know which shift_id, user_id, and role were involved.
            // This info is not in the success response, so we rely on the UI action's context.
            // For now, we'll assume the success message is enough and a full re-fetch might be simplest
            // or the component initiating the unassign action can provide context for a more targeted update.
            setSuccessMessage(response.message || 'Worker unassigned successfully.');
            fetchShiftsForJob(); // Re-fetch shifts to reflect the unassignment accurately
          } else {
            setError(response.error || 'Failed to unassign worker.');
          }
        }
      } catch (e) {
        setIsLoading(false);
        setError('Error processing server response for shifts.');
        console.error('WebSocket message error in ManagerShiftEditor:', e);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  const handleRequiredCountChange = (role, value) => {
    const count = parseInt(value, 10);
    setNewRequiredCounts(prev => ({
      ...prev,
      [role]: Math.max(0, count) // Ensure count is not negative
    }));
  };

  const handleCreateShiftSubmit = (e) => {
    e.preventDefault();
    if (!newShiftDate || !newShiftPart) {
      setError('Shift date and part are required.');
      return;
    }
    if (socket && socket.readyState === WebSocket.OPEN && jobId) {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      const request = {
        request_id: 220, // CREATE_SHIFT
        data: {
          job_id: parseInt(jobId, 10),
          shiftDate: newShiftDate,
          shiftPart: newShiftPart,
          client_po_number: newClientPoNumber,
          required_employee_counts: newRequiredCounts,
        },
      };
      socket.send(JSON.stringify(request));
    } else {
      setError('WebSocket is not connected or Job ID is missing.');
    }
  };

  const handleAssignWorkerToShiftSlot = (shiftId, userId, role) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true); // Consider a more granular loading state if needed
      const request = {
        request_id: 230, // ASSIGN_WORKER_TO_SHIFT
        data: {
          shift_id: shiftId,
          user_id: userId,
          role_assigned: role, // role is the key like 'crew_chief'
        },
      };
      socket.send(JSON.stringify(request));
    } else {
      setError('WebSocket is not connected.');
    }
  };

  const handleUnassignWorkerFromShiftSlot = (shiftId, userId, role) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoading(true);
      const request = {
        request_id: 231, // UNASSIGN_WORKER_FROM_SHIFT
        data: {
          shift_id: shiftId,
          user_id: userId,
          role_assigned: role,
        },
      };
      socket.send(JSON.stringify(request));
    } else {
      setError('WebSocket is not connected.');
    }
  };
  
  if (!jobName || !jobId) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: Job details not available. Please return to the job management page.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/manager-jobs')} style={{ marginBottom: '20px' }}>&larr; Back to Jobs</button>
      <h2>Manage Shifts for Job: {jobName || `ID ${jobId}`}</h2>
      {clientCompanyId && <p>Client Company ID: {clientCompanyId}</p>}

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green', border: '1px solid green', padding: '10px', borderRadius: '4px' }}>{successMessage}</p>}

      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h3>Create New Shift</h3>
        <form onSubmit={handleCreateShiftSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label htmlFor="newShiftDate" style={{ display: 'block', marginBottom: '5px' }}>Shift Date:</label>
              <input type="date" id="newShiftDate" value={newShiftDate} onChange={(e) => setNewShiftDate(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label htmlFor="newShiftPart" style={{ display: 'block', marginBottom: '5px' }}>Shift Part:</label>
              <select id="newShiftPart" value={newShiftPart} onChange={(e) => setNewShiftPart(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                <option value="morning">Morning</option>
                <option value="noon">Noon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="newClientPoNumber" style={{ display: 'block', marginBottom: '5px' }}>Client PO # (Optional):</label>
              <input type="text" id="newClientPoNumber" value={newClientPoNumber} onChange={(e) => setNewClientPoNumber(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>
          
          <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Required Employee Counts:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {employeeTypes.map(type => (
              <div key={type.value}>
                <label htmlFor={`count-${type.value}`} style={{ display: 'block', marginBottom: '3px', fontSize: '0.9em' }}>{type.label}:</label>
                <input
                  type="number"
                  id={`count-${type.value}`}
                  min="0"
                  value={newRequiredCounts[type.value] || 0}
                  onChange={(e) => handleRequiredCountChange(type.value, e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={isLoading} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? 'Creating Shift...' : 'Create Shift'}
          </button>
        </form>
      </div>

      <h3>Existing Shifts for this Job</h3>
      {isLoading && shifts.length === 0 && <p>Loading shifts...</p>}
      {!isLoading && shifts.length === 0 && !error && <p>No shifts found for this job. Create one above!</p>}
      {shifts.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {shifts.map((shift) => (
            <li key={shift.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '4px', backgroundColor: '#fff' }}>
              <p><strong>Date:</strong> {new Date(shift.shiftDate).toLocaleDateString()} | <strong>Part:</strong> {shift.shiftPart}</p>
              {shift.client_po_number && <p><strong>Client PO #:</strong> {shift.client_po_number}</p>}
              <p><strong>Required Counts:</strong></p>
              <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                {Object.entries(shift.required_employee_counts || {}).map(([role, count]) => 
                  count > 0 && <li key={role}>{role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: {count}</li>
                )}
              </ul>
              <p><strong>Assigned Workers:</strong></p>
              {/* Render ShiftAssignmentRow for each role based on required_employee_counts */}
              {Object.entries(shift.required_employee_counts || {}).map(([roleKey, requiredCount]) => {
                if (requiredCount === 0 && !(shift.workers || []).some(w => w.role_assigned === roleKey)) {
                  return null; // Don't render if 0 required and no one assigned to this role
                }
                const currentRoleLabel = employeeTypes.find(et => et.value === roleKey)?.label || roleKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                const workersForThisRole = (shift.workers || []).filter(worker => worker.role_assigned === roleKey);
                return (
                  <ShiftAssignmentRow
                    key={`${shift.id}-${roleKey}`}
                    shiftId={shift.id}
                    role={roleKey}
                    roleLabel={currentRoleLabel}
                    requiredCount={requiredCount}
                    assignedWorkers={workersForThisRole}
                    availableWorkers={availableWorkers}
                    onAssignWorker={handleAssignWorkerToShiftSlot}
                    onUnassignWorker={handleUnassignWorkerFromShiftSlot}
                    isLoading={isLoading} // Or a more specific loading state for assignments
                  />
                );
              })}
              {/* Fallback for shifts that might have assigned workers but no corresponding required_employee_counts entry (less ideal) */}
              {(shift.workers || []).filter(w => !(shift.required_employee_counts || {}).hasOwnProperty(w.role_assigned)).map(worker => (
                 <div key={`${shift.id}-${worker.id}-${worker.role_assigned}-adhoc`} style={{color: 'orange', fontSize: '0.9em'}}>
                    * Assigned (adhoc): {worker.name} as {worker.role_assigned.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <button onClick={() => handleUnassignWorkerFromShiftSlot(shift.id, worker.id, worker.role_assigned)} style={{marginLeft: '5px'}}>Unassign</button>
                 </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManagerShiftEditor;
