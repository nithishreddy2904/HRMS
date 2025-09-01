import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuthState } from './redux/authSlice';
import theme from './theme/theme';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Attendance from './components/modules/attendance/Attendance';
import Payslip from './components/modules/payslip/Payslip';
import Payroll from './components/modules/payroll/Payroll';
import SharedSidebar from './components/shared/SharedSidebar';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isInitialized, isLoading } = useSelector((state) => state.auth);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const handleSidebarToggle = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    // Check if user is already authenticated on app load
    console.log('🔄 Checking authentication state on app load...');
    dispatch(checkAuthState());
  }, [dispatch]);

  // Show loading spinner while checking auth state
  if (!isInitialized || isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>Loading HRMS...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {isLoading ? 'Authenticating...' : 'Initializing application...'}
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        {!isAuthPage && isAuthenticated && (
          <SharedSidebar open={sidebarOpen} onToggle={handleSidebarToggle} />
        )}

        {/* Main Content */}
        <div
          style={{
            flexGrow: 1,
            transition: 'margin 0.3s',
            marginLeft: (!isAuthPage && isAuthenticated && sidebarOpen) ? 0 : 0,
            minHeight: '100vh'
          }}
        >
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
            />
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
              path="/payroll"
              element={
                <ProtectedRoute>
                  <Payroll />
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
              path="/"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
