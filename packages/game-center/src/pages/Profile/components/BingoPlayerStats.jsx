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
  Alert,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { fetchBingoPlayerStats } from './api';

const BingoPlayerStats = () => {
  const { userId } = useParams();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBingoPlayerStats(userId);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="200px">
        <CircularProgress />
        <Typography ml={2} color="text.secondary">
          {t('bingoPlayerStats.loading', 'Loading statistics...')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">
          {t('bingoPlayerStats.error', 'Error loading statistics: {{error}}', { error: error })}
        </Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={4}>
        <Alert severity="info">
          {t('bingoPlayerStats.noStats', 'No statistics available for this player.')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 2, sm: 3, md: 4 }} sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {t('bingoPlayerStats.overallTitle')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                  textAlign: 'center',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>{stats.totalGames.toLocaleString(i18n.language)}</Typography>
                <Typography variant="subtitle1">
                  {t('bingoPlayerStats.totalGames')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.success.dark : theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  textAlign: 'center',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>{stats.wins.toLocaleString(i18n.language)}</Typography>
                <Typography variant="subtitle1">
                  {t('bingoPlayerStats.wins', 'Wins')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light,
                  color: theme.palette.secondary.contrastText,
                  textAlign: 'center',
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h3" component="p" sx={{ fontWeight: 'bold' }}>
                  {typeof stats.averageScore === 'number' ? stats.averageScore.toFixed(1) : t('bingoPlayerStats.notAvailable', 'N/A')}
                </Typography>
                <Typography variant="subtitle1">
                  {t('bingoPlayerStats.averageScore', 'Average Score')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {t('bingoPlayerStats.historyTitle')}
          </Typography>
          {stats.games && stats.games.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
              <Table aria-label={t('bingoPlayerStats.gameHistoryTableAria', 'bingo game history table')}>
                <TableHead sx={{ backgroundColor: theme.palette.secondary.main }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>{t('bingoPlayerStats.table.lobbyCode', 'Lobby Code')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>{t('bingoPlayerStats.table.gameId', 'Game ID')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>{t('bingoPlayerStats.table.date', 'Date')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>{t('bingoPlayerStats.table.score', 'Score')}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.secondary.contrastText }}>{t('bingoPlayerStats.table.rank', 'Rank')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.games.map((game) => (
                    <TableRow
                      key={game.gameId}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: theme.palette.action.hover } }}
                    >
                      <TableCell component="th" scope="row">{game.lobbyCode}</TableCell>
                      <TableCell>{game.gameId.slice(0, 8)}...</TableCell>
                      <TableCell>
                        {new Date(game.startedAt).toLocaleDateString(i18n.language, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell align="right">{game.score.toLocaleString(i18n.language)}</TableCell>
                      <TableCell align="right">{game.finalRank || t('bingoPlayerStats.notAvailableRank', 'N/A')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" p={3}>
              {t('bingoPlayerStats.noGameHistory')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BingoPlayerStats;