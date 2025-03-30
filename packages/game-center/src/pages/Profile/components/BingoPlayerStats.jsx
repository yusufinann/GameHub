import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';

const BingoPlayerStats = () => {
  const { userId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bingo/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

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

  return (
    <Box p={4} sx={{ maxWidth: 1200, margin: '0 auto' }}>
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
                  {stats.averageScore.toFixed(1)}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Average Score
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bingo Game History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Lobby Code</TableCell>
                  <TableCell>Game ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Rank</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.games.map((game) => (
                  <TableRow key={game.gameId}>
                    <TableCell>{game.lobbyCode}</TableCell>
                    <TableCell>{game.gameId}</TableCell>
                    <TableCell>
                      {new Date(game.startedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">{game.score}</TableCell>
                    <TableCell align="right">{game.finalRank || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BingoPlayerStats;