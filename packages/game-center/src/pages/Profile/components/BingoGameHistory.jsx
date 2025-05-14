import React, { useState, useMemo } from "react";
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
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  Numbers as NumbersIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Import useTranslation

const getRankColor = (rank) => {
  if (!rank) return "default";
  if (rank === 1) return "success";
  if (rank <= 3) return "primary";
  if (rank <= 10) return "info";
  return "default";
};

const getScoreEmoji = (score) => {
  if (score > 5000) return "🔥";
  if (score > 3000) return "⭐";
  if (score > 1000) return "👍";
  return "";
};

const formatDuration = (durationMs, t) => {
  if (durationMs === null || durationMs === undefined)
    return t("bingoHistory.durationNA", "N/A");
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  // Use t function for "minutes" and "seconds"
  return t("bingoHistory.durationFormat", "{{minutes}} min {{seconds}} sec", {
    minutes,
    seconds,
  });
};

const BingoGameHistory = ({ stats, loading, error }) => {
  const { t, i18n } = useTranslation(); 
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const statsSummary = useMemo(() => {
    if (!stats || !stats.games || stats.games.length === 0) {
      return {
        totalScore: 0,
        bestRank: "-",
        formattedTotalDuration: t("bingoHistory.durationNA", "N/A"),
      };
    }

    const totalScore = stats.games.reduce((sum, game) => sum + game.score, 0);
    const validRanks = stats.games
      .filter((game) => game.finalRank)
      .map((game) => game.finalRank);
    const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : "-";
    const totalDurationMs = stats.games.reduce(
      (sum, game) => sum + (game.duration || 0),
      0
    );
    const formattedTotalDuration = formatDuration(totalDurationMs, t); 

    return { totalScore, bestRank, formattedTotalDuration };
  }, [stats, t]); 

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
        minHeight="300px"
      >
        <CircularProgress color="secondary" />
        <Typography variant="body2" ml={2} color="text.secondary">
          {t("bingoHistory.loadingHistory", "Loading game history...")}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error" variant="filled">
          {t(
            "bingoHistory.errorLoadingStats",
            "Error loading game statistics: {{error}}",
            { error: error }
          )}
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
              {t("bingoHistory.title", "Bingo Game History")}
            </Typography>
            <Box mb={2}>
              <NumbersIcon sx={{ fontSize: 64, color: "text.disabled" }} />
            </Box>
            <Typography color="text.secondary">
              {t(
                "bingoHistory.noHistory",
                "No game history found yet. Play your first Bingo game!"
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const totalGames = stats.games.length;
  const totalPages = Math.ceil(totalGames / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalGames);
  const currentGames = stats.games.slice(startIndex, endIndex);

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "visible" }}>
      <CardContent>
        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5"  color="secondary.main">
            {t("bingoHistory.title")}
          </Typography>
          <Tooltip title={t("bingoHistory.shareTooltip", "Share game history")}>
            <IconButton size="small" color="primary">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          mb={3}
        >
          <Box
            p={2}
            textAlign="center"
            bgcolor="action.hover"
            borderRadius={2}
            flex={1}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("bingoHistory.summary.totalDuration", "Total Time Spent")}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {statsSummary.formattedTotalDuration}
            </Typography>
          </Box>
          <Box
            p={2}
            textAlign="center"
            bgcolor="action.hover"
            borderRadius={2}
            flex={1}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("bingoHistory.summary.totalScore", "Total Score")}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {statsSummary.totalScore.toLocaleString(i18n.language)}
            </Typography>
          </Box>
          <Box
            p={2}
            textAlign="center"
            bgcolor="action.hover"
            borderRadius={2}
            flex={1}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("bingoHistory.summary.bestRank", "Best Rank")}
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {statsSummary.bestRank}
              {statsSummary.bestRank === 1 && " 🏆"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, mb: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.light" }}>
                <TableCell
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.lobbyCode")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.gameId", "Game ID")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.date", "Date")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.score", "Score")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.rank", "Rank")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentGames.map((game) => (
                <TableRow
                  key={game.gameId}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                    "&:hover": { backgroundColor: "action.selected" },
                    transition: "background-color 0.2s",
                  }}
                >
                  <TableCell>
                    <Chip
                      size="small"
                      label={game.lobbyCode}
                      color="secondary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Tooltip
                        title={t(
                          "bingoHistory.gameDetailsTooltip",
                          "Game Details"
                        )}
                      >
                        <IconButton size="small" sx={{ mr: 1 }}>
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {game.gameId.slice(0, 8)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      {new Date(game.startedAt).toLocaleDateString(
                        i18n.language,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {game.score.toLocaleString(i18n.language)}{" "}
                      {getScoreEmoji(game.score)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {game.finalRank ? (
                      <Chip
                        avatar={
                          game.finalRank <= 3 ? (
                            <Avatar>
                              <TrophyIcon />
                            </Avatar>
                          ) : null
                        }
                        label={`#${game.finalRank}`}
                        color={getRankColor(game.finalRank)}
                        size="small"
                        variant={game.finalRank <= 3 ? "filled" : "outlined"}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Controls - Simplified version */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Box>
            <Typography component="span" variant="body2" mr={1}>
              {t("bingoHistory.pagination.rowsPerPage")}
            </Typography>
            <Box
              component={TablePagination}
              count={totalGames}
              page={page - 1}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, newPage) => setPage(newPage + 1)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(1);
              }}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{ display: "inline", border: "none" }}
              labelDisplayedRows={() => ""} 
              labelRowsPerPage="" 
              backIconButtonProps={{ style: { display: "none" } }}
              nextIconButtonProps={{ style: { display: "none" } }}
              SelectProps={{
                variant: "outlined",
                size: "small",
                "aria-label": t(
                  "bingoHistory.pagination.rowsPerPageAria",
                  "rows per page selector"
                ),
              }}
            />
          </Box>

          <Box display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
              {t(
                "bingoHistory.pagination.displayingGames",
                "{{startIndex}}-{{endIndex}} of {{totalGames}} games",
                {
                  startIndex: startIndex + 1,
                  endIndex: endIndex,
                  totalGames: totalGames,
                }
              )}
            </Typography>

            {/* Simple Pagination */}
            <Box display="flex" gap="8px">
              <Tooltip
                title={t("bingoHistory.pagination.firstPage", "First Page")}
              >
                <IconButton
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  size="small"
                  sx={{
                    border: "1px solid #ccc",
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                  aria-label={t(
                    "bingoHistory.pagination.firstPageAria",
                    "first page"
                  )}
                >
                  <FirstPageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={t(
                  "bingoHistory.pagination.previousPage"
                )}
              >
                <IconButton
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  size="small"
                  sx={{
                    border: "1px solid #ccc",
                    opacity: page === 1 ? 0.5 : 1,
                  }}
                  aria-label={t(
                    "bingoHistory.pagination.previousPageAria"
                  )}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Typography
                variant="body2"
                mx={1}
                display="flex"
                alignItems="center"
              >
                {t(
                  "bingoHistory.pagination.pageInfo",
                  "{{currentPage}} / {{totalPages}}",
                  { currentPage: page, totalPages: totalPages }
                )}
              </Typography>

              <Tooltip
                title={t("bingoHistory.pagination.nextPage", "Next Page")}
              >
                <IconButton
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                  size="small"
                  sx={{
                    border: "1px solid #ccc",
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                  aria-label={t(
                    "bingoHistory.pagination.nextPageAria",
                    "next page"
                  )}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={t("bingoHistory.pagination.lastPage", "Last Page")}
              >
                <IconButton
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  size="small"
                  sx={{
                    border: "1px solid #ccc",
                    opacity: page === totalPages ? 0.5 : 1,
                  }}
                  aria-label={t(
                    "bingoHistory.pagination.lastPageAria",
                    "last page"
                  )}
                >
                  <LastPageIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(BingoGameHistory);
