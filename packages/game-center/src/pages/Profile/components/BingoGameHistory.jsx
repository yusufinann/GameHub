import React, { useState, useMemo } from 'react';
// Keep the original imports from your project
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
  TablePagination,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Numbers as NumbersIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
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
  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Calculate stats summary using useMemo to prevent unnecessary recalculations
  const statsSummary = useMemo(() => {
    if (!stats || !stats.games || stats.games.length === 0) {
      return { totalScore: 0, bestRank: '-', totalDuration: 'N/A' };
    }

    const totalScore = stats.games.reduce((sum, game) => sum + game.score, 0);
    const validRanks = stats.games.filter(game => game.finalRank).map(game => game.finalRank);
    const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : '-';
    const totalDurationMs = stats.games.reduce((sum, game) => sum + (game.duration || 0), 0);
    const formattedTotalDuration = formatDuration(totalDurationMs);

    return { totalScore, bestRank, formattedTotalDuration };
  }, [stats]);

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

  // Calculate pagination
  const totalGames = stats.games.length;
  const totalPages = Math.ceil(totalGames / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalGames);
  const currentGames = stats.games.slice(startIndex, endIndex);

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

        {/* Stats summary boxes using Box instead of Grid */}
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          gap={2} 
          mb={3}
        >
          <Box 
            p={2} 
            textAlign="center" 
            bgcolor="action.hover" 
            borderRadius={2}
            flex={1}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <Typography variant="body2" color="text.secondary">Toplam Harcanan Süre</Typography>
            <Typography variant="h6" fontWeight="bold">{statsSummary.formattedTotalDuration}</Typography>
          </Box>
          <Box 
            p={2} 
            textAlign="center" 
            bgcolor="action.hover" 
            borderRadius={2}
            flex={1}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <Typography variant="body2" color="text.secondary">Toplam Puan</Typography>
            <Typography variant="h6" fontWeight="bold">{statsSummary.totalScore.toLocaleString()}</Typography>
          </Box>
          <Box 
            p={2} 
            textAlign="center" 
            bgcolor="action.hover" 
            borderRadius={2}
            flex={1}
            width={{ xs: '100%', sm: 'auto' }}
          >
            <Typography variant="body2" color="text.secondary">En İyi Sıralama</Typography>
            <Typography variant="h6" fontWeight="bold">
              {statsSummary.bestRank}
              {statsSummary.bestRank === 1 && ' 🏆'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, mb: 2 }}>
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
              {currentGames.map((game) => (
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

        {/* Pagination Controls - Simplified version */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box>
            <Typography component="span" variant="body2" mr={1}>
              Rows per page:
            </Typography>
            <Box
              component={TablePagination}
              count={totalGames}
              page={page-1}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => setPage(newPage+1)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ display: 'inline', border: 'none' }}
              labelDisplayedRows={() => ''}
              backIconButtonProps={{style: {display: 'none'}}}
              nextIconButtonProps={{style: {display: 'none'}}}
              SelectProps={{
                variant: 'outlined',
                size: 'small'
              }}
            />
          </Box>
          
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {startIndex + 1}-{endIndex} / {totalGames} game
            </Typography>
            
            {/* Simple Pagination */}
            <Box display="flex" gap="8px">
              <IconButton 
                onClick={() => setPage(1)}
                disabled={page === 1}
                size="small"
                sx={{
                  border: '1px solid #ccc',
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <FirstPageIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                size="small"
                sx={{
                  border: '1px solid #ccc',
                  opacity: page === 1 ? 0.5 : 1,
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              
              <Typography variant="body2" mx={1} display="flex" alignItems="center">
                {page} / {totalPages}
              </Typography>
              
              <IconButton
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                size="small"
                sx={{
                  border: '1px solid #ccc',
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                size="small"
                sx={{
                  border: '1px solid #ccc',
                  opacity: page === totalPages ? 0.5 : 1,
                }}
              >
                <LastPageIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(BingoGameHistory);