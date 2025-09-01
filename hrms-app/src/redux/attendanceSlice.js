import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunk to fetch attendance records
export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async ({ startDate, endDate, employeeId, status }, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching attendance records:', { startDate, endDate });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (employeeId) params.append('employeeId', employeeId);
      if (status) params.append('status', status);
      
      const response = await axios.get(`${API_BASE_URL}/attendance?${params}`);
      
      console.log('✅ Attendance records fetched:', response.data.data);
      return response.data.data;
      
    } catch (error) {
      console.error('❌ Fetch attendance records failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance records'
      );
    }
  }
);

// Async thunk to fetch attendance statistics
export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchStats',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      console.log('📈 Fetching attendance stats:', { month, year });
      
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const response = await axios.get(`${API_BASE_URL}/attendance/stats?${params}`);
      
      console.log('✅ Attendance stats fetched:', response.data.data);
      return response.data.data;
      
    } catch (error) {
      console.error('❌ Fetch attendance stats failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance statistics'
      );
    }
  }
);

// Async thunk to mark attendance
export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      console.log('✅ Marking attendance:', attendanceData);
      
      const response = await axios.post(`${API_BASE_URL}/attendance`, attendanceData);
      
      console.log('✅ Attendance marked successfully:', response.data);
      return response.data.data;
      
    } catch (error) {
      console.error('❌ Mark attendance failed:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark attendance'
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    stats: {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      halfDays: 0,
      lateArrival: 0,
      totalHours: 0,
      totalOvertime: 0
    },
    isLoading: false,
    error: null,
    selectedDate: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    clearRecords: (state) => {
      state.records = [];
    },
    setAttendance(state, action) {
      state.records = action.payload;
      state.error = null;
      state.isLoading = false;
    },
    setAttendanceError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAttendanceLoading(state) {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch attendance records
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload.records || [];
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch attendance stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Optionally add the new record to the list
        // state.records.unshift(action.payload);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelectedDate, clearRecords, setAttendance, setAttendanceError, setAttendanceLoading } = attendanceSlice.actions;
export default attendanceSlice.reducer;
