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
  Timer as TimerIcon,
  StarRate as StarIcon,
  History,
} from "@mui/icons-material";

const BingoGameDetails = () => {
  const [playerGameStats, setPlayerGameStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();

  useEffect(() => {
    const fetchPlayerGameStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3001/api/bingo/players-stats",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPlayerGameStats(response.data.playerGameStats);
      } catch (err) {
        console.error("Error fetching player game stats:", err);
        setError(err.response?.data?.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerGameStats();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get color based on rank
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
          Loading game statistics...
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
            Error Loading Data
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  // Sort players by rank
  const sortedStats = [...playerGameStats].sort((a, b) => a.rank - b.rank);

  // Apply pagination
  const paginatedStats = sortedStats.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(34,193,195,0.1)",
        background:'transparent',
      }}
    > <CardContent>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          p: 2,
          borderRadius: 2,
          background:theme.palette.secondary.main,
          color: "white",
        }}
      >
        <History sx={{ mr: 1, fontSize: 30 }} />
        <Typography variant="h5">Game History</Typography>
      </Box>

      <Divider />

      <TableContainer component={Paper} elevation={0}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: "bold" }}>Player</TableCell>
              {/* New Game ID Column */}
              <TableCell sx={{ fontWeight: "bold" }}>Score</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Average</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Game Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStats.map((stat, idx) => (
              <TableRow
                key={idx}
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
                  <Chip
                    label={stat.score}
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<StarIcon />}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Average score per game">
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
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <TimerIcon
                      sx={{
                        color: theme.palette.text.secondary,
                        mr: 1,
                        fontSize: 20,
                      }}
                    />
                    <Typography variant="body2">
                      {new Date(stat.gameTime).toLocaleString()}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={playerGameStats.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
       </CardContent>
    </Card>
  );
};

export default BingoGameDetails;
