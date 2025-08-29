import React from 'react';
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import { TrendingUp, TrendingDown, MoreVert } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const StatsCard = ({ title, value, change, color, icon, subtitle }) => {
  const isPositive = change && change.startsWith('+');
  const theme = useTheme();

  // Get actual color values from theme
  const bgLight = theme.palette[color]?.light || theme.palette.grey[200];
  const bgMain = theme.palette[color]?.main || theme.palette.grey[500];

  return (
    <Card
      className="hrms-card"
      sx={{
        height: '100%',
        position: 'relative',
        background: `linear-gradient(135deg, ${bgLight} 0%, ${bgMain} 100%)`,
        color: 'white',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography 
              color="inherit" 
              gutterBottom 
              variant="overline"
              sx={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: 600 }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isPositive ? (
                  <TrendingUp sx={{ fontSize: 18, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ 
                    fontWeight: 600,
                    opacity: 0.9
                  }}
                >
                  {change} from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {icon}
          </Box>
        </Box>
        <IconButton
          size="small"
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8,
            color: 'inherit',
            opacity: 0.7,
            '&:hover': { opacity: 1 }
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </CardContent>
    </Card>
  );
};

export default StatsCard;