import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  useTheme,
  alpha,
  TablePagination,
  Tooltip,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  SportsEsports as GamesIcon,
  StarRate as StarIcon,
  BarChart as StatsIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { fetchBingoPlayerStatsApi } from "./api"; 

const BingoGameDetail = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchBingoPlayerStatsApi();
        setPlayerStats(data.playerOverallStats || []);
      } catch (err) {
        console.error("Error fetching player stats:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching player statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRankColor = (rank) => {
    if (rank === 1) return theme.palette.gold || "#FFD700";
    if (rank === 2) return theme.palette.silver || "#C0C0C0";
    if (rank === 3) return theme.palette.bronze || "#CD7F32";
    return theme.palette.text.secondary;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="300px"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("Loading player statistics")}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card
        sx={{
          mt: 4,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          borderLeft: `4px solid ${theme.palette.error.main}`,
        }}
      >
        <CardContent>
          <Typography variant="h6" color="error" gutterBottom>
            {t("Error Loading Data")}
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const currentStats = playerStats;

  const paginatedStats = currentStats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(34,193,195,0.1)",
        background: 'transparent',
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            p: 2,
            borderRadius: 2,
            background: theme.palette.primary.main,
            color: theme.palette.secondary.contrastText
          }}
        >
          <StatsIcon sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">{t("Player Overall Statistics")}</Typography>
        </Box>

        <Divider />

        {paginatedStats.length === 0 && !loading ? (
          <Typography sx={{ textAlign: 'center', p: 3 }}>
            {t("No player statistics available at the moment.")}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Rank")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Player")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Total Score")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Average Score")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Wins")}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{t("Games Played")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStats.map((stat, idx) => {
                    const overallRank = page * rowsPerPage + idx + 1;
                    return (
                      <TableRow
                        key={stat.playerId || idx}
                        sx={{
                          "&:nth-of-type(odd)": {
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={`#${overallRank}`}
                            size="small"
                            sx={{
                              bgcolor: getRankColor(overallRank),
                              color: overallRank <= 3 ? "black" : "white",
                              fontWeight: "bold",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor:
                                  overallRank <= 3
                                    ? getRankColor(overallRank)
                                    : theme.palette.grey[400],
                                color: overallRank <= 3 ? "black" : "white",
                                width: 36,
                                height: 36,
                              }}
                            >
                              {stat.userName ? stat.userName.charAt(0).toUpperCase() : 'P'}
                            </Avatar>
                            <Typography
                              sx={{
                                ml: 2,
                                fontWeight: overallRank <= 3 ? "bold" : "normal",
                              }}
                            >
                              {stat.userName || t("Unknown Player")}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stat.totalScore}
                            size="small"
                            color="primary"
                            variant="outlined"
                            icon={<StarIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={t("Average score per game")}>
                            <Typography variant="body2">
                              {typeof stat.averageScore === 'number' ? stat.averageScore.toFixed(2) : 'N/A'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <TrophyIcon
                              sx={{ color: "goldenrod", mr: 1, fontSize: 20 }}
                            />
                            <Typography>{stat.wins}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                            <Box display="flex" alignItems="center">
                                <GamesIcon sx={{ color: theme.palette.info.main, mr: 1, fontSize: 20 }} />
                                <Typography>{stat.totalGames}</Typography>
                            </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={currentStats.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BingoGameDetail;