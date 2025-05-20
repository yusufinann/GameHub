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
} from "@mui/material";
import {
  EmojiEvents as TrophyIcon,
  SportsEsports as GamesIcon, // Yeni ikon
  StarRate as StarIcon,
  BarChart as StatsIcon, // Başlık için daha genel bir ikon
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const BingoPlayerStats = () => { // Component adını değiştirdim (isteğe bağlı)
  const [playerStats, setPlayerStats] = useState([]); // State adını değiştirdim
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
        const response = await axios.get(
          "http://localhost:3001/api/bingo/players-stats", // Endpoint aynı kalabilir
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // Backend'den gelen response key'ini kontrol edin!
        // Eğer backend `playerOverallStats` dönüyorsa:
        setPlayerStats(response.data.playerOverallStats || []);
        // Eğer backend `playerStats` dönüyorsa:
        // setPlayerStats(response.data.playerStats || []);
      } catch (err) {
        console.error("Error fetching player stats:", err);
        setError(err.response?.data?.message || "An error occurred.");
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

  // Genel sıralamaya göre renk al
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

  // API zaten ortalama skora göre sıralı gönderiyor.
  // Eğer farklı bir sıralama istenirse burada yapılabilir, örn:
  // const sortedStats = [...playerStats].sort((a, b) => b.wins - a.wins); // Kazanma sayısına göre
  const currentStats = playerStats; // API'den geldiği gibi kullanıyoruz

  // Apply pagination
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
            color: "white",
          }}
        >
          <StatsIcon sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">{t("Player Overall Statistics")}</Typography>
        </Box>

        <Divider />

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
                // API'den gelen sıralama zaten en iyiden kötüye doğru (averageScore)
                // Bu yüzden sayfa bazlı index'i kullanarak genel rank'ı hesaplayabiliriz.
                const overallRank = page * rowsPerPage + idx + 1;
                return (
                  <TableRow
                    key={stat.playerId} // Benzersiz bir anahtar kullanın (playerId idealdir)
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
                        color="primary" // Veya farklı bir renk
                        variant="outlined"
                        icon={<StarIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={t("Average score per game")}>
                        <Typography variant="body2">
                          {stat.averageScore.toFixed(2)}
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
          count={currentStats.length} // playerStats.length veya currentStats.length
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default BingoPlayerStats; // Component adını değiştirdiyseniz burada da güncelleyin