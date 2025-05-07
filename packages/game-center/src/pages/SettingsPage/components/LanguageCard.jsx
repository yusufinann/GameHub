import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  Grow
} from '@mui/material';
import {
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next'; 

const LanguageCard = ({ language,handleLanguageChange, animateCards }) => {
  const theme = useTheme();
  const { t } = useTranslation(); 

  const primary = theme.palette.primary;
  const secondary = theme.palette.secondary;
  const textPalette = theme.palette.text;
  const bg = theme.palette.background;
  const cardBgGlow = theme.palette.mode === 'dark'
    ? `0 0 25px ${alpha(primary.dark, 0.5)}, 0 0 15px ${alpha(secondary.main, 0.3)}`
    : `0 0 25px ${alpha(primary.main, 0.15)}, 0 0 15px ${alpha(secondary.main, 0.1)}`;

  const currentLanguage = language; 

  return (
    <Box sx={{ width: { xs: '100%', md: '50%' }, p: 2 }}>
      <Grow in={animateCards} timeout={500}>
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
              boxShadow: `0 10px 30px ${alpha(secondary.main, 0.2)}`
            }
          }}
        >
          <Box sx={{
            background: `linear-gradient(135deg, ${secondary.main} 0%, ${primary.light || primary.main} 100%)`, 
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
              <LanguageIcon fontSize="large" />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white">
              {t('languageCard.title')}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 2 }}>
              <Box sx={{ width: '50%', p: 1.5 }}>
                <Paper
                  onClick={() => handleLanguageChange('tr')}
                  elevation={currentLanguage.startsWith('tr') ? 8 : 3} 
                  sx={{
                    backgroundColor: alpha(bg.default, 0.5),
                    p: 2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: currentLanguage.startsWith('tr') ? `2px solid ${primary.main}` : `2px solid transparent`,
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: primary.main, 
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{
                    width: 80,
                    height: 60,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    mb: 2
                  }}>
                    🇹🇷
                  </Box>
                  <Typography variant="h6" fontWeight="bold" textAlign="center">
                    {t('languageCard.turkish')}
                  </Typography>
                </Paper>
              </Box>
              <Box sx={{ width: '50%', p: 1.5 }}>
                <Paper
                  onClick={() => handleLanguageChange('en')}
                  elevation={currentLanguage.startsWith('en') ? 8 : 3} 
                  sx={{
                    backgroundColor: alpha(bg.default, 0.5),
                    p: 2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: currentLanguage.startsWith('en') ? `2px solid ${primary.main}` : `2px solid transparent`, 
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      borderColor: primary.main, 
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{
                    width: 80,
                    height: 60,
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    mb: 2
                  }}>
                    🇬🇧
                  </Box>
                  <Typography variant="h6" fontWeight="bold" textAlign="center">
                    {t('languageCard.english')}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            <Box sx={{
              mt: 3,
              p: 2,
              backgroundColor: alpha(bg.default, 0.3),
              borderRadius: 2,
              border: `1px dashed ${alpha(textPalette.primary, 0.1)}`,
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                {t('languageCard.preferenceNote')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default LanguageCard;