import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import {
  AccessTime,
  AccountBalance,
  Receipt,
  Person,
  MoreVert,
  FiberManualRecord,
} from '@mui/icons-material';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      action: 'Attendance marked',
      user: 'John Doe',
      time: '2 minutes ago',
      icon: <AccessTime />,
      color: 'primary',
      type: 'success',
    },
    {
      id: 2,
      action: 'Payroll generated',
      user: 'HR Admin',
      time: '1 hour ago',
      icon: <AccountBalance />,
      color: 'success',
      type: 'info',
    },
    {
      id: 3,
      action: 'Payslip downloaded',
      user: 'Jane Smith',
      time: '2 hours ago',
      icon: <Receipt />,
      color: 'info',
      type: 'warning',
    },
    {
      id: 4,
      action: 'New employee added',
      user: 'HR Admin',
      time: '3 hours ago',
      icon: <Person />,
      color: 'warning',
      type: 'success',
    },
    {
      id: 5,
      action: 'Attendance updated',
      user: 'Mike Wilson',
      time: '4 hours ago',
      icon: <AccessTime />,
      color: 'primary',
      type: 'info',
    },
    {
      id: 6,
      action: 'Leave request approved',
      user: 'Sarah Connor',
      time: '5 hours ago',
      icon: <Person />,
      color: 'success',
      type: 'success',
    },
  ];

  const getStatusColor = (type) => {
    const colors = {
      success: '#4caf50',
      info: '#2196f3',
      warning: '#ff9800',
      error: '#f44336',
    };
    return colors[type] || colors.info;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Activity
          </Typography>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Latest updates from your HRMS
        </Typography>

        <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  px: 0,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: 1,
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${activity.color}.light`,
                      color: `${activity.color}.main`,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {activity.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.action}
                      </Typography>
                      <FiberManualRecord 
                        sx={{ 
                          fontSize: 6, 
                          color: getStatusColor(activity.type)
                        }} 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        by {activity.user}
                      </Typography>
                      <Chip
                        label={activity.time}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          ml: 1, 
                          height: 20, 
                          fontSize: '0.6875rem',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;