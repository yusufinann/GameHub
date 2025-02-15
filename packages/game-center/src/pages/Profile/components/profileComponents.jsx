import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grow, 
  Grid,
  Paper,
  Box,
  Chip
} from '@mui/material';
import { profileTheme, colorScheme } from '../profileTheme';
import { SportsEsports } from '@mui/icons-material';

export const StatCard = ({ icon: Icon, title, value, delay }) => (
  <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
    <Card sx={{
      height: '100%',
      background: colorScheme.cardBg,
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        background: colorScheme.hoverGradient,
        // '& .icon': {
        //   transform: 'rotate(360deg) scale(1.2)',
        // },
        '& .title': {
          color: '#fff'
        },
        '& .value': {
          color: '#fff',
          transform: 'scale(1.1)'
        }
      }
    }}>
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Icon className="icon" sx={{
          fontSize: 40,
          color: profileTheme.palette.primary.main,
          mb: 1,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
        <Typography className="value" variant="h4" sx={{
          mb: 1,
          transition: 'all 0.3s ease'
        }}>
          {value}
        </Typography>
        <Typography className="title" variant="body2" color="text.secondary" sx={{
          transition: 'all 0.3s ease'
        }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  </Grow>
);

export const ProfileSection = {
  Achievements: ({ achievements, theme }) => (
    <Grid container spacing={2}>
      {achievements.map((achievement) => (
        <Grid item xs={12} sm={6} md={4} key={achievement.id}>
          <Paper sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
          }}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
              {achievement.icon}
            </Typography>
            <Box>
              <Typography variant="subtitle1">{achievement.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(achievement.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  ),

  RecentGames: ({ recentGames }) => (
    <Grid container spacing={2}>
      {recentGames.map((game) => (
        <Grid item xs={12} key={game.id}>
          <Paper sx={{ 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': { transform: 'translateX(4px)', transition: 'transform 0.2s' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SportsEsports color="primary" />
              <Box>
                <Typography variant="subtitle1">{game.game}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(game.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1">{game.score} puan</Typography>
              <Chip 
                label={game.result}
                color={game.result === 'Kazandı' ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  ),

  GameStats: ({ stats }) => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Paper sx={{ p: 3, height: '90%' }}>
          <Typography variant="h6" gutterBottom>Oyun İstatistikleri</Typography>
          <Box sx={{ mt: 2 }}>
            {[
              { label: 'Toplam Galibiyet', value: stats.totalWins, color: 'success.main' },
              { label: 'Toplam Mağlubiyet', value: stats.totalLosses, color: 'error.main' },
              { label: 'En Sevilen Oyun', value: stats.favoriteGame, color: 'primary.main' },
              { label: 'Mevcut Seri', value: `${stats.currentStreak} oyun` }
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{item.label}:</Typography>
                <Typography color={item.color}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6}>
      </Grid>
    </Grid>
  )
};