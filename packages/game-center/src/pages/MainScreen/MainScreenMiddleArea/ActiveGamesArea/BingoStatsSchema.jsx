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
import { useAuthContext } from '../../../../shared/context/AuthContext'; // Bu yolun projenize uygun olduğundan emin olun
import { useTranslation } from 'react-i18next';
import { fetchBingoPlayerStats } from './api';


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
  const { t } = useTranslation();

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setLoading(false); 
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setShowCards(false);
        setShowCharts(false);
        const data = await fetchBingoPlayerStats(userId);
        setStats(data);
        setTimeout(() => setShowCards(true), 300);
        setTimeout(() => setShowCharts(true), 900);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]); 

  const refreshStats = async () => {
    if (!userId) return;
    setShowCards(false);
    setShowCharts(false);
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBingoPlayerStats(userId);
      setStats(data);
   
      setTimeout(() => setShowCards(true), 300);
      setTimeout(() => setShowCharts(true), 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const preparePieData = () => {
    if (!stats || typeof stats.wins !== 'number' || typeof stats.totalGames !== 'number' || stats.totalGames === 0) {
        return [
            { name: t('Wins'), value: 0, color: theme.palette.success.main },
            { name: t('Losses'), value: 100, color: theme.palette.error.main }
        ];
    }
    const winRate = (stats.wins / stats.totalGames) * 100;
    return [
      { name: t('Wins'), value: winRate, color: theme.palette.success.main },
      { name: t('Losses'), value: 100 - winRate, color: theme.palette.error.main }
    ];
  };

  const prepareBarData = () => {
    if (!stats || !stats.games || stats.games.length === 0) return [];
    return stats.games
      .slice(0, 5)
      .map(game => ({
        name: game.lobbyCode || 'N/A',
        score: game.score || 0,
        rank: game.finalRank || 0
      }))
      .reverse();
  };

  const CustomPieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) { 
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                 <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="60" fill={theme.palette.background.default} stroke={theme.palette.text.secondary} strokeWidth="1" opacity="0.3" />
                </svg>
                <Typography variant="body2" sx={{color: theme.palette.text.secondary, mt: 2}}>
                    {t("No data for chart")}
                </Typography>
            </Box>
        );
    }
    let startAngle = 0;

    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, index) => {
            if (item.value === 0) return null; 
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
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3, flexWrap: 'wrap' }}>
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

  const CustomBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                 <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                    {t("No game history for chart")}
                </Typography>
            </Box>
        );
    }

    const maxScore = Math.max(...data.map(item => item.score), 5); 
    const maxRankValue = Math.max(...data.map(item => item.rank), 5); 

    const svgHeight = 300;
    const svgWidth = 400;
    const padding = { top: 30, right: 20, bottom: 80, left: 60 };
    const chartHeight = svgHeight - padding.top - padding.bottom;
    const chartWidth = svgWidth - padding.left - padding.right;
    const barWidth = Math.max(5, (chartWidth / data.length) / 2.5); 
    const barSpacing = Math.max(2, (chartWidth / data.length) - (2 * barWidth));


    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 1, overflowX: 'auto' }}>
        <svg width={Math.max(svgWidth, data.length * (2 * barWidth + barSpacing) + padding.left + padding.right)} height={svgHeight} >
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke={theme.palette.text.secondary}
            strokeWidth="1.5"
          />
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={Math.max(svgWidth - padding.right, data.length * (2*barWidth + barSpacing) + padding.left)}
            y2={svgHeight - padding.bottom}
            stroke={theme.palette.text.secondary}
            strokeWidth="1.5"
          />
          {[0, 1, 2, 3, 4, 5].map((tick, index) => {
            const y = svgHeight - padding.bottom - (chartHeight * tick / 5);
            return (
              <g key={`y-tick-${index}`}>
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
                  fontSize="12"
                  fontWeight="bold"
                >
                  {(maxScore * tick / 5).toFixed(0)}
                </text>
              </g>
            );
          })}
          {data.map((item, index) => {
            const x = padding.left + (index * (2 * barWidth + barSpacing)) + barSpacing / 2;
            const scoreHeight = item.score > 0 ? (item.score / maxScore) * chartHeight : 0;
            const rankHeight = item.rank > 0 ? (item.rank / maxRankValue) * chartHeight : 0;
            return (
              <g key={`bar-${index}`}>
                <rect
                  x={x}
                  y={svgHeight - padding.bottom - scoreHeight}
                  width={barWidth}
                  height={scoreHeight}
                  fill={theme.palette.primary.main}
                  rx={3}
                  stroke={theme.palette.primary.dark}
                  strokeWidth="1"
                />
                <rect
                  x={x + barWidth + 4}
                  y={svgHeight - padding.bottom - rankHeight}
                  width={barWidth}
                  height={rankHeight}
                  fill={theme.palette.secondary.main}
                  rx={3}
                  stroke={theme.palette.secondary.dark}
                  strokeWidth="1"
                />
                <text
                  x={x + barWidth + 2}
                  y={svgHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill={theme.palette.text.primary}
                  fontSize="10"
                  fontWeight="bold"
                  transform={`rotate(-45 ${x + barWidth + 2} ${svgHeight - padding.bottom + 20})`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}
          <rect x={svgWidth - 170} y={padding.top - 15} width={12} height={12} fill={theme.palette.primary.main} stroke={theme.palette.primary.dark} strokeWidth="1" />
          <text x={svgWidth - 155} y={padding.top - 5} fill={theme.palette.text.primary} fontSize="12" fontWeight="bold">
            {t("Score")}
          </text>
          <rect x={svgWidth - 80} y={padding.top - 15} width={12} height={12} fill={theme.palette.secondary.main} stroke={theme.palette.secondary.dark} strokeWidth="1" />
          <text x={svgWidth - 65} y={padding.top - 5} fill={theme.palette.text.primary} fontSize="12" fontWeight="bold">
            {t("Rank")}
          </text>
        </svg>
      </Box>
    );
  };

  const getCardBackground = (index) => {
    const gradients = [
      `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
      `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={4}
        height="80vh"
        sx={{
          background: theme.palette.background.gradientB || theme.palette.background.default,
          borderRadius: '25px',
          overflow: 'hidden',
          marginTop: '20px',
        }}
      >
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

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
          {t("Error loading stats")}: {error}
        </Alert>
      </Box>
    );
  }
  
  if (!stats && !loading && !userId) {
     return (
        <Box p={4} display="flex" justifyContent="center" alignItems="center" height="80vh"
            sx={{ background: theme.palette.background.gradientB || theme.palette.background.default, borderRadius: '25px', marginTop: '20px' }}>
            <Alert severity="info" sx={{ borderRadius: '12px' }}>{t("Please log in to view stats.")}</Alert>
        </Box>
     );
  }


  if (!stats && !loading && userId) { 
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" height="80vh"
           sx={{ background: theme.palette.background.gradientB || theme.palette.background.default, borderRadius: '25px', marginTop: '20px' }}>
        <Alert severity="info" sx={{ borderRadius: '12px' }}>
          {t("No stats available yet. Play some games!")}
        </Alert>
        <IconButton onClick={refreshStats} sx={{ ml: 2, backgroundColor: theme.palette.background.paper, color: theme.palette.primary.main }}>
            <Refresh />
        </IconButton>
      </Box>
    );
  }


  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        background: theme.palette.background.gradient || theme.palette.background.default,
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
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 30,
          right: 30,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'calc(100% - 60px)',
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: theme.palette.text.title || theme.palette.primary.main,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 6px rgba(0,0,0,0.2)',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Leaderboard sx={{ fontSize: { xs: 30, md: 40 }, color: theme.palette.primary.main, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            {t("Bingo Stats")}
          </Typography>
        </Zoom>
        <IconButton
          onClick={refreshStats}
          disabled={loading}
          sx={{
            backgroundColor: theme.palette.background.offwhite || theme.palette.background.paper,
            '&:hover': { backgroundColor: theme.palette.background.paper },
            color: theme.palette.primary.main
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      <Box
        sx={{
          p: {xs: 1, sm: 2},
          mt: {xs: 9, sm: 8},
          zIndex: 2,
          height: 'calc(100% - 80px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
           '&::-webkit-scrollbar': { width: '8px' },
           '&::-webkit-scrollbar-track': { background: theme.palette.background.paper, borderRadius: '4px' },
           '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: '4px' },
           '&::-webkit-scrollbar-thumb:hover': { background: theme.palette.primary.dark }
        }}
      >
        <Grid container spacing={2} sx={{ flexShrink: 0 }}>
          <Grid item xs={12} sm={4}>
            <Grow in={showCards} timeout={500}>
              <Paper
                elevation={4}
                sx={{
                  p: 2,
                  minHeight: {xs: '15vh', sm: '20vh'},
                  background: getCardBackground(0),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation?.[3] || 'rgba(0,0,0,0.2)'}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <EmojiEvents sx={{ fontSize: {xs:30, sm:40}, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold', fontSize: {xs:'1.5rem', sm:'2rem'} }}>
                  {stats?.totalGames || 0}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.contrast, opacity: 0.8, fontSize: {xs:'0.8rem', sm:'1rem'} }}>
                  {t("Total Games")}
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
                  minHeight: {xs: '15vh', sm: '20vh'},
                  background: getCardBackground(1),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation?.[3] || 'rgba(0,0,0,0.2)'}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <SportsScore sx={{ fontSize: {xs:30, sm:40}, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold', fontSize: {xs:'1.5rem', sm:'2rem'} }}>
                  {stats?.wins || 0}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.contrast, opacity: 0.8, fontSize: {xs:'0.8rem', sm:'1rem'} }}>
                  {t("Wins")}
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
                  minHeight: {xs: '15vh', sm: '20vh'},
                  background: getCardBackground(2),
                  borderRadius: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 16px ${theme.palette.background.elevation?.[3] || 'rgba(0,0,0,0.2)'}`,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Timeline sx={{ fontSize: {xs:30, sm:40}, color: theme.palette.text.contrast, mb: 1 }} />
                <Typography variant="h4" sx={{ color: theme.palette.text.contrast, fontWeight: 'bold', fontSize: {xs:'1.5rem', sm:'2rem'} }}>
                  {stats?.averageScore ? stats.averageScore.toFixed(1) : '0.0'}
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.contrast, opacity: 0.8, fontSize: {xs:'0.8rem', sm:'1rem'} }}>
                  {t("Avg Score")}
                </Typography>
              </Paper>
            </Grow>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            minHeight: '350px', 
            backgroundColor: theme.palette.background.offwhite || theme.palette.background.paper,
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            p: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 2, pt: 1, flexShrink: 0 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', fontSize: {xs:'1rem', sm:'1.25rem'} }}>
              {t("Performance Metrics")}
            </Typography>
            <Box>
              <IconButton
                onClick={() => setChartType('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
                sx={{ 
                  backgroundColor: chartType === 'pie' ? theme.palette.primary.main : 'transparent',
                  color: chartType === 'pie' ? theme.palette.text.contrast : theme.palette.text.secondary,
                  mr: 0.5,
                  '&:hover': {
                    backgroundColor: chartType === 'pie' ? theme.palette.primary.dark : theme.palette.background.paper
                  }
                }}
              >
                <PieChartIcon />
              </IconButton>
              <IconButton
                onClick={() => setChartType('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
                sx={{ 
                  backgroundColor: chartType === 'bar' ? theme.palette.primary.main : 'transparent',
                  color: chartType === 'bar' ? theme.palette.text.contrast : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: chartType === 'bar' ? theme.palette.primary.dark : theme.palette.background.paper
                  }
                }}
              >
                <ShowChart />
              </IconButton>
            </Box>
          </Box>
          <Fade in={showCharts} timeout={800}>
            <Box sx={{ flexGrow: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: {xs:1, sm:2}, overflow: 'hidden' }}>
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