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

const BingoOverallStats = ({ stats, loading, error, theme }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" sx={{ 
          bgcolor: theme.palette.error.light,
          color: theme.palette.error.contrastText 
        }}>
          Error loading statistics: {error}
        </Alert>
      </Box>
    );
  }

  if (!stats) return null;

  return (
    <Card sx={{ 
      mb: 4,
      bgcolor: theme.palette.background.offwhite,
      boxShadow: `0 4px 20px ${theme.palette.background.dot}`
    }}>
      <CardContent>
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            background: theme.palette.text.gradient,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Bingo Genel İstatistikler
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === 'light' 
                  ? theme.palette.primary.light 
                  : theme.palette.secondary.main,
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${theme.palette.background.dot}`
              }}
            >
              <Typography variant="h4" sx={{ color: theme.palette.text.contrast }}>
                {stats.totalGames}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Toplam Oyun
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.success.light
                  : theme.palette.secondary.light,
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${theme.palette.background.dot}`
              }}
            >
              <Typography variant="h4" sx={{ color: theme.palette.text.contrast }}>
                {stats.wins}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Kazanma Sayısı
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === 'light'
                  ? theme.palette.secondary.paper
                  : theme.palette.primary.dark,
                textAlign: 'center',
                borderRadius: 3,
                border: `1px solid ${theme.palette.background.dot}`
              }}
            >
              <Typography variant="h4" sx={{ color: theme.palette.text.contrast }}>
                {stats.averageScore?.toFixed(1) || '0'}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary }}>
                Ortalama Skor
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BingoOverallStats;