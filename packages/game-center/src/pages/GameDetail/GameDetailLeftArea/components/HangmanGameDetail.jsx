import React, { useEffect, useState } from "react";
import axios from "axios";
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
  LinearProgress,
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  Assessment as StatsIcon,
  Casino as GameIcon,
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const HangmanGameDetails = () => {
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3001/api/hangman/stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        
        const statsWithRank = response.data.map((stat, index) => ({
          ...stat,
          rank: index + 1
        }));
        
        setUserStats(statsWithRank);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError(err.response?.data?.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
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

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.8) return theme.palette.success.main;
    if (accuracy >= 0.5) return theme.palette.warning.main;
    return theme.palette.error.main;
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
          {t("Loading game statistics")}...
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

  const paginatedStats = userStats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(34,193,195,0.1)",
        background: "transparent",
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
            color: "white",
          }}
        >
          <StatsIcon sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">{t("Hangman Game Statistics")}</Typography>
        </Box>

        <Divider />

        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Player")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Games Played")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Wins")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Accuracy")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Correct Guesses")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Incorrect Guesses")}</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{t("Rank")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStats.map((stat, idx) => (
                <TableRow
                  key={stat.playerId}
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
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor:
                            stat.rank <= 3
                              ? getRankColor(stat.rank)
                              : theme.palette.grey[400],
                          color: stat.rank <= 3 ? "black" : "white",
                          width: 36,
                          height: 36,
                        }}
                      >
                        {stat.userName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography
                        sx={{
                          ml: 2,
                          fontWeight: stat.rank <= 3 ? "bold" : "normal",
                        }}
                      >
                        {stat.userName}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <GameIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                      <Typography>{stat.totalGamesPlayed}</Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TrophyIcon
                        sx={{ color: "goldenrod", mr: 1, fontSize: 20 }}
                      />
                      <Typography>{stat.totalWins}</Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Tooltip title={`${(stat.accuracy * 100).toFixed(1)}% correct guesses`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={stat.accuracy * 100} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 1,
                              backgroundColor: alpha(getAccuracyColor(stat.accuracy), 0.2),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getAccuracyColor(stat.accuracy)
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${(stat.accuracy * 100).toFixed(0)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CorrectIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                      <Typography>{stat.totalCorrectGuesses}</Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <IncorrectIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                      <Typography>{stat.totalIncorrectGuesses}</Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={`#${stat.rank}`}
                      size="small"
                      sx={{
                        bgcolor: getRankColor(stat.rank),
                        color: stat.rank <= 3 ? "black" : "white",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={userStats.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default HangmanGameDetails;