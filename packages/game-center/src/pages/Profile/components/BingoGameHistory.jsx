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
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  TablePagination, // TablePagination'ı tekrar ekliyorum
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  AccessTime as TimeIcon,
  TimerOutlined as DurationIcon,
  Numbers as NumbersIcon,
  Share as ShareIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

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

const formatGameDuration = (durationMs, t) => {
  if (durationMs === null || durationMs === undefined || durationMs <= 0) {
    return t("bingoHistory.durationNA", "N/A");
  }

  let totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(
      t("bingoHistory.duration.hours", "{{count}} sa", { count: hours })
    );
  }
  if (minutes > 0) {
    parts.push(
      t("bingoHistory.duration.minutes", "{{count}} dk", { count: minutes })
    );
  }
  if (seconds > 0 || (hours === 0 && minutes === 0 && durationMs > 0)) {
    parts.push(
      t("bingoHistory.duration.seconds", "{{count}} sn", { count: seconds })
    );
  }

  if (parts.length === 0 && durationMs > 0) {
    return t("bingoHistory.duration.lessThanASecond", "< 1 sn");
  }
  return parts.length > 0
    ? parts.join(" ")
    : t("bingoHistory.durationNA", "N/A");
};

const BingoGameHistory = ({ stats, loading, error }) => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0); // Material-UI TablePagination 0-indexed page kullanır
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const statsSummary = useMemo(() => {
    if (!stats || !stats.games || stats.games.length === 0) {
      return {
        totalScore: 0,
        bestRank: "-",
        formattedTotalDuration: t("bingoHistory.durationNA", "N/A"),
      };
    }

    const totalScore = stats.games.reduce(
      (sum, game) => sum + (game.score || 0),
      0
    );
    const validRanks = stats.games
      .filter((game) => game.finalRank)
      .map((game) => game.finalRank);
    const bestRank = validRanks.length > 0 ? Math.min(...validRanks) : "-";

    let formattedTotalDuration;
    if (stats.totalPlayTimeFormatted) {
      if (
        stats.totalPlayTimeFormatted === "00:00:00" &&
        (!stats.totalPlayTimeMilliseconds ||
          stats.totalPlayTimeMilliseconds === 0)
      ) {
        formattedTotalDuration = t("bingoHistory.durationNA", "N/A");
      } else {
        formattedTotalDuration = stats.totalPlayTimeFormatted;
      }
    } else {
      formattedTotalDuration = formatGameDuration(
        stats.totalPlayTimeMilliseconds,
        t
      );
    }

    return {
      totalScore,
      bestRank,
      formattedTotalDuration,
    };
  }, [stats, t]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
          {t("bingoHistory.loadingHistory", "Oyun geçmişi yükleniyor...")}
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
            "Oyun istatistikleri yüklenirken hata oluştu: {{error}}",
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
              {t("bingoHistory.title", "Bingo Oyun Geçmişi")}
            </Typography>
            <Box mb={2}>
              <NumbersIcon sx={{ fontSize: 64, color: "text.disabled" }} />
            </Box>
            <Typography color="text.secondary">
              {t(
                "bingoHistory.noHistory",
                "Henüz oyun geçmişi bulunmuyor. İlk Bingo oyununuzu oynayın!"
              )}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const currentGames = stats.games.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: "visible" }}>
      <CardContent>
        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" color="secondary.main">
            {t("bingoHistory.title", "Bingo Oyun Geçmişi")}
          </Typography>
          <Tooltip
            title={t("bingoHistory.shareTooltip", "Oyun geçmişini paylaş")}
          >
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
            <Typography variant="subtitle1" color="text.secondary">
              {t("bingoHistory.summary.totalDuration", "Toplam Oyun Süresi")}
            </Typography>
            <Typography variant="h3" fontWeight="bold">
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
            <Typography variant="subtitle1" color="text.secondary">
              {t("bingoHistory.summary.totalScore", "Toplam Skor")}
            </Typography>
            <Typography variant="h3" fontWeight="bold">
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
            <Typography variant="subtitle1" color="text.secondary">
              {t("bingoHistory.summary.bestRank", "En İyi Sıra")}
            </Typography>
            <Typography variant="h3" >
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
                  {t("bingoHistory.table.lobbyCode", "Lobi Kodu")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.date", "Tarih")}
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.duration", "Süre")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.score", "Skor")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: "bold", color: "primary.contrastText" }}
                >
                  {t("bingoHistory.table.rank", "Sıra")}
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
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DurationIcon
                        fontSize="small"
                        sx={{ mr: 1, color: "text.secondary" }}
                      />
                      {formatGameDuration(game.durationMilliseconds, t)}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {(game.score || 0).toLocaleString(i18n.language)}{" "}
                      {getScoreEmoji(game.score || 0)}
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={stats.games.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={t(
            "bingoHistory.pagination.rowsPerPage",
            "Sayfa başına satır:"
          )}
          labelDisplayedRows={({ from, to, count }) =>
            t(
              "bingoHistory.pagination.displayingGames",
              "{{from}}-{{to}} / {{count}}",
              {
                from,
                to,
                count:
                  count !== -1
                    ? count
                    : t(
                        "bingoHistory.pagination.moreThan",
                        "{{to}}'dan fazla",
                        { to }
                      ),
              }
            )
          }
          getItemAriaLabel={(type) => {
            if (type === "first")
              return t(
                "bingoHistory.pagination.firstPageAria",
                "İlk sayfaya git"
              );
            if (type === "last")
              return t(
                "bingoHistory.pagination.lastPageAria",
                "Son sayfaya git"
              );
            if (type === "next")
              return t(
                "bingoHistory.pagination.nextPageAria",
                "Sonraki sayfaya git"
              );
            if (type === "previous")
              return t(
                "bingoHistory.pagination.previousPageAria",
                "Önceki sayfaya git"
              );
            return "";
          }}
          ActionsComponent={(props) => {
            const {
              count,
              page: currentPage,
              rowsPerPage: currentRowsPerPage,
              onPageChange,
            } = props;
            const handleFirstPageButtonClick = (event) => {
              onPageChange(event, 0);
            };
            const handleBackButtonClick = (event) => {
              onPageChange(event, currentPage - 1);
            };
            const handleNextButtonClick = (event) => {
              onPageChange(event, currentPage + 1);
            };
            const handleLastPageButtonClick = (event) => {
              onPageChange(
                event,
                Math.max(0, Math.ceil(count / currentRowsPerPage) - 1)
              );
            };

            return (
              <Box sx={{ flexShrink: 0, ml: 2.5 }}>
                <IconButton
                  onClick={handleFirstPageButtonClick}
                  disabled={currentPage === 0}
                  aria-label={t(
                    "bingoHistory.pagination.firstPageAria",
                    "İlk sayfa"
                  )}
                >
                  <FirstPageIcon />
                </IconButton>
                <IconButton
                  onClick={handleBackButtonClick}
                  disabled={currentPage === 0}
                  aria-label={t(
                    "bingoHistory.pagination.previousPageAria",
                    "Önceki sayfa"
                  )}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextButtonClick}
                  disabled={
                    currentPage >= Math.ceil(count / currentRowsPerPage) - 1
                  }
                  aria-label={t(
                    "bingoHistory.pagination.nextPageAria",
                    "Sonraki sayfa"
                  )}
                >
                  <ChevronRightIcon />
                </IconButton>
                <IconButton
                  onClick={handleLastPageButtonClick}
                  disabled={
                    currentPage >= Math.ceil(count / currentRowsPerPage) - 1
                  }
                  aria-label={t(
                    "bingoHistory.pagination.lastPageAria",
                    "Son sayfa"
                  )}
                >
                  <LastPageIcon />
                </IconButton>
              </Box>
            );
          }}
        />
      </CardContent>
    </Card>
  );
};

export default React.memo(BingoGameHistory);
