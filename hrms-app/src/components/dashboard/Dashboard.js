import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime,
  Receipt,
  AccountBalance,
  Person,
  Settings,
  ExitToApp,
  Notifications,
  TrendingUp,
  People,
  Today,
  Add,
  Refresh,
  ArrowBack,
} from '@mui/icons-material';
import { logoutUser } from '../../redux/authSlice';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import SharedLayout from '../shared/SharedLayout';


const drawerWidth = 240;
const collapsedWidth = 72;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    handleClose();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', active: true },
    { text: 'Attendance', icon: <AccessTime />, path: '/attendance' },
    { text: 'Payroll', icon: <AccountBalance />, path: '/payroll' },
    { text: 'Payslips', icon: <Receipt />, path: '/payslip' },
  ];

  const statsData = [
    {
      title: 'Total Employees',
      value: '248',
      change: '+12%',
      color: 'primary',
      icon: <People sx={{ fontSize: 28 }} />,
      subtitle: 'Active staff members',
    },
    {
      title: 'Present Today',
      value: '235',
      change: '+2%',
      color: 'success',
      icon: <Today sx={{ fontSize: 28 }} />,
      subtitle: '94.8% attendance rate',
    },
    {
      title: 'Monthly Payroll',
      value: '₹18.5L',
      change: '+8%',
      color: 'info',
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      subtitle: 'December 2024',
    },
    {
      title: 'Pending Tasks',
      value: '12',
      change: '-4%',
      color: 'warning',
      icon: <Notifications sx={{ fontSize: 28 }} />,
      subtitle: 'Require attention',
    },
  ];

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record employee attendance',
      icon: <AccessTime />,
      path: '/attendance',
      color: 'primary',
    },
    {
      title: 'Generate Payroll',
      description: 'Process monthly payroll',
      icon: <AccountBalance />,
      path: '/payroll',
      color: 'success',
    },
    {
      title: 'View Payslips',
      description: 'Access employee payslips',
      icon: <Receipt />,
      path: '/payslip',
      color: 'info',
    },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" noWrap component="div" color="primary" fontWeight={600}>
          HRMS
        </Typography>
      </Toolbar>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              mx: 1,
              borderRadius: 2,
              backgroundColor: item.active ? 'primary.light' : 'transparent',
              color: item.active ? 'primary.dark' : 'text.primary',
              '&:hover': {
                backgroundColor: item.active ? 'primary.light' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ fontWeight: item.active ? 600 : 400 }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <AppBar
        position="fixed"
        sx={{
          height: 100, // Increase header bar height
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
            Dashboard
          </Typography>
          {/* Rightmost icon buttons */}
          <Box sx={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Refresh />
            </IconButton>
            <Badge badgeContent={4} color="error">
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
            </Badge>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
              sx={{ ml: 2 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* Add this for spacing below AppBar */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4,mt: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Here's what's happening with your HR management today.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {statsData.map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <StatsCard {...stat} />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Quick Actions
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                  >
                    Add New
                  </Button>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Frequently used actions for faster workflow
                </Typography>

                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <Paper
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            borderColor: `${action.color}.main`,
                            backgroundColor: `${action.color}.light`,
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          },
                        }}
                        onClick={() => navigate(action.path)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: `${action.color}.light`,
                              color: `${action.color}.main`,
                              mr: 2,
                            }}
                          >
                            {action.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight={500}>
                            {action.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          {action.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/settings')}
                  >
                    View All Features
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <RecentActivity />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;