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
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime,
  Receipt,
  AccountBalance,
  Add,
  FilterList,
  Download,
  CheckCircle,
  Cancel,
  Schedule,
  ArrowBack,
  Edit,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  fetchAttendanceRecords, 
  markAttendance, 
  fetchAttendanceStats,
  setSelectedDate
} from '../../../redux/attendanceSlice';

const drawerWidth = 240;

const Attendance = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDateLocal] = useState(dayjs());
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('present');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [notes, setNotes] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { records, stats, isLoading, error } = useSelector((state) => state.attendance);
  const { sidebarCollapsed } = useSelector((state) => state.ui); // Sidebar toggle state available

  useEffect(() => {
    // Fetch attendance records for current month
    const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
    const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
    dispatch(fetchAttendanceRecords({ startDate, endDate }));
    dispatch(fetchAttendanceStats({ 
      month: dayjs().month() + 1, 
      year: dayjs().year() 
    }));
  }, [dispatch]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMarkAttendance = () => {
    const attendanceData = {
      employeeId,
      date: selectedDate.format('YYYY-MM-DD'),
      status,
      checkInTime,
      checkOutTime,
      notes,
    };

    dispatch(markAttendance(attendanceData));
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEmployeeId('');
    setStatus('present');
    setCheckInTime('');
    setCheckOutTime('');
    setNotes('');
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      present: { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      absent: { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> },
      half_day: { color: 'warning', icon: <Schedule sx={{ fontSize: 16 }} /> },
      late: { color: 'info', icon: <Schedule sx={{ fontSize: 16 }} /> },
    };

    const config = statusConfig[status] || statusConfig.present;
    return (
      <Chip
        label={status.replace('_', ' ').toUpperCase()}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Attendance', icon: <AccessTime />, path: '/attendance', active: true },
    { text: 'Payroll', icon: <AccountBalance />, path: '/payroll' },
    { text: 'Payslips', icon: <Receipt />, path: '/payslip' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
              Attendance Management
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
            <Box sx={{ mb: 4,mt: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight={600}>
                Track and manage employee attendance records
              </Typography>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { title: 'Present Days', value: stats.presentDays, color: 'success' },
                { title: 'Absent Days', value: stats.absentDays, color: 'error' },
                { title: 'Half Days', value: stats.halfDays, color: 'warning' },
                { title: 'Late Arrivals', value: stats.lateArrival, color: 'info' },
              ].map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom variant="overline">
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" color={`${stat.color}.main`} fontWeight={600}>
                        {stat.value}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Actions */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                  size="large"
                >
                  Mark Attendance
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                >
                  Filter Records
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                >
                  Export Data
                </Button>
              </Box>
            </Paper>

            {/* Attendance Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record, index) => (
                    <TableRow key={record.id || index} hover>
                      <TableCell>
                        {dayjs(record.date || new Date()).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {record.employeeId || `EMP${String(index + 1).padStart(3, '0')}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.employeeName || `Employee ${index + 1}`}
                        </Typography>
                      </TableCell>
                      <TableCell>{record.checkInTime || '09:00 AM'}</TableCell>
                      <TableCell>{record.checkOutTime || '06:00 PM'}</TableCell>
                      <TableCell>
                        {getStatusChip(record.status || 'present')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {record.totalHours || '9.0'}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          No attendance records found
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Click "Mark Attendance" to add your first record
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>

          {/* Mark Attendance Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              <Typography variant="h6" fontWeight={600}>
                Mark Attendance
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g., EMP001"
                  />
                </Grid>
                <Grid item xs={12}>
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDateLocal(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    maxDate={dayjs()}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="half_day">Half Day</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Check In Time"
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Check Out Time"
                    type="time"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMarkAttendance} 
                variant="contained"
                disabled={!employeeId}
              >
                Save Attendance
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Attendance;