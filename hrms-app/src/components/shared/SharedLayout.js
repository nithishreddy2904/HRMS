import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SharedSidebar from './SharedSidebar';

const SharedLayout = ({ 
  title, 
  subtitle, 
  children, 
  showBackButton = false,
  rightContent = null 
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { sidebarCollapsed } = useSelector((state) => state.ui);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getMainContentWidth = () => {
    if (isMobile) return '100%';
    return sidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - 240px)';
  };

  const getMainContentMarginLeft = () => {
    if (isMobile) return 0;
    return sidebarCollapsed ? '72px' : '240px';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <SharedSidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle} 
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: getMainContentWidth() },
          ml: { sm: getMainContentMarginLeft() },
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: getMainContentWidth() },
            ml: { sm: getMainContentMarginLeft() },
            transition: 'margin-left 0.3s ease, width 0.3s ease',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            {showBackButton && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
            )}
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h1" noWrap component="div">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {rightContent && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {rightContent}
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            mt: 8, // Account for AppBar height
            backgroundColor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)',
            transition: 'all 0.3s ease',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default SharedLayout;
