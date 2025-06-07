// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardRouter from '../components/DashboardRouter';
import Home from '../components/Home';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import ManagerSchedule from '../components/ManagerSchedule/ManagerSchedule';
import ManagerProfile from '../components/ManagerProfile';
import ManagerSettings from '../components/ManagerSettings';
import ManagerJobDashboard from '../components/ManagerJobDashboard';
import ManagerShiftEditor from '../components/ManagerShiftEditor';
import ManagerClientCompaniesPage from '../components/ManagerClientCompaniesPage';
import SignUpManager from '../components/SignUpManager';
import SignUpEmployee from '../components/SignUpEmployee';
import SignUpClient from '../components/SignUpClient';
import EmployeeProfile from '../components/EmployeeProfile';
import SignInShifts from '../components/SignInShifts';
import ManagerViewShiftsRequests from '../components/ManagerViewShiftsRequests';
import ManagerWorkersList from '../components/ManagerWorkersList';
import ShiftsPage from '../components/ShiftsPage';
import EmployeeListPage from '../components/EmployeeListPage';
import CrewChiefDashboard from '../components/CrewChiefDashboard'; // Import the new component
import CrewShiftTimeEntry from '../components/CrewShiftTimeEntry'; // Import the new component
import ManagerTimesheets from '../components/ManagerTimesheets';
import Toolbar from '../components/Toolbar';
import './App.css';

// Removed problematic import and userSession logic for simplification

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toolbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          <Route path="/manager-schedule" element={<ProtectedRoute requireManager={true}><ManagerSchedule /></ProtectedRoute>} />
          <Route path="/manager-profile" element={<ProtectedRoute requireManager={true}><ManagerProfile /></ProtectedRoute>} />
          <Route path="/manager-settings" element={<ProtectedRoute requireManager={true}><ManagerSettings /></ProtectedRoute>} />
          <Route path="/manager-jobs" element={<ProtectedRoute requireManager={true}><ManagerJobDashboard /></ProtectedRoute>} />
          <Route path="/manager-jobs/:jobId/shifts" element={<ProtectedRoute requireManager={true}><ManagerShiftEditor /></ProtectedRoute>} />
          <Route path="/manager-clients" element={<ProtectedRoute requireManager={true}><ManagerClientCompaniesPage /></ProtectedRoute>} />
          <Route path="/signupManager" element={<SignUpManager />} />
          <Route path="/signupEmployee" element={<SignUpEmployee />} />
          <Route path="/signupClient" element={<SignUpClient />} />
          <Route path="/employeeProfile" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/employee-profile" element={<ProtectedRoute><EmployeeProfile /></ProtectedRoute>} />
          <Route path="/signInShifts" element={<ProtectedRoute><SignInShifts /></ProtectedRoute>} />
          <Route path="/managerViewShiftsRequests" element={<ProtectedRoute requireManager={true}><ManagerViewShiftsRequests /></ProtectedRoute>} />
          <Route path="/managerWorkersList" element={<ProtectedRoute requireManager={true}><ManagerWorkersList /></ProtectedRoute>} />
          <Route path="/shiftsPage" element={<ProtectedRoute><ShiftsPage /></ProtectedRoute>} />
          <Route path="/employeeListPage" element={<ProtectedRoute requireManager={true}><EmployeeListPage /></ProtectedRoute>} />
          <Route path="/crew-chief-dashboard" element={<ProtectedRoute><CrewChiefDashboard /></ProtectedRoute>} />
          <Route path="/crew-chief/shift/:shiftId/times" element={<ProtectedRoute><CrewShiftTimeEntry /></ProtectedRoute>} />
          <Route path="/manager-timesheets" element={<ProtectedRoute requireManager={true}><ManagerTimesheets /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
