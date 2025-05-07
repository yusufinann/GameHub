import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const BingoOverallStats = ({ stats, loading, error, theme }) => {
  const { t, i18n } = useTranslation(); 

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="150px">
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
        <Typography variant="body2" ml={2} color="text.secondary">
          {t('bingoOverallStats.loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{
          bgcolor: theme.palette.error.light, 
          color: theme.palette.error.contrastText || theme.palette.getContrastText(theme.palette.error.light)
        }}>
          {t('bingoOverallStats.error', 'Error loading statistics: {{error}}', { error: error })}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={2} textAlign="center">
        <Typography color="text.secondary">
          {t('bingoOverallStats.noStats')}
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{
      mb: 4,
      bgcolor: theme.palette.background.offwhite,
      boxShadow: `0 4px 20px ${theme.palette.background.dot}`, 
      borderRadius: 3 
    }}>
      <CardContent>
        <Typography
          variant="h5"
          component="h3" 
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            background:theme.palette.secondary.main,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3 
          }}
        >
          {t('bingoOverallStats.title')}
        </Typography>
        <Grid container spacing={2}> 
          <Grid item xs={12} sm={4}> 
            <Paper
              elevation={0} 
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark, 
                color: theme.palette.primary.contrastText,
                textAlign: 'center',
                borderRadius: 2, 
                border: `1px solid ${theme.palette.background.dot}`, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" component="p"> 
                {stats.totalGames.toLocaleString(i18n.language)}
              </Typography>
              <Typography variant="subtitle1">
                {t('bingoOverallStats.totalGames')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.success.light
                  : theme.palette.success.dark, 
                color: theme.palette.success.contrastText,
                textAlign: 'center',
                borderRadius: 2,
                border: `1px solid ${theme.palette.background.dot}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
                {stats.wins.toLocaleString(i18n.language)}
              </Typography>
              <Typography variant="subtitle1">
                {t('bingoOverallStats.wins', 'Wins')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.info.light 
                  : theme.palette.info.dark, 
                color: theme.palette.info.contrastText,
                textAlign: 'center',
                borderRadius: 2,
                border: `1px solid ${theme.palette.background.dot}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
                {typeof stats.averageScore === 'number'
                  ? stats.averageScore.toLocaleString(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                  : t('bingoOverallStats.notAvailable', 'N/A')}
              </Typography>
              <Typography variant="subtitle1">
                {t('bingoOverallStats.averageScore', 'Average Score')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BingoOverallStats;