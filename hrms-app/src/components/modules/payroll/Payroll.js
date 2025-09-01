import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime,
  Receipt,
  AccountBalance,
  PlayArrow,
  Download,
  ArrowBack,
  Calculate,
  Assignment,
  Refresh,
  TrendingUp,
  People,
  AttachMoney,
  PendingActions,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  fetchPayrollData, 
  generatePayroll, 
  setSelectedMonth, 
  setSelectedYear,
  setProcessingProgress,
  setIsProcessing,
  resetProcessing
} from '../../../redux/payrollSlice';

const Payroll = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { 
    payrollData, 
    isLoading, 
    selectedMonth, 
    selectedYear,
    processingProgress,
    isProcessing,
    sidebarCollapsed
  } = useSelector((state) => state.payroll);

  useEffect(() => {
    dispatch(fetchPayrollData({ 
      month: selectedMonth, 
      year: selectedYear 
    }));
  }, [dispatch, selectedMonth, selectedYear]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleGeneratePayroll = () => {
    dispatch(setIsProcessing(true));
    dispatch(setProcessingProgress(0));

    // Simulate payroll generation progress
    const interval = setInterval(() => {
      dispatch(setProcessingProgress((prev) => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          dispatch(setIsProcessing(false));
          setOpenGenerateDialog(false);
          dispatch(resetProcessing());
          return 100;
        }
        return newProgress;
      }));
    }, 500);

    const payrollData = {
      month: selectedMonth,
      year: selectedYear,
      department: selectedDepartment,
    };

    dispatch(generatePayroll(payrollData));
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      'Processed': { color: 'success', variant: 'filled' },
      'Processing': { color: 'warning', variant: 'filled' },
      'Pending': { color: 'error', variant: 'outlined' },
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <Chip
        label={status}
        color={config.color}
        variant={config.variant}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Sample payroll data for demo
  const samplePayrollData = [
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

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          height: 100,
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          boxShadow: 2,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 100,
            pl: { xs: 10, sm: 20, md: 35 },
            pr: 4,
            position: 'relative',
            justifyContent: 'center',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ position: 'absolute', left: 16, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ position: 'absolute', left: 56 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h1"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: 'white',
              ml: 1,
              textAlign: 'left',
              letterSpacing: 1,
            }}
          >
            Payroll Management
          </Typography>
          {/* Rightmost icon buttons */}
          <Box sx={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Refresh />
            </IconButton>
            {/* Add other icons if needed */}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 1, 
          width: '100%',
          mt: 7, 
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth="xl">
          {/* Page Header */}
          <Box sx={{ mb: 4, mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'   }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Process and manage employee payroll efficiently
            </Typography>
          </Box>

          {/* Control Panel */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Payroll Processing Control
            </Typography>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => dispatch(setSelectedMonth(e.target.value))}
                    label="Month"
                  >
                    {months.map((month, index) => (
                      <MenuItem key={index} value={index + 1}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    onChange={(e) => dispatch(setSelectedYear(e.target.value))}
                    label="Year"
                  >
                    {[2024, 2023, 2022].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => setOpenGenerateDialog(true)}
                  size="large"
                  disabled={isProcessing}
                >
                  Generate Payroll
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  size="large"
                >
                  Export Report
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Employees',
                value: '248',
                icon: <People sx={{ fontSize: 28 }} />,
                color: 'primary'
              },
              {
                title: 'Processed',
                value: '235',
                icon: <TrendingUp sx={{ fontSize: 28 }} />,
                color: 'success'
              },
              {
                title: 'Total Amount',
                value: '₹98.5L',
                icon: <AttachMoney sx={{ fontSize: 28 }} />,
                color: 'info'
              },
              {
                title: 'Pending',
                value: '13',
                icon: <PendingActions sx={{ fontSize: 28 }} />,
                color: 'warning'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" color={`${stat.color}.main`} fontWeight={600}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: `${stat.color}.light`,
                          color: `${stat.color}.main`,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Payroll Processing Status */}
          {isProcessing && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Processing Payroll...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={processingProgress} 
                sx={{ mt: 2, mb: 1, height: 8, borderRadius: 4 }} 
                color="success"
              />
              <Typography variant="body2" color="textSecondary">
                {processingProgress}% Complete - Processing employee data...
              </Typography>
            </Paper>
          )}

          {/* Payroll Data Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Employee Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Allowances</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {samplePayrollData.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {employee.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.employeeName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={employee.department} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>₹{employee.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>₹{employee.allowances.toLocaleString()}</TableCell>
                    <TableCell>₹{employee.deductions.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ₹{employee.netSalary.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(employee.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Calculate fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="secondary">
                          <Assignment fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>

        {/* Generate Payroll Dialog */}
        <Dialog 
          open={openGenerateDialog} 
          onClose={() => setOpenGenerateDialog(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              Generate Payroll
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              This will generate payroll for all employees for the selected month and year.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Department (Optional)</InputLabel>
                  <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    label="Department (Optional)"
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="HR">HR</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Operations">Operations</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
                  <Typography variant="body2" fontWeight={500}>
                    Selected Period: {months[selectedMonth - 1]} {selectedYear}
                  </Typography>
                  <Typography variant="body2">
                    Department: {selectedDepartment || 'All Departments'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenGenerateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGeneratePayroll} 
              variant="contained"
              disabled={isProcessing}
              startIcon={isProcessing ? null : <PlayArrow />}
            >
              {isProcessing ? 'Processing...' : 'Generate Payroll'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Payroll;