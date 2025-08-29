import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '../../redux/uiSlice';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccessTime,
  Receipt,
  AccountBalance,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const SharedSidebar = () => {
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state) => state.ui);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Attendance', icon: <AccessTime />, path: '/attendance' },
    { text: 'Payroll', icon: <AccountBalance />, path: '/payroll' },
    { text: 'Payslips', icon: <Receipt />, path: '/payslip' },
  ];

  const handleToggleSidebar = () => {
    if (!isMobile) {
      dispatch(toggleSidebar());
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const getDrawerWidth = () => {
    if (isMobile) return 240;
    return sidebarCollapsed ? 72 : 240;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Toolbar
        sx={{
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'space-between',
          px: sidebarCollapsed && !isMobile ? 1 : 2,
        }}
      >
        <Collapse in={!sidebarCollapsed || isMobile} orientation="horizontal">
          <Typography variant="h6" noWrap component="div" color="primary" fontWeight={600}>
            HRMS
          </Typography>
        </Collapse>

        {!isMobile && (
          <Tooltip title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
            <Box
              onClick={handleToggleSidebar}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {sidebarCollapsed ? (
                <ChevronRight sx={{ fontSize: 20 }} />
              ) : (
                <ChevronLeft sx={{ fontSize: 20 }} />
              )}
            </Box>
          </Tooltip>
        )}
      </Toolbar>

      {/* Menu Items */}
      <List sx={{ pt: 2, px: 1 }}>
        {menuItems.map((item) => {
          const isActive = isActivePath(item.path);

          return (
            <Tooltip
              key={item.text}
              title={sidebarCollapsed && !isMobile ? item.text : ''}
              placement="right"
            >
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  backgroundColor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.dark' : 'text.primary',
                  minHeight: 48,
                  justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                  px: sidebarCollapsed && !isMobile ? 1.5 : 2,
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.light' : 'action.hover',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: 'inherit',
                    minWidth: sidebarCollapsed && !isMobile ? 0 : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <Collapse in={!sidebarCollapsed || isMobile} orientation="horizontal">
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      fontSize: '0.9rem',
                    }}
                    sx={{ ml: sidebarCollapsed && !isMobile ? 0 : 1 }}
                  />
                </Collapse>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Footer */}
      {(!sidebarCollapsed || isMobile) && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="textSecondary" align="center" display="block">
            HRMS v1.0.0
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: getDrawerWidth() },
        flexShrink: { sm: 0 },
        transition: 'width 0.3s ease',
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: getDrawerWidth(),
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default SharedSidebar;
