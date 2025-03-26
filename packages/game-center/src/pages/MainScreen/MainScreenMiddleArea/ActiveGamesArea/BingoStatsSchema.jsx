// BingoStatsSchema.js
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
  
  // Fetch user stats on mount and when userId değişirse.
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        console.log("userId henüz hazır değil, stats çekimi atlanıyor.");
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bingo/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Stats çekilirken bir hata oluştu');
        }
        const data = await response.json();
        setStats(data);
        // Animasyonları tetiklemek için gecikmeler
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

  // Yenileme fonksiyonu
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
          throw new Error('Stats yenilenirken bir hata oluştu');
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

  // Pie chart için veri hazırlama
  const preparePieData = () => {
    if (!stats) return [];
    const winRate = (stats.wins / stats.totalGames) * 100 || 0;
    return [
      { name: 'Wins', value: winRate, color: '#4CAF50' },
      { name: 'Losses', value: 100 - winRate, color: '#F44336' }
    ];
  };

  // Bar chart için veri hazırlama (son 5 oyuna göre)
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

  // Farklı kartlar için gradient arka planlar
  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #b1ddf1 0%, #4a9fdc 100%)',
      'linear-gradient(135deg, #c5e1a5 0%, #8bc34a 100%)',
      'linear-gradient(135deg, #ffcc80 0%, #ff9800 100%)'
    ];
    return gradients[index % gradients.length];
  };

  // Özel PieChart bileşeni
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
                stroke="#fff"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
          {data.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
              <Typography variant="body2" sx={{ color: '#fff' }}>
                {item.name}: {item.value.toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // Özel BarChart bileşeni
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
            stroke="#888"
            strokeWidth="1.5"
          />
          {/* X-Axis */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="#888"
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
                  stroke="#888"
                  strokeWidth="1.5"
                />
                <text
                  x={padding.left - 15}
                  y={y + 6}
                  textAnchor="end"
                  fill="#333"
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
                  fill="#0066CC"
                  rx={3}
                  stroke="#004080"
                  strokeWidth="1"
                />
                {/* Rank Bar */}
                <rect
                  x={x + barWidth + 4}
                  y={svgHeight - padding.bottom - rankHeight}
                  width={barWidth}
                  height={rankHeight}
                  fill="#FF6600"
                  rx={3}
                  stroke="#CC5500"
                  strokeWidth="1"
                />
                {/* X-Axis Label */}
                <text
                  x={x + barWidth + 2}
                  y={svgHeight - padding.bottom + 30}
                  textAnchor="middle"
                  fill="#333"
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
          <rect x={svgWidth - 170} y={padding.top} width={15} height={15} fill="#0066CC" stroke="#004080" strokeWidth="1" />
          <text x={svgWidth - 150} y={padding.top + 12} fill="#333" fontSize="14" fontWeight="bold">
            Score
          </text>
          <rect x={svgWidth - 80} y={padding.top} width={15} height={15} fill="#FF6600" stroke="#CC5500" strokeWidth="1" />
          <text x={svgWidth - 60} y={padding.top + 12} fill="#333" fontSize="14" fontWeight="bold">
            Rank
          </text>
        </svg>
      </Box>
    );
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
        height="80vh"
        sx={{
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.2) 100%)',
          borderRadius: '25px',
          overflow: 'hidden',
          marginTop: '20px',
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: '#1976d2' }} />
      </Box>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Box
        p={4}
        sx={{
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%)',
          borderRadius: '25px',
          overflow: 'hidden',
          marginTop: '20px',
        }}
      >
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          Stats yüklenirken hata oluştu: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, rgb(173, 216, 230) 0%, rgb(25, 118, 210) 100%)',
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
          background: `linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%),
                       linear-gradient(-45deg, rgba(255,255,255,0.05) 25%, transparent 25%)`,
          backgroundSize: '15px 15px',
          zIndex: 1
        }
      }}
    >
      {/* Üst Başlık ve Yenile Butonu */}
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
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 800,
              background: 'linear-gradient(45deg, #1976d2 0%, #64b5f6 100%)',
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
            <Leaderboard sx={{ fontSize: 40, color: '#1976d2', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            Bingo Stats
          </Typography>
        </Zoom>
        <IconButton
          onClick={refreshStats}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      {/* Ana İçerik */}
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
        {/* İstatistik Kartları */}
        <Grid container spacing={2} sx={{ mb: 1, height: '30%' }}>
          <Grid item xs={12} sm={4}>
            <Grow in={showCards} timeout={500}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  height: '15vh',
                  background: getGradient(0),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <EmojiEvents sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
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
                  height: '15vh',
                  background: getGradient(1),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <SportsScore sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
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
                  height: '15vh',
                  background: getGradient(2),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Timeline sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {stats?.averageScore ? stats.averageScore.toFixed(1) : '0'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Avg Score
                </Typography>
              </Paper>
            </Grow>
          </Grid>
        </Grid>

        {/* Grafik Bölümü */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '80%',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
              Performance Metrics
            </Typography>
            <Box>
              <IconButton
                onClick={() => setChartType('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
                sx={{ backgroundColor: chartType === 'pie' ? 'rgba(255,255,255,0.3)' : 'transparent' }}
              >
                <PieChartIcon />
              </IconButton>
              <IconButton
                onClick={() => setChartType('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
                sx={{ backgroundColor: chartType === 'bar' ? 'rgba(255,255,255,0.3)' : 'transparent' }}
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
