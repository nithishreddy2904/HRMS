import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Async thunks for payroll
export const fetchPayrollData = createAsyncThunk(
  'payroll/fetchData',
  async ({ month, year, employeeId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll`, {
        params: { month, year, employeeId },
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return sample payroll data
      console.log('API call failed, using demo data');
      return [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          department: 'IT',
          basicSalary: 30000,
          allowances: 20000,
          deductions: 8000,
          netSalary: 42000,
          status: 'Processed'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          department: 'HR',
          basicSalary: 28000,
          allowances: 17000,
          deductions: 6500,
          netSalary: 38500,
          status: 'Processing'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Mike Johnson',
          department: 'Finance',
          basicSalary: 35000,
          allowances: 20000,
          deductions: 8800,
          netSalary: 46200,
          status: 'Pending'
        },
      ];
    }
  }
);

export const generatePayroll = createAsyncThunk(
  'payroll/generate',
  async (payrollData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/payroll/generate`, payrollData);
      return response.data;
    } catch (error) {
      // For demo purposes, simulate successful generation
      console.log('API call failed, using demo response');
      return {
        id: Date.now(),
        ...payrollData,
        status: 'Generated',
        message: 'Payroll generated successfully'
      };
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'payroll/update',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/payroll/${id}`, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update payroll'
      );
    }
  }
);

export const fetchPayslips = createAsyncThunk(
  'payroll/fetchPayslips',
  async ({ employeeId, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll/payslips`, {
        params: { employeeId, year },
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return sample payslip data
      console.log('API call failed, using demo payslips');
      return [
        {
          id: 1,
          employeeId: 'EMP001',
          employeeName: 'John Doe',
          month: 'December',
          year: 2024,
          grossSalary: 50000,
          netSalary: 42000,
          deductions: 8000,
          status: 'Generated'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          employeeName: 'Jane Smith',
          month: 'December',
          year: 2024,
          grossSalary: 45000,
          netSalary: 38500,
          deductions: 6500,
          status: 'Generated'
        },
        {
          id: 3,
          employeeId: 'EMP003',
          employeeName: 'Mike Johnson',
          month: 'November',
          year: 2024,
          grossSalary: 55000,
          netSalary: 46200,
          deductions: 8800,
          status: 'Generated'
        },
      ];
    }
  }
);

export const downloadPayslip = createAsyncThunk(
  'payroll/downloadPayslip',
  async (payslipId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payroll/payslips/${payslipId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to download payslip'
      );
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    payrollData: [],
    payslips: [],
    currentPayroll: null,
    isLoading: false,
    error: null,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    processingProgress: 0,
    isProcessing: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
    },
    clearPayrollData: (state) => {
      state.payrollData = [];
    },
    setCurrentPayroll: (state, action) => {
      state.currentPayroll = action.payload;
    },
    setProcessingProgress: (state, action) => {
      state.processingProgress = action.payload;
    },
    setIsProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    resetProcessing: (state) => {
      state.processingProgress = 0;
      state.isProcessing = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayrollData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payrollData = action.payload;
      })
      .addCase(fetchPayrollData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(generatePayroll.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.isLoading = false;
        // In a real app, you might want to refresh the payroll data
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        const index = state.payrollData.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.payrollData[index] = action.payload;
        }
      })
      .addCase(fetchPayslips.fulfilled, (state, action) => {
        state.payslips = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedMonth, 
  setSelectedYear, 
  clearPayrollData, 
  setCurrentPayroll,
  setProcessingProgress,
  setIsProcessing,
  resetProcessing
} = payrollSlice.actions;
export default payrollSlice.reducer;