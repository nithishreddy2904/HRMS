
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../api/apiService';

// Async thunk to fetch attendance records
export const fetchAttendanceRecords = createAsyncThunk(
  'attendance/fetchRecords',
  async (params, { rejectWithValue, getState }) => {
    try {
      console.log('📊 Fetching attendance records:', params);

      const response = await apiService.attendance.getRecords(params);

      console.log('✅ Attendance records fetched:', response.data.data);
      return response.data.data;

    } catch (error) {
      console.error('❌ Fetch attendance records failed:', error.response?.data);

      // Handle different error types
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to view attendance records.');
      } else if (error.response?.status === 404) {
        return rejectWithValue('No attendance records found.');
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        return rejectWithValue('Network error. Please check your connection.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance records'
      );
    }
  }
);

// Async thunk to fetch attendance statistics
export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      console.log('📈 Fetching attendance stats:', params);

      const response = await apiService.attendance.getStats(params);

      console.log('✅ Attendance stats fetched:', response.data.data);
      return response.data.data;

    } catch (error) {
      console.error('❌ Fetch attendance stats failed:', error.response?.data);

      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to view attendance statistics.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch attendance statistics'
      );
    }
  }
);

// Async thunk to mark attendance
export const markAttendance = createAsyncThunk(
  'attendance/markAttendance',
  async (attendanceData, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log('✅ Marking attendance:', attendanceData);

      // Validate required fields
      if (!attendanceData.date) {
        return rejectWithValue('Date is required');
      }
      if (!attendanceData.status) {
        return rejectWithValue('Status is required');
      }

      const response = await apiService.attendance.markAttendance(attendanceData);

      console.log('✅ Attendance marked successfully:', response.data);

      // Optionally refresh attendance records after successful mark
      // dispatch(fetchAttendanceRecords());

      return response.data.data;

    } catch (error) {
      console.error('❌ Mark attendance failed:', error.response?.data);

      if (error.response?.status === 400) {
        return rejectWithValue(
          error.response.data?.message || 'Invalid attendance data provided'
        );
      } else if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to mark attendance.');
      } else if (error.response?.status === 409) {
        return rejectWithValue('Attendance already exists for this date.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark attendance'
      );
    }
  }
);

// Async thunk to update attendance
export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      console.log('📝 Updating attendance:', { id, attendanceData });

      const response = await apiService.attendance.updateAttendance(id, attendanceData);

      console.log('✅ Attendance updated successfully:', response.data);
      return response.data.data;

    } catch (error) {
      console.error('❌ Update attendance failed:', error.response?.data);

      if (error.response?.status === 404) {
        return rejectWithValue('Attendance record not found.');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to update this attendance record.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to update attendance'
      );
    }
  }
);

// Async thunk to delete attendance
export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting attendance:', id);

      await apiService.attendance.deleteAttendance(id);

      console.log('✅ Attendance deleted successfully');
      return id; // Return the deleted ID

    } catch (error) {
      console.error('❌ Delete attendance failed:', error.response?.data);

      if (error.response?.status === 404) {
        return rejectWithValue('Attendance record not found.');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to delete this attendance record.');
      }

      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete attendance'
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
    filters: {
      startDate: null,
      endDate: null,
      employeeId: null,
      status: null
    },
    pagination: {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false
    },
    lastFetch: null, // Track when data was last fetched
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
      state.pagination = {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      };
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearFilters: (state) => {
      state.filters = {
        startDate: null,
        endDate: null,
        employeeId: null,
        status: null
      };
    },

    setAttendance: (state, action) => {
      state.records = action.payload;
      state.error = null;
      state.isLoading = false;
      state.lastFetch = new Date().toISOString();
    },

    setAttendanceError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setAttendanceLoading: (state, action = { payload: true }) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null; // Clear previous errors when starting new request
      }
    },

    // Add new attendance record to the list
    addAttendanceRecord: (state, action) => {
      state.records.unshift(action.payload);
      state.pagination.total += 1;
    },

    // Update existing attendance record
    updateAttendanceRecord: (state, action) => {
      const index = state.records.findIndex(record => record.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },

    // Remove attendance record
    removeAttendanceRecord: (state, action) => {
      state.records = state.records.filter(record => record.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
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
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
        state.lastFetch = new Date().toISOString();
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch attendance stats
      .addCase(fetchAttendanceStats.pending, (state) => {
        // Don't set loading for stats to avoid UI flickering
      })
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats || state.stats;
      })
      .addCase(fetchAttendanceStats.rejected, (state, action) => {
        // Stats failure shouldn't block the main UI
        console.warn('Failed to fetch attendance stats:', action.payload);
      })

      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new record to the beginning of the list
        if (action.payload) {
          state.records.unshift(action.payload);
          state.pagination.total += 1;
        }
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update existing record in the list
        const index = state.records.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove record from the list
        state.records = state.records.filter(record => record.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedDate,
  clearRecords,
  setFilters,
  clearFilters,
  setAttendance,
  setAttendanceError,
  setAttendanceLoading,
  addAttendanceRecord,
  updateAttendanceRecord,
  removeAttendanceRecord
} = attendanceSlice.actions;

export default attendanceSlice.reducer;

// Selectors
export const selectAttendanceRecords = (state) => state.attendance.records;
export const selectAttendanceStats = (state) => state.attendance.stats;
export const selectAttendanceLoading = (state) => state.attendance.isLoading;
export const selectAttendanceError = (state) => state.attendance.error;
export const selectAttendanceFilters = (state) => state.attendance.filters;
export const selectAttendancePagination = (state) => state.attendance.pagination;
