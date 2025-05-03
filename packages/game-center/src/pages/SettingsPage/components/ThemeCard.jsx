import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  alpha,
  Grow
} from '@mui/material';
import { 
  DarkMode as DarkModeIcon, 
  LightMode as LightModeIcon,
  WaterDrop as WaterDropIcon
} from '@mui/icons-material';

const ThemeCard = ({ isDarkMode, isNeonOceanMode, handleThemeChange, language, animateCards }) => {
  const theme = useTheme();
  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;
  const bg = theme.palette.background;
  
  // Enhanced glow based on current theme
  const cardBgGlow = isDarkMode 
    ? `0 0 25px ${alpha(primary.dark, 0.5)}, 0 0 15px ${alpha(secondary.main, 0.3)}` 
    : isNeonOceanMode
      ? `0 0 25px ${alpha('#1a6b99', 0.5)}, 0 0 15px ${alpha('#48b6df', 0.3)}`
      : `0 0 25px ${alpha(primary.main, 0.15)}, 0 0 15px ${alpha(secondary.main, 0.1)}`;

  // Current theme mode text
  const currentThemeText = isDarkMode 
    ? (language === 'tr' ? 'Koyu Tema' : 'Dark Theme')
    : isNeonOceanMode
      ? (language === 'tr' ? 'Neon Ocean Tema' : 'Neon Ocean Theme')
      : (language === 'tr' ? 'Açık Tema' : 'Light Theme');

  // Current theme icon
  const ThemeIcon = isDarkMode 
    ? DarkModeIcon 
    : isNeonOceanMode
      ? WaterDropIcon
      : LightModeIcon;

  // Helper function to determine current theme value
  const getCurrentThemeValue = () => {
    if (isDarkMode) return 'dark';
    if (isNeonOceanMode) return 'neonOcean';
    return 'light';
  };

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
            background: isNeonOceanMode
              ? 'linear-gradient(135deg, #1a6b99 0%, #48b6df 100%)'
              : `linear-gradient(135deg, ${primary.main} 0%, ${secondary.main} 100%)`,
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
              <ThemeIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white">
              {language === 'tr' ? 'TEMA' : 'THEME'}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            {/* Theme toggle UI with toggle buttons for 3 themes */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              mb: 2
            }}>
              <Typography variant="body1" fontWeight="medium" mb={1}>
                {currentThemeText}
              </Typography>
              
              <ToggleButtonGroup
                value={getCurrentThemeValue()}
                exclusive
                onChange={(e, newValue) => {
                  // Only apply if a valid value is selected and it's different from current
                  if (newValue !== null) {
                    handleThemeChange(newValue);
                  }
                }}
                aria-label="theme selection"
                fullWidth
                sx={{
                  '& .MuiToggleButtonGroup-grouped': {
                    border: 1,
                    borderColor: alpha(theme.palette.text.primary, 0.12),
                    '&.Mui-selected': {
                      backgroundColor: isNeonOceanMode 
                        ? alpha('#48b6df', 0.2) 
                        : alpha(primary.main, 0.2),
                      color: isNeonOceanMode 
                        ? '#1a6b99' 
                        : primary.main
                    },
                  },
                }}
              >
                <ToggleButton value="light" aria-label="light theme">
                  <LightModeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {language === 'tr' ? 'Açık' : 'Light'}
                  </Typography>
                </ToggleButton>
                <ToggleButton value="neonOcean" aria-label="neonOcean theme">
                  <WaterDropIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {language === 'tr' ? 'Neon Ocean' : 'Neon Ocean'}
                  </Typography>
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark theme">
                  <DarkModeIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {language === 'tr' ? 'Koyu' : 'Dark'}
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Theme Preview Cards */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mt: 4,
              p: 1,
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              {/* Light Theme Preview */}
              <Box 
                onClick={() => handleThemeChange('light')}
                sx={{ 
                  width: { xs: '30%', sm: 80 }, 
                  height: { xs: 120, sm: 140 }, 
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #caecd5, #fff)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: (!isDarkMode && !isNeonOceanMode) ? 'scale(1.05)' : 'scale(1)',
                  border: (!isDarkMode && !isNeonOceanMode) ? `2px solid ${primary.main}` : 'none',
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

              {/* Neon Ocean Theme Preview */}
              <Box 
                onClick={() => handleThemeChange('neonOcean')}
                sx={{ 
                  width: { xs: '30%', sm: 80 }, 
                  height: { xs: 120, sm: 140 }, 
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #48b6df, #1a6b99)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: isNeonOceanMode ? 'scale(1.05)' : 'scale(1)',
                  border: isNeonOceanMode ? `2px solid #48b6df` : 'none',
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
                  backgroundColor: '#81d4fa' 
                }} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '25%', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '60px',
                  borderRadius: '3px',
                  backgroundColor: '#b3e5fc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1
                }}>
                  <Box sx={{ width: '70%', height: 3, backgroundColor: '#4fc3f7', borderRadius: 1 }} />
                  <Box sx={{ width: '50%', height: 3, backgroundColor: '#4fc3f7', borderRadius: 1 }} />
                  <Box sx={{ width: '60%', height: 3, backgroundColor: '#4fc3f7', borderRadius: 1 }} />
                </Box>
              </Box>

              {/* Dark Theme Preview */}
              <Box 
                onClick={() => handleThemeChange('dark')}
                sx={{ 
                  width: { xs: '30%', sm: 80 }, 
                  height: { xs: 120, sm: 140 }, 
                  borderRadius: 3,
                  background: 'linear-gradient(to bottom, #1d2e4a, #0f1924)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: isDarkMode ? 'scale(1.05)' : 'scale(1)',
                  border: isDarkMode ? `2px solid ${primary.darker || primary.dark}` : 'none',
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