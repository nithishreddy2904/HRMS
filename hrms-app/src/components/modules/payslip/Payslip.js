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
  IconButton,
  Card,
  CardContent,
  Button,
  TextField,
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
  Divider,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime,
  Receipt,
  AccountBalance,
  Download,
  Visibility,
  Search,
  ArrowBack,
  Print,
  BusinessCenter,
  Person,
  CalendarToday,
  AttachMoney,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchPayslips } from '../../../redux/payrollSlice';

const drawerWidth = 240;

const Payslip = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { payslips, isLoading } = useSelector((state) => state.payroll);
  const { sidebarCollapsed } = useSelector((state) => state.ui); // Sidebar toggle state available

  useEffect(() => {
    dispatch(fetchPayslips({ year: selectedYear }));
  }, [dispatch, selectedYear]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleViewPayslip = (payslip) => {
    console.log('Viewing payslip:', payslip);
    // In a real app, this would open a payslip viewer or navigate to detail page
  };

  const handleDownloadPayslip = (payslipId) => {
    console.log('Downloading payslip:', payslipId);
    // In a real app, this would trigger PDF download
  };

  const handlePrintPayslip = (payslipId) => {
    console.log('Printing payslip:', payslipId);
    // In a real app, this would open print dialog
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Attendance', icon: <AccessTime />, path: '/attendance' },
    { text: 'Payroll', icon: <AccountBalance />, path: '/payroll' },
    { text: 'Payslips', icon: <Receipt />, path: '/payslip', active: true },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Sample payslip data for demonstration
  const samplePayslips = [
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
            variant="h3"
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
            Payslip Management
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
          <Box sx={{ mb: 4, mt: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              View, download, and manage employee payslips
            </Typography>
          </Box>

          {/* Filter Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Search Payslips
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g., EMP001"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Month"
                  >
                    <MenuItem value="">All Months</MenuItem>
                    {months.map((month, index) => (
                      <MenuItem key={index} value={month}>
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
                    onChange={(e) => setSelectedYear(e.target.value)}
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
                  startIcon={<Search />}
                  size="large"
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Payslips',
                value: samplePayslips.length,
                icon: <Receipt sx={{ fontSize: 28 }} />,
                color: 'primary'
              },
              {
                title: 'Current Month',
                value: 'December',
                icon: <CalendarToday sx={{ fontSize: 28 }} />,
                color: 'success'
              },
              {
                title: 'Total Amount',
                value: '₹1,26,700',
                icon: <AttachMoney sx={{ fontSize: 28 }} />,
                color: 'info'
              }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
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

          {/* Payslips Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Month/Year</TableCell>
                  <TableCell>Gross Salary</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {samplePayslips.map((payslip) => (
                  <TableRow key={payslip.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {payslip.employeeName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {payslip.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {payslip.month} {payslip.year}
                      </Typography>
                    </TableCell>
                    <TableCell>₹{payslip.grossSalary.toLocaleString()}</TableCell>
                    <TableCell>₹{payslip.deductions.toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="success.main">
                        ₹{payslip.netSalary.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 2,
                          py: 0.5,
                          bgcolor: 'success.light',
                          color: 'success.dark',
                          borderRadius: 1,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                        }}
                      >
                        {payslip.status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewPayslip(payslip)}
                          color="primary"
                          title="View Payslip"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadPayslip(payslip.id)}
                          color="secondary"
                          title="Download PDF"
                        >
                          <Download fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handlePrintPayslip(payslip.id)}
                          color="info"
                          title="Print Payslip"
                        >
                          <Print fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Sample Payslip Detail View */}
          <Paper sx={{ mt: 4, p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BusinessCenter sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Sample Payslip Detail - John Doe (December 2024)
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
              {/* Employee Information */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                  Employee Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> John Doe
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Employee ID:</strong> EMP001
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Department:</strong> IT
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Designation:</strong> Software Developer
                  </Typography>
                </Box>
              </Grid>

              {/* Pay Period */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                  Pay Period Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Month:</strong> December 2024
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Working Days:</strong> 22
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Present Days:</strong> 20
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Leave Days:</strong> 2
                  </Typography>
                </Box>
              </Grid>

              {/* Salary Breakdown */}
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Salary Breakdown
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Earnings
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Basic Salary: ₹30,000
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        HRA: ₹12,000
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Special Allowance: ₹8,000
                      </Typography>
                      <Divider sx={{ my: 1, bgcolor: 'success.dark' }} />
                      <Typography variant="body1" fontWeight={600}>
                        Gross Salary: ₹50,000
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.dark' }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Deductions
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        PF: ₹3,600
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        ESI: ₹375
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Professional Tax: ₹200
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Income Tax: ₹3,825
                      </Typography>
                      <Divider sx={{ my: 1, bgcolor: 'error.dark' }} />
                      <Typography variant="body1" fontWeight={600}>
                        Total Deductions: ₹8,000
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
                  <Typography variant="h5" fontWeight={600}>
                    Net Salary: ₹42,000
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Amount to be credited to your account
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Payslip;