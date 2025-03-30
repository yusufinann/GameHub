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

const BingoOverallStats = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">Error loading statistics: {error}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return null; // Or a message like "No stats available"
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Bingo Overall Statistics
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#bbdefb',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4">{stats.totalGames}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Total Games
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#c8e6c9',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4">{stats.wins}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Wins
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                backgroundColor: '#e1bee7',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4">
                {stats.averageScore ? stats.averageScore.toFixed(1) : '0'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Average Score
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default BingoOverallStats;