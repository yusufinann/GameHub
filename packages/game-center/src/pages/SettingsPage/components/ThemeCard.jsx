import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Switch,
  useTheme,
  alpha,
  Grow
} from '@mui/material';
import { 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon,
} from '@mui/icons-material';

const ThemeCard = ({ isDarkMode, handleThemeChange, language, animateCards }) => {
  const theme = useTheme();
  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;
  const bg = theme.palette.background;
  const cardBgGlow = isDarkMode 
    ? `0 0 25px ${alpha(primary.dark, 0.5)}, 0 0 15px ${alpha(secondary.main, 0.3)}` 
    : `0 0 25px ${alpha(primary.main, 0.15)}, 0 0 15px ${alpha(secondary.main, 0.1)}`;

  return (
     <Box sx={{ width: { xs: '100%', md: '50%' }, p: 2 }}>
    <Grow in={animateCards} timeout={300}>
      <Paper 
        elevation={6}
        sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          background: alpha(bg.card, 0.8),
          backdropFilter: 'blur(10px)',
          boxShadow: cardBgGlow,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: `0 10px 30px ${alpha(primary.main, 0.2)}`
          }
        }}
      >
        <Box sx={{ 
          background: `linear-gradient(135deg, ${primary.main} 0%, ${secondary.main} 100%)`,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            width: 50, 
            height: 50, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          }}>
            {isDarkMode ? <DarkModeIcon fontSize="large" /> : <LightModeIcon fontSize="large" />}
          </Box>
          <Typography variant="h5" fontWeight="bold" color="white">
            {language === 'tr' ? 'TEMA' : 'THEME'}
          </Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            mb: 2,
            backgroundColor: alpha(bg.default, 0.5),
            borderRadius: 3
          }}>
            <Typography variant="body1" fontWeight="medium">
              {isDarkMode 
                ? (language === 'tr' ? 'Koyu Tema' : 'Dark Theme') 
                : (language === 'tr' ? 'Açık Tema' : 'Light Theme')}
            </Typography>
            <Switch
              checked={isDarkMode}
              onChange={handleThemeChange}
              color="primary"
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: isDarkMode ? '#1a1a2e' : primary.main
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: isDarkMode ? '#2e2e4e' : primary.light
                }
              }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            mt: 4,
            p: 2
          }}>
            <Box 
              onClick={() => {
                if (isDarkMode) handleThemeChange();
              }}
              sx={{ 
                width: 100, 
                height: 150, 
                borderRadius: 3,
                background: 'linear-gradient(to bottom, #caecd5, #fff)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: !isDarkMode ? 'scale(1.05)' : 'scale(1)',
                border: !isDarkMode ? `2px solid ${primary.main}` : 'none',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: '10%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '80%',
                height: '10px',
                borderRadius: '3px',
                backgroundColor: '#7cccc4' 
              }} />
              <Box sx={{ 
                position: 'absolute', 
                top: '25%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '60%',
                height: '60px',
                borderRadius: '3px',
                backgroundColor: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1
              }}>
                <Box sx={{ width: '70%', height: 3, backgroundColor: '#ddd', borderRadius: 1 }} />
                <Box sx={{ width: '50%', height: 3, backgroundColor: '#ddd', borderRadius: 1 }} />
                <Box sx={{ width: '60%', height: 3, backgroundColor: '#ddd', borderRadius: 1 }} />
              </Box>
            </Box>

            <Box 
              onClick={() => {
                if (!isDarkMode) handleThemeChange();
              }}
              sx={{ 
                width: 100, 
                height: 150, 
                borderRadius: 3,
                background: 'linear-gradient(to bottom, #1d2e4a, #0f1924)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                transform: isDarkMode ? 'scale(1.05)' : 'scale(1)',
                border: isDarkMode ? `2px solid ${primary.darker}` : 'none',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: '10%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '80%',
                height: '10px',
                borderRadius: '3px',
                backgroundColor: '#2c5282' 
              }} />
              <Box sx={{ 
                position: 'absolute', 
                top: '25%', 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '60%',
                height: '60px',
                borderRadius: '3px',
                backgroundColor: '#2d3748',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 1
              }}>
                <Box sx={{ width: '70%', height: 3, backgroundColor: '#4a5568', borderRadius: 1 }} />
                <Box sx={{ width: '50%', height: 3, backgroundColor: '#4a5568', borderRadius: 1 }} />
                <Box sx={{ width: '60%', height: 3, backgroundColor: '#4a5568', borderRadius: 1 }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Grow>
    </Box>
  );
};

export default ThemeCard;