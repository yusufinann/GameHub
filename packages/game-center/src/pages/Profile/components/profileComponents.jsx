import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grow,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Tabs, 
  Tab   
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  Assessment, 
} from '@mui/icons-material';

export const StatCard = ({ icon: Icon, title, value, delay, theme, sx: sxProp }) => {
  return (
    <Grow in={true} timeout={1000} style={{ transitionDelay: `${delay || 0}ms` }}>
      <Card sx={{
        height: '100%',
        background: theme.palette.background.card,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${theme.palette.background.dot}`,
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: theme.shadows[6],
          background: theme.palette.background.gradient,
          '& .title': {
            color: theme.palette.text.contrast || theme.palette.primary.contrastText
          },
          '& .value': {
            color: theme.palette.text.contrast || theme.palette.primary.contrastText,
            transform: 'scale(1.1)'
          },
          '& .icon': {
            color: theme.palette.text.contrast || theme.palette.primary.contrastText,
            transform: 'rotate(360deg)'
          }
        },
        ...sxProp
      }}>
        <CardContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 3
        }}>
          <Icon className="icon" sx={{
            fontSize: 40,
            color: theme.palette.primary.main,
            mb: 2,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
          <Typography className="value" variant="h2" sx={{
            mb: 1,
            transition: 'all 0.3s ease',
            fontWeight: 800,
            color: theme.palette.mode === 'light'
              ? (theme.palette.primary.darker || theme.palette.primary.dark)
              : (theme.palette.secondary.light),
            textShadow: `0 2px 4px ${theme.palette.background.dot}`,
            fontSize: '2.5rem',
            '&:hover': {
              color: theme.palette.text.contrast || theme.palette.primary.contrastText,
              textShadow: 'none'
            }
          }}>
            {value}
          </Typography>
          <Typography className="title" variant="body2" sx={{
            transition: 'all 0.3s ease',
            color: theme.palette.text.secondary,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

export const ProfileSection = {
  Achievements: ({
    bingoLongestStreak,
    bingoWinRate,
    bingoLoading, 
    bingoTotalGames,
    hangmanWinRate,     
    hangmanAccuracy,    
    hangmanLoading,     
    hangmanTotalGames,  
    theme,
    t,
  }) => {
    const [activeAchievementTab, setActiveAchievementTab] = React.useState(0); // 0 for Bingo, 1 for Hangman

    const handleTabChange = (event, newValue) => {
      setActiveAchievementTab(newValue);
    };

    const bingoAchievementsData = [
      {
        id: 'bingo-longest-streak',
        iconComponent: TrendingUp,
        nameKey: 'Longest Streak',
        fallbackName: 'Longest Streak',
        value: bingoLoading ? '...' : bingoLongestStreak,
        color: theme.palette.primary.main,
      },
      {
        id: 'bingo-win-rate',
        iconComponent: EmojiEvents,
        nameKey: 'Win Rate',
        fallbackName: 'Win Rate',
        value: bingoLoading ? '...' : `${bingoWinRate}%`,
        color: theme.palette.secondary.main,
      },
    ];

    const hangmanAchievementsData = [
      {
        id: 'hangman-win-rate',
        iconComponent: EmojiEvents,
        nameKey: 'Win Rate',
        fallbackName: 'Win Rate',
        value: hangmanLoading ? '...' : `${hangmanWinRate}%`,
        color: theme.palette.primary.main,
      },
      {
        id: 'hangman-accuracy',
        iconComponent: Assessment,
        nameKey: 'Guess Accuracy',
        fallbackName: 'Guess Accuracy',
        value: hangmanLoading ? '...' : `${hangmanAccuracy}%`, 
        color: theme.palette.secondary.main,
      },
    ];

    const renderAchievements = (data, gameLoading, gameTotalGames, noActivityKey, noActivityFallback) => {
      if (gameLoading) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: 150 }}>
            <CircularProgress />
          </Box>
        );
      }

      if (gameTotalGames === undefined || gameTotalGames === 0) {
        return (
            <Grid container spacing={2} sx={{p:2, pt: 3}}> 
                <Grid item xs={12}>
                   <Typography sx={{ textAlign:'center', color: 'text.secondary'}}>
                       {t(noActivityKey, noActivityFallback)}
                   </Typography>
                </Grid>
            </Grid>
       );
   }

      return (
        <Grid container spacing={2} sx={{ pt: 2 }}> 
          {data.map((achievement) => {
            const IconCmp = achievement.iconComponent;
            return (
              <Grid item xs={12} sm={6} key={achievement.id}> 
                <Paper sx={{
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}>
                  <Box sx={{ color: achievement.color, display: 'flex', alignItems: 'center' }}>
                    <IconCmp sx={{ fontSize: { xs: '2.2rem', sm: '2.8rem' } }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h2" 
                      sx={{
                        color: theme.palette.text.secondary,
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        mb: 0.5
                      }}
                    >
                      {t(achievement.nameKey, achievement.fallbackName)}
                    </Typography>
                    <Typography variant="h2" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                      {achievement.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      );
    };

    return (
      <>
        <Tabs
          value={activeAchievementTab}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label={t("profile.achievements.tabsAriaLabel", "Game Achievements Tabs")}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }} 
        >
          <Tab
            label={t("Bingo")}
            id="achievements-bingo-tab"
            aria-controls="achievements-bingo-panel"
          />
          <Tab
            label={t("Hangman")}
            id="achievements-hangman-tab"
            aria-controls="achievements-hangman-panel"
          />
        </Tabs>

        <Box role="tabpanel" hidden={activeAchievementTab !== 0} id="achievements-bingo-panel" aria-labelledby="achievements-bingo-tab">
          {activeAchievementTab === 0 && renderAchievements(
            bingoAchievementsData,
            bingoLoading,
            bingoTotalGames,
            'profile.achievements.noBingoActivity',
            'No Bingo game activity yet to show achievements.'
          )}
        </Box>
        <Box role="tabpanel" hidden={activeAchievementTab !== 1} id="achievements-hangman-panel" aria-labelledby="achievements-hangman-tab">
          {activeAchievementTab === 1 && renderAchievements(
            hangmanAchievementsData,
            hangmanLoading,
            hangmanTotalGames,
            'profile.achievements.noHangmanActivity',
            'No Hangman game activity yet to show achievements.'
          )}
        </Box>
      </>
    );
  },
};