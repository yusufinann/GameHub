import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Numbers as NumbersIcon,
  Share as ShareIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const getRankColor = (rank) => {
  if (!rank) return 'default';
  if (rank === 1) return 'success';
  if (rank <= 3) return 'primary';
  if (rank <= 10) return 'info';
  return 'default';
};

const getScoreEmoji = (score) => {
  if (score > 5000) return '🔥';
  if (score > 3000) return '⭐';
  if (score > 1000) return '👍';
  return '';
};

// Helper function to format duration in milliseconds to minutes and seconds
const formatDuration = (durationMs) => {
  if (durationMs === null || durationMs === undefined) return "N/A";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} dakika ${seconds} saniye`;
};

const BingoGameHistory = ({ stats, loading, error }) => {
  console.log(stats);
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="300px">
        <CircularProgress color="secondary" />
        <Typography variant="body2" ml={2} color="text.secondary">
          Oyun geçmişi yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled">
          Oyun istatistikleri yüklenirken hata oluştu: {error}
        </Alert>
      </Box>
    );
  }

  if (!stats || !stats.games || stats.games.length === 0) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box textAlign="center" p={4}>
            <Typography variant="h5" gutterBottom color="primary.main">
              Bingo Oyun Geçmişi
            </Typography>
            <Box mb={2}>
              <NumbersIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            </Box>
            <Typography color="text.secondary">
              Henüz oyun geçmişi bulunmuyor. İlk Bingo oyununuzu oynayın!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const totalScore = stats.games.reduce((sum, game) => sum + game.score, 0);
  const bestRank = Math.min(...stats.games.filter(game => game.finalRank).map(game => game.finalRank));

  // Calculate total duration
  const totalDurationMs = stats.games.reduce((sum, game) => sum + (game.duration || 0), 0);
  const formattedTotalDuration = formatDuration(totalDurationMs);


  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
      <CardContent>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            Bingo Oyun Geçmişi
          </Typography>
          <Tooltip title="Oyun geçmişini paylaş">
            <IconButton size="small" color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={4}>
            <Box p={2} textAlign="center" bgcolor="action.hover" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">Toplam Harcanan Süre</Typography>
              <Typography variant="h6" fontWeight="bold">{formattedTotalDuration}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box p={2} textAlign="center" bgcolor="action.hover" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">Toplam Puan</Typography>
              <Typography variant="h6" fontWeight="bold">{totalScore.toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box p={2} textAlign="center" bgcolor="action.hover" borderRadius={2}>
              <Typography variant="body2" color="text.secondary">En İyi Sıralama</Typography>
              <Typography variant="h6" fontWeight="bold">
                {Number.isFinite(bestRank) ? bestRank : '-'}
                {bestRank === 1 && ' 🏆'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Lobi Kodu</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Oyun ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Tarih</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Puan</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>Sıralama</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.games.map((game, index) => (
                <TableRow
                  key={game.gameId}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell>
                    <Chip
                      size="small"
                      label={game.lobbyCode}
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Tooltip title="Oyun Detayları">
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {game.gameId.slice(0, 8)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      {new Date(game.startedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {game.score.toLocaleString()} {getScoreEmoji(game.score)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {game.finalRank ? (
                      <Chip
                        avatar={game.finalRank <= 3 ? <Avatar><TrophyIcon /></Avatar> : null}
                        label={`#${game.finalRank}`}
                        color={getRankColor(game.finalRank)}
                        size="small"
                        variant={game.finalRank <= 3 ? "filled" : "outlined"}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default BingoGameHistory;