import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL - change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Skip API call for now - allow any email/password combination
      // Just validate that both fields are provided
      if (!email || !password) {
        return rejectWithValue('Email and password are required');
      }

      // For demo purposes, accept ANY credentials
      const demoToken = 'demo-jwt-token-' + Date.now();
      const demoUser = { 
        id: 1, 
        name: email.split('@')[0] || 'User', // Use email prefix as name
        email: email,
        role: 'admin'
      };
      
      localStorage.setItem('token', demoToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
      
      return { token: demoToken, user: demoUser };
      
    } catch (error) {
      return rejectWithValue('Login failed. Please try again.');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // For demo purposes, just return success
      return { message: 'Registration successful' };
    } catch (error) {
      return rejectWithValue('Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
  return null;
});

// Check if user is authenticated on app load
export const checkAuthState = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Return demo user data
      return { 
        token, 
        user: { 
          id: 1, 
          name: 'Demo User', 
          email: 'demo@hrms.com',
          role: 'admin'
        } 
      };
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Token validation failed');
    }
  }
  return rejectWithValue('No token found');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isInitialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.isInitialized = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { clearError, setCredentials, clearCredentials, setInitialized } = authSlice.actions;
export default authSlice.reducer;
