import React ,{ useState } from 'react';
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
  Grid // Grid layout için eklendi
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleOutline,
  HighlightOff,
  CalendarToday,
  Category,
  TimerOutlined,
  Spellcheck,
  EmojiEvents,
  Leaderboard, // En İyi Sıralama için
  QueryStats,   // Toplam Doğru Tahminler için
  AccessTimeFilled // Toplam Oyun Süresi için
} from '@mui/icons-material';

const MAX_ALLOWED_INCORRECT_GUESSES = 6;

// Genel istatistikleri göstermek için yardımcı bir bileşen (isteğe bağlı ama düzenli tutar)
const OverallStatItem = ({ icon, label, value, isLoading, valueSuffix = '' }) => {
    const { t } = useTranslation();
    const notAvailableText = t('generic.notAvailable', 'N/A'); // Genel bir N/A çevirisi kullanın
    return (
        <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '8px', height: '100%' }}>
            {icon && React.cloneElement(icon, { sx: { fontSize: 32, color: 'text.secondary', ...icon.props.sx }})}
            <Box>
                <Typography variant="subtitle1" color="text.secondary" display="block" sx={{ lineHeight: 1.2 }}>
                    {label}
                </Typography>
                <Typography variant="h3"  color="text.primary">
                    {isLoading ? <CircularProgress size={20} thickness={4} /> : (value !== null && value !== undefined ? `${value}${valueSuffix}` : notAvailableText)}
                </Typography>
            </Box>
        </Paper>
    );
};


const HangmanGameHistory = ({ stats, loading, error }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // stats prop'undan genel istatistikleri ve oyunları alalım
  const {
    games = [],
    totalPlayTimeFormatted,
    totalCorrectGuesses,
    bestRankOverall
  } = stats || {}; // stats null/undefined ise boş obje ile başla

  // Yükleme durumu: Eğer `loading` true ise ve `stats` objesi henüz gelmemişse ana yükleyiciyi göster.
  // Bu, hem genel istatistiklerin hem de oyun listesinin yüklenmesini bekler.
  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="300px">
        <CircularProgress color="primary" />
        <Typography variant="body2" ml={2} color="text.secondary">
          {t('hangmanGameHistory.loading', 'Adam Asmaca oyun geçmişi yükleniyor...')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled">
          {t('hangmanGameHistory.errorLoading', 'Adam Asmaca oyun geçmişi yüklenirken hata oluştu: {{error}}', { error: error })}
        </Alert>
      </Box>
    );
  }

  const hasGames = games && games.length > 0;
  const hasOverallStats = totalPlayTimeFormatted || totalCorrectGuesses !== undefined || bestRankOverall !== undefined;

  // Hiç oyun yoksa ve genel istatistik de yoksa (ve yüklenmiyorsa)
  if (!hasGames && !hasOverallStats && !loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2, mt: 2 }}>
        <CardContent>
          <Box textAlign="center" p={{ xs: 2, sm: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme => theme.palette.text.primary, fontWeight: 'bold' }}>
              {t('hangmanGameHistory.title', 'Adam Asmaca - Oyun Geçmişi')}
            </Typography>
            <Category sx={{ fontSize: 60, color: 'text.disabled', my: 2 }} />
            <Typography color="text.secondary">
              {t('hangmanGameHistory.noHistoryOrStats', 'Adam Asmaca için henüz istatistik veya oyun geçmişi bulunamadı.')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const gamesToShow = games.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const notAvailableText = t('generic.notAvailable', 'N/A');

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Genel İstatistikler Bölümü */}
        { (hasOverallStats || loading) && ( // Yükleniyorsa veya veri varsa göster
          <Box mb={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
              {t('hangmanGameHistory.overallStatsTitle', 'Genel Adam Asmaca İstatistikleri')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <OverallStatItem
                  icon={<AccessTimeFilled sx={{ color: 'primary.main' }} />}
                  label={t('hangmanGameHistory.totalPlayTime', 'Toplam Oyun Süresi')}
                  value={totalPlayTimeFormatted}
                  isLoading={loading && totalPlayTimeFormatted === undefined}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <OverallStatItem
                  icon={<QueryStats sx={{ color: 'secondary.main' }} />}
                  label={t('hangmanGameHistory.totalCorrectOverall', 'Toplam Doğru Tahmin')}
                  value={totalCorrectGuesses?.toLocaleString(i18n.language)}
                  isLoading={loading && totalCorrectGuesses === undefined}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <OverallStatItem
                  icon={<Leaderboard sx={{ color: 'warning.main' }} />}
                  label={t('hangmanGameHistory.bestRankOverall', 'En İyi Sıralama')}
                  value={bestRankOverall}
                  isLoading={loading && bestRankOverall === undefined}
                  valueSuffix={bestRankOverall ? (i18n.language === 'tr' ? '.' : '') : ''} // TR için "." ekle
                />
              </Grid>
            </Grid>
            <Box sx={{ height: '1px', backgroundColor: 'divider', my: 3 }} /> {/* Ayırıcı Çizgi */}
          </Box>
        )}

        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: theme => theme.palette.text.primary, fontWeight: 'bold' }}>
          {t('hangmanGameHistory.title', 'Adam Asmaca - Oyun Geçmişi')}
        </Typography>

        {loading && !hasGames ? ( // Oyunlar yükleniyorsa ve henüz oyun yoksa spinner göster
          <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="200px">
            <CircularProgress />
            <Typography variant="body2" ml={2} color="text.secondary" sx={{display: hasOverallStats ? 'none' : 'block'}}>
                 {t('hangmanGameHistory.loadingGames', 'Oyunlar yükleniyor...')}
            </Typography>
          </Box>
        ) : !hasGames ? ( // Oyun yoksa (ve yüklenmiyorsa) "geçmiş yok" mesajı
          <Box textAlign="center" py={4}>
            <Category sx={{ fontSize: 50, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              {t('hangmanGameHistory.noGameRecords', 'Kaydedilmiş Adam Asmaca oyunu bulunamadı.')}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "8px", border: theme => `1px solid ${theme.palette.divider}` }}>
              <Table aria-label={t('hangmanGameHistory.tableAriaLabel', "adam asmaca oyun geçmişi tablosu")} stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: 'action.focus', color: 'text.primary', fontWeight: 'bold', py: 1.5 }}}>
                    <TableCell>{t('hangmanGameHistory.table.duration', 'Süre')}</TableCell>
                    <TableCell align="center">{t('hangmanGameHistory.table.correctGuessesInGame', 'Doğru Tahmin')}</TableCell>
                    <TableCell align="center">{t('hangmanGameHistory.table.rank', 'Sıra')}</TableCell>
                    <TableCell>{t('hangmanGameHistory.table.category', 'Kategori')}</TableCell>
                    <TableCell>{t('hangmanGameHistory.table.result', 'Sonuç')}</TableCell>
                    <TableCell align="center">{t('hangmanGameHistory.table.incorrectGuessesMade', 'Yanlış Tahmin')}</TableCell>
                    <TableCell>{t('hangmanGameHistory.table.date', 'Tarih')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gamesToShow.map((game) => {
                    const incorrectGuessesMade = game.incorrectGuesses ? game.incorrectGuesses.length : (game.incorrectGuessesCount || 0);
                    let guessesLeftForColor = 0;
                    if (game.won) {
                        guessesLeftForColor = MAX_ALLOWED_INCORRECT_GUESSES - incorrectGuessesMade;
                    }

                    return (
                      <TableRow
                        key={game.gameId}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '&:hover': { backgroundColor: 'action.selected', cursor: 'pointer' }, '& .MuiTableCell-body': { py: 1.5 }}}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
                            <TimerOutlined fontSize="small" sx={{ mr: 0.75 }} />
                            <Typography variant="body2">
                              {game.durationFormatted && game.durationFormatted !== "00:00:00" ? game.durationFormatted : notAvailableText}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" sx={{ color: 'text.primary' }}>
                                <Spellcheck fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                {game.correctGuessesCount !== undefined ? game.correctGuessesCount : notAvailableText}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" sx={{ color: 'text.primary' }}>
                                <EmojiEvents fontSize="small" sx={{ mr: 0.5, color: game.finalRank === 1 ? 'gold' : (game.finalRank === 2 ? 'silver' : (game.finalRank === 3 ? '#cd7f32' : 'text.secondary')) }} />
                                <Typography variant="body2" fontWeight="medium">
                                    {game.finalRank ? `${game.finalRank}.` : notAvailableText}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Box display="flex" alignItems="center">
                            <Category fontSize="small" sx={{ mr: 0.75, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="medium">{game.category || notAvailableText}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={game.won ? <CheckCircleOutline /> : <HighlightOff />}
                            label={game.won ? t('hangmanGameHistory.win', 'Kazandı') : t('hangmanGameHistory.loss', 'Kaybetti')}
                            color={game.won ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'medium' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={
                              game.won
                                ? (guessesLeftForColor > MAX_ALLOWED_INCORRECT_GUESSES / 2 ? 'success.main' : (guessesLeftForColor > 0 ? 'warning.main' : 'error.main'))
                                : 'error.main'
                            }
                          >
                            {incorrectGuessesMade} / {MAX_ALLOWED_INCORRECT_GUESSES}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" sx={{ color: 'text.secondary' }}>
                            <CalendarToday fontSize="small" sx={{ mr: 0.75 }} />
                            <Typography variant="body2">
                              {new Date(game.endedAt).toLocaleDateString(i18n.language, {
                                year: 'numeric', month: 'short', day: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {games.length > rowsPerPage && ( // Sadece birden fazla sayfa varsa göster
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={games.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={t('pagination.rowsPerPage', 'Sayfa başına satır:')}
                labelDisplayedRows={({ from, to, count }) =>
                  t('pagination.displayedRows', '{{from}}-{{to}} / {{count}}', { from, to, count: count !== -1 ? count : `more than ${to}` })
                }
                sx={{ mt: 2, borderTop: theme => `1px solid ${theme.palette.divider}`, pt: 1.5 }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HangmanGameHistory;