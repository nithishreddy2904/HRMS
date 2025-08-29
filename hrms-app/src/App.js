import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Attendance from './components/modules/attendance/Attendance';
import Payslip from './components/modules/payslip/Payslip';
import Payroll from './components/modules/payroll/Payroll';
import SharedSidebar from './components/shared/SharedSidebar';
import './App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App" style={{ display: 'flex' }}>
        {!isLoginPage && <SharedSidebar />}
        <div style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payslip"
              element={
                <ProtectedRoute>
                  <Payslip />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;