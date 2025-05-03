import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  IconButton,
  Fade,
  Zoom,
  Grow
} from '@mui/material';
import {
  EmojiEvents,
  SportsScore,
  Timeline,
  Refresh,
  PieChart as PieChartIcon,
  ShowChart,
  Leaderboard
} from '@mui/icons-material';
import { useAuthContext } from '../../../../shared/context/AuthContext';

const BingoStatsSchema = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('pie');
  const [showCards, setShowCards] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const theme = useTheme();
  const { currentUser } = useAuthContext();
  const userId = currentUser?.id;
  
  // Fetch user stats on mount and when userId changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        console.log("userId is not ready yet, skipping stats fetch.");
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bingo/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Error fetching stats');
        }
        const data = await response.json();
        setStats(data);
        // Delays to trigger animations
        setTimeout(() => setShowCards(true), 300);
        setTimeout(() => setShowCharts(true), 900);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, userId]);

  // Refresh function
  const refreshStats = () => {
    setShowCards(false);
    setShowCharts(false);
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3001/api/bingo/stats/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error refreshing stats');
        }
        return response.json();
      })
      .then(data => {
        setStats(data);
        setShowCards(true);
        setShowCharts(true);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Preparing pie chart data
  const preparePieData = () => {
    if (!stats) return [];
    const winRate = (stats.wins / stats.totalGames) * 100 || 0;
    return [
      { name: 'Wins', value: winRate, color: theme.palette.success.main },
      { name: 'Losses', value: 100 - winRate, color: theme.palette.error.main }
    ];
  };

  // Preparing bar chart data (based on last 5 games)
  const prepareBarData = () => {
    if (!stats || !stats.games || stats.games.length === 0) return [];
    return stats.games
      .slice(0, 5)
      .map(game => ({
        name: game.lobbyCode,
        score: game.score,
        rank: game.finalRank || 0
      }))
      .reverse();
  };

  // Custom PieChart component
  const CustomPieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const endAngle = startAngle + angle;
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            const x1 = 80 + 60 * Math.cos(startRad);
            const y1 = 80 + 60 * Math.sin(startRad);
            const x2 = 80 + 60 * Math.cos(endRad);
            const y2 = 80 + 60 * Math.sin(endRad);
            const largeArcFlag = angle > 180 ? 1 : 0;
            const path = `M 80 80 L ${x1} ${y1} A 60 60 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            startAngle = endAngle;
            return (
              <path
                key={index}
                d={path}
                fill={item.color}
                stroke={theme.palette.background.paper}
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
              <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                {item.name}: {item.value.toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Custom BarChart component
  const CustomBarChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxScore = Math.max(...data.map(item => item.score), 5);
    const maxRank = Math.max(...data.map(item => item.rank), 5);

    const svgHeight = 300;
    const svgWidth = 400;
    const padding = { top: 30, right: 20, bottom: 80, left: 60 };
    const chartHeight = svgHeight - padding.top - padding.bottom;
    const chartWidth = svgWidth - padding.left - padding.right;
    const barWidth = (chartWidth / data.length) / 2.2;
    const barSpacing = (chartWidth / data.length) - (2 * barWidth);

    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 1 }}>
        <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {/* Y-Axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke={theme.palette.text.secondary}
            strokeWidth="1.5"
          />
          {/* X-Axis */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke={theme.palette.text.secondary}
            strokeWidth="1.5"
          />
          {/* Y-Axis Tick & Labels */}
          {[0, 1, 2, 3, 4, 5].map((tick, index) => {
            const y = svgHeight - padding.bottom - (chartHeight * tick / 5);
            return (
              <g key={index}>
                <line
                  x1={padding.left - 8}
                  y1={y}
                  x2={padding.left}
                  y2={y}
                  stroke={theme.palette.text.secondary}
                  strokeWidth="1.5"
                />
                <text
                  x={padding.left - 15}
                  y={y + 6}
                  textAnchor="end"
                  fill={theme.palette.text.primary}
                  fontSize="14"
                  fontWeight="bold"
                >
                  {(maxScore * tick / 5).toFixed(0)}
                </text>
              </g>
            );
          })}
          {/* Bars & Labels */}
          {data.map((item, index) => {
            const x = padding.left + (index * (2 * barWidth + barSpacing)) + barSpacing / 2;
            const scoreHeight = (item.score / maxScore) * chartHeight;
            const rankHeight = (item.rank / maxRank) * chartHeight;
            return (
              <g key={index}>
                {/* Score Bar */}
                <rect
                  x={x}
                  y={svgHeight - padding.bottom - scoreHeight}
                  width={barWidth}
                  height={scoreHeight}
                  fill={theme.palette.secondary.main}
                  rx={3}
                  stroke={theme.palette.secondary.dark}
                  strokeWidth="1"
                />
                {/* Rank Bar */}
                <rect
                  x={x + barWidth + 4}
                  y={svgHeight - padding.bottom - rankHeight}
                  width={barWidth}
                  height={rankHeight}
                  fill={theme.palette.secondary.gold}
                  rx={3}
                  stroke={theme.palette.warning.main}
                  strokeWidth="1"
                />
                {/* X-Axis Label */}
                <text
                  x={x + barWidth + 2}
                  y={svgHeight - padding.bottom + 30}
                  textAnchor="middle"
                  fill={theme.palette.text.primary}
                  fontSize="14"
                  fontWeight="bold"
                  transform={`rotate(-45 ${x + barWidth + 2} ${svgHeight - padding.bottom + 30})`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
          {/* Legend */}
          <rect x={svgWidth - 170} y={padding.top} width={15} height={15} fill={theme.palette.secondary.main} stroke={theme.palette.secondary.dark} strokeWidth="1" />
          <text x={svgWidth - 150} y={padding.top + 12} fill={theme.palette.text.primary} fontSize="14" fontWeight="bold">
            Score
          </text>
          <rect x={svgWidth - 80} y={padding.top} width={15} height={15} fill={theme.palette.secondary.gold} stroke={theme.palette.warning.main} strokeWidth="1" />
          <text x={svgWidth - 60} y={padding.top + 12} fill={theme.palette.text.primary} fontSize="14" fontWeight="bold">
            Rank
          </text>
        </svg>
      </Box>
    );
  };

  // Card gradient backgrounds for different cards
  const getCardBackground = (index) => {
    const gradients = [
      `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
      `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
      `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`
    ];
    return gradients[index % gradients.length];
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
        height="80vh"
        sx={{
          background: theme.palette.background.gradientB,
          borderRadius: '25px',
          overflow: 'hidden',
          marginTop: '20px',
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        p={4}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.error.light}20 0%, ${theme.palette.error.main}30 100%)`,
          borderRadius: '25px',
          overflow: 'hidden',
          marginTop: '20px',
        }}
      >
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          Error loading stats: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        background: theme.palette.background.gradient,
        marginTop: '20px',
        borderRadius: '25px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('md')]: { width: '100%' },
        [theme.breakpoints.down('md')]: { width: '100%' },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.background.stripeBg,
          backgroundSize: '15px 15px',
          zIndex: 1
        }
      }}
    >
      {/* Header Title and Refresh Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 30,
          zIndex: 3,
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          width: 'calc(100% - 60px)',
          alignItems: 'center'
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: theme.palette.text.title,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 6px rgba(0,0,0,0.2)',
              fontSize: '2.5rem',
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Leaderboard sx={{ fontSize: 40, color: theme.palette.primary.main, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            Bingo Stats
          </Typography>
        </Zoom>
        <IconButton
          onClick={refreshStats}
          sx={{
            backgroundColor: theme.palette.background.offwhite,
            '&:hover': { backgroundColor: `${theme.palette.background.offwhite}CC` }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          p: 2,
          mt: 8,
          zIndex: 2,
          height: 'calc(100% - 80px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 1, height: '30%' }}>
          <Grid item xs={12} sm={4}>
            <Grow in={showCards} timeout={500}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  height: '20vh',
                  background: getCardBackground(0),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation[2]}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <EmojiEvents sx={{ fontSize: 40, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold' }}>
                  {stats?.totalGames}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Games
                </Typography>
              </Paper>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grow in={showCards} timeout={700}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  height: '20vh',
                  background: getCardBackground(1),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation[2]}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <SportsScore sx={{ fontSize: 40, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold' }}>
                  {stats?.wins}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Wins
                </Typography>
              </Paper>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Grow in={showCards} timeout={900}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  height: '20vh',
                  background: getCardBackground(2),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation[2]}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Timeline sx={{ fontSize: 40, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold' }}>
                  {stats?.averageScore ? stats.averageScore.toFixed(1) : '0'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Avg Score
                </Typography>
              </Paper>
            </Grow>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '80%',
            backgroundColor: theme.palette.background.offwhite,
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
              Performance Metrics
            </Typography>
            <Box>
              <IconButton
                onClick={() => setChartType('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
                sx={{ backgroundColor: chartType === 'pie' ? theme.palette.background.offwhite : 'transparent' }}
              >
                <PieChartIcon />
              </IconButton>
              <IconButton
                onClick={() => setChartType('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
                sx={{ backgroundColor: chartType === 'bar' ? theme.palette.background.offwhite : 'transparent' }}
              >
                <ShowChart />
              </IconButton>
            </Box>
          </Box>
          <Fade in={showCharts} timeout={800}>
            <Box sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
              {chartType === 'pie' ? (
                <CustomPieChart data={preparePieData()} />
              ) : (
                <CustomBarChart data={prepareBarData()} />
              )}
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
};

export default BingoStatsSchema;