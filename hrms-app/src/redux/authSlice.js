import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL - connects to your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to add auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      // Redirect to login would happen here in a real app
    }
    return Promise.reject(error);
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('✅ Login response:', response.data);
      
      const { accessToken, user } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('✅ Login successful for user:', user.name);
      
      return { token: accessToken, user };
      
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    }
  }
);

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      console.log('✅ Registration response:', response.data);
      
      const { accessToken, user } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      console.log('✅ Registration successful for user:', user.name);
      
      return { token: accessToken, user };
      
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    // Try to call logout endpoint
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      console.log('✅ Logout API call successful');
    } catch (error) {
      // Continue with logout even if API call fails
      console.log('⚠️ Logout API call failed, but continuing with client logout');
    }
    
    // Remove token from storage and axios headers
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    console.log('✅ Logout completed successfully');
    
    return null;
  } catch (error) {
    console.error('❌ Logout error:', error);
    return null;
  }
});

// Check authentication state on app load
export const checkAuthState = createAsyncThunk(
  'auth/checkAuth', 
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('ℹ️ No token found in localStorage');
      return rejectWithValue('No token found');
    }
    
    try {
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token with backend
      console.log('🔍 Verifying token with backend...');
      const response = await axios.get(`${API_BASE_URL}/auth/profile`);
      const user = response.data.data.user;
      
      console.log('✅ Token verified successfully for user:', user.name);
      
      return { token, user };
      
    } catch (error) {
      console.error('❌ Token verification failed:', error.response?.data);
      
      // Remove invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      return rejectWithValue('Token validation failed');
    }
  }
);

// Auth slice
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
      // Login cases
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
      
      // Registration cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isInitialized = true;
      })
      
      // Check auth state cases
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
