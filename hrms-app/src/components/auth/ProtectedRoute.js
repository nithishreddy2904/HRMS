import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { BusinessCenter } from '@mui/icons-material';
import { checkAuthState } from '../../redux/authSlice';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isInitialized } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check authentication state on mount if not initialized
    if (!isInitialized) {
      dispatch(checkAuthState());
    }
  }, [dispatch, isInitialized]);

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            borderRadius: 3,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <BusinessCenter 
            sx={{ 
              fontSize: 48, 
              color: 'primary.main', 
              mb: 2 
            }} 
          />
          <Typography 
            variant="h5" 
            color="primary" 
            gutterBottom
            fontWeight={600}
          >
            HRMS
          </Typography>
          <Box sx={{ my: 3 }}>
            <CircularProgress size={40} />
          </Box>
          <Typography variant="body1" color="textSecondary">
            Authenticating...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please wait while we verify your session
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;