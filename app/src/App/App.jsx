// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from '../components/Home';
import Login from '../components/Login';
import SignUp from '../components/SignUp';
import ManagerSchedule from '../components/ManagerSchedule/ManagerSchedule';
import ManagerProfile from '../components/ManagerProfile';
import ManagerSettings from '../components/ManagerSettings';
import SignUpManager from '../components/SignUpManager';
import SignUpEmployee from '../components/SignUpEmployee';
import EmployeeProfile from '../components/EmployeeProfile';
import SignInShifts from '../components/SignInShifts';
import ManagerViewShiftsRequests from '../components/ManagerViewShiftsRequests';
import ManagerWorkersList from '../components/ManagerWorkersList';
import ShiftsPage from '../components/ShiftsPage';
import EmployeeListPage from '../components/EmployeeListPage';
import CrewChiefDashboard from '../components/CrewChiefDashboard'; // Import the new component
import CrewShiftTimeEntry from '../components/CrewShiftTimeEntry'; // Import the new component
import Toolbar from '../components/Toolbar';
import './App.css';

// Removed problematic import and userSession logic for simplification

function App() {
  return (
    <Router>
      <div className="App">
        <Toolbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/manager-schedule" element={<ManagerSchedule />} />
          <Route path="/manager-profile" element={<ManagerProfile />} />
          <Route path="/manager-settings" element={<ManagerSettings />} />
          <Route path="/signupManager" element={<SignUpManager />} />
          <Route path="/signupEmployee" element={<SignUpEmployee />} />
          <Route path="/employeeProfile" element={<EmployeeProfile />} />
          <Route path="/signInShifts" element={<SignInShifts />} />
          <Route path="/managerViewShiftsRequests" element={<ManagerViewShiftsRequests />} />
          <Route path="/managerWorkersList" element={<ManagerWorkersList />} />
          <Route path="/shiftsPage" element={<ShiftsPage />} />
          <Route path="/employeeListPage" element={<EmployeeListPage />} />
          <Route path="/crew-chief-dashboard" element={<CrewChiefDashboard />} />
          <Route path="/crew-chief/shift/:shiftId/times" element={<CrewShiftTimeEntry />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
