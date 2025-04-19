import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grow, 
  Grid,
  Paper,
  Box,
} from '@mui/material';

export const StatCard = ({ icon: Icon, title, value, delay, theme }) => {
  return (
    <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay || 0}ms` }}>
      <Card sx={{
        height: '100%',
        background: theme.palette.background.card,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${theme.palette.background.dot}`,
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: theme.shadows[6],
          background: theme.palette.background.gradient,
          '& .title': {
            color: theme.palette.text.contrast
          },
          '& .value': {
            color: theme.palette.text.contrast,
            transform: 'scale(1.1)'
          },
          '& .icon': {
            color: theme.palette.text.contrast,
            transform: 'rotate(360deg)'
          }
        }
      }}>
        <CardContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 3
        }}>
          <Icon className="icon" sx={{
            fontSize: 40,
            color: theme.palette.primary.main,
            mb: 2,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
          <Typography className="value" variant="h4" sx={{
            mb: 1,
            transition: 'all 0.3s ease',
            fontWeight: 800, 
            color: theme.palette.mode === 'light' 
              ? theme.palette.primary.darker 
              : theme.palette.secondary.light, 
            textShadow: `0 2px 4px ${theme.palette.background.dot}`, 
            fontSize: '2.5rem', 
            '&:hover': {
              color: theme.palette.text.contrast,
              textShadow: 'none'
            }
          }}>
            {value}
          </Typography>
          <Typography className="title" variant="body2" sx={{
            transition: 'all 0.3s ease',
            color: theme.palette.text.secondary,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

export const ProfileSection = {
  Achievements: ({ achievements, theme }) => (
    <Grid container spacing={2}>
      {achievements?.map((achievement) => (
        <Grid item xs={12} sm={6} md={4} key={achievement.id}>
          <Paper sx={{ 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.background.dot}`,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[4]
            }
          }}>
            <Typography variant="h4" sx={{ 
              color: theme.palette.primary.main,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {achievement.icon}
            </Typography>
            <Box>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.primary }}>
                {achievement.name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {new Date(achievement.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  ),
};