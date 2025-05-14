import { useState } from 'react';
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
  Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CheckCircleOutline, HighlightOff, CalendarToday, Category } from '@mui/icons-material'; // Added Category icon

// Define the maximum number of incorrect guesses allowed in a Hangman game.
// This might be a configurable value or a known constant for your game.
const MAX_ALLOWED_INCORRECT_GUESSES = 6;

const HangmanGameHistory = ({ stats, loading, error }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight="300px">
        <CircularProgress color="primary" />
        <Typography variant="body2" ml={2} color="text.secondary">
          {t('hangmanGameHistory.loading', 'Loading Hangman game history...')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled">
          {t('hangmanGameHistory.errorLoading', 'Error loading Hangman game history: {{error}}', { error: error })}
        </Alert>
      </Box>
    );
  }

  // stats is expected to be { games: [...] }
  // where games is the gameHistory array from the backend
  if (!stats || !stats.games || stats.games.length === 0) {
    return (
      <Card elevation={3} sx={{ borderRadius: 2, mt: 2 }}> {/* Added mt for spacing if it's empty */}
        <CardContent>
          <Box textAlign="center" p={{ xs: 2, sm: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: theme => theme.palette.text.primary, fontWeight: 'bold' }}>
              {t('hangmanGameHistory.title', 'Hangman - Game History')}
            </Typography>
            <Category sx={{ fontSize: 60, color: 'text.disabled', my: 2 }} />
            <Typography color="text.secondary">
              {t('hangmanGameHistory.noHistory', 'No Hangman game history found yet.')}
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

  // Backend data structure for each game in stats.games:
  // { gameId, lobbyCode, category, won, eliminated, correctGuessesCount,
  //   incorrectGuessesCount, correctGuesses, incorrectGuesses (array), finalRank, endedAt }

  const gamesToShow = stats.games.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}> {/* Changed overflow to hidden for cleaner look */}
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}> {/* Responsive padding */}
        <Typography variant="h5" gutterBottom sx={{ mb: 2, color: theme => theme.palette.text.primary, fontWeight: 'bold' }}>
          {t('hangmanGameHistory.title', 'Hangman - Game History')}
        </Typography>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "8px", border: theme => `1px solid ${theme.palette.divider}` }}>
          <Table aria-label={t('hangmanGameHistory.tableAriaLabel', "hangman game history table")} stickyHeader>
            <TableHead>
              {/* Updated TableRow sx for better theme integration */}
              <TableRow sx={{
                '& .MuiTableCell-head': {
                  backgroundColor: 'action.focus', // A subtle background for header
                  color: 'text.primary',
                  fontWeight: 'bold',
                  py: 1.5, // Padding Y
                }
              }}>
                {/* Changed 'Word' to 'Category' */}
                <TableCell>{t('hangmanGameHistory.table.category', 'Category')}</TableCell>
                <TableCell>{t('hangmanGameHistory.table.result', 'Result')}</TableCell>
                <TableCell align="center">{t('hangmanGameHistory.table.incorrectGuessesMade', 'Incorrect Guesses')}</TableCell>
                <TableCell>{t('hangmanGameHistory.table.date', 'Date')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gamesToShow.map((game) => {
                const incorrectGuessesMade = game.incorrectGuesses ? game.incorrectGuesses.length : (game.incorrectGuessesCount || 0);
                let guessesLeftForColor = 0; // For coloring logic, represents "lives" left if they won
                if (game.won) {
                    guessesLeftForColor = MAX_ALLOWED_INCORRECT_GUESSES - incorrectGuessesMade;
                } // if lost, it's 0 implicitly

                return (
                  <TableRow
                    key={game.gameId}
                    sx={{
                      '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                      '&:hover': { backgroundColor: 'action.selected', cursor: 'pointer' }, // Added cursor
                      '& .MuiTableCell-body': { py: 1.5 } // Padding Y for body cells
                    }}
                    // onClick={() => console.log("Game details for:", game.gameId)} // Optional: for future detail view
                  >
                    <TableCell component="th" scope="row">
                      {/* Display category. Fallback if category is missing. */}
                      <Typography variant="body2" fontWeight="medium">{game.category || t('hangmanGameHistory.notAvailable', 'N/A')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={game.won ? <CheckCircleOutline /> : <HighlightOff />}
                        label={game.won ? t('hangmanGameHistory.win', 'Win') : t('hangmanGameHistory.loss', 'Loss')}
                        color={game.won ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {/* Display number of incorrect guesses made. Color indicates how "close" they were to losing if they won */}
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color={
                          game.won
                            ? (guessesLeftForColor > MAX_ALLOWED_INCORRECT_GUESSES / 2 ? 'success.main' : (guessesLeftForColor > 0 ? 'warning.main' : 'error.main'))
                            : 'error.main' // If lost, always error color
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
        {stats.games.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={stats.games.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('pagination.rowsPerPage', 'Rows per page:')}
            labelDisplayedRows={({ from, to, count }) =>
              t('pagination.displayedRows', '{{from}}-{{to}} of {{count}}', { from, to, count: count !== -1 ? count : `more than ${to}` })
            }
            sx={{ mt: 2, borderTop: theme => `1px solid ${theme.palette.divider}`, pt: 1.5 }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default HangmanGameHistory;