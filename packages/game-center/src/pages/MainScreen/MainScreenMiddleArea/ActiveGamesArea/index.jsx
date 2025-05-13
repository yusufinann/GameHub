import { Box, Button, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import React, { useState, useRef } from 'react';
import { Gamepad, ChevronLeft, ChevronRight, Construction, EmojiEvents } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../../../../utils/constants';
import Header from '../../MainScreenBottomArea/Header';
import { useTranslation } from 'react-i18next';

function ActiveGamesArea() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = 400;
    const targetScroll = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const isGameFullyImplemented = (gameId) => {
    return gameId === 1 || gameId === 2;
  };

  const handleGameClick = (gameId) => {
    if (isGameFullyImplemented(gameId)) {
      navigate(`/game-detail/${gameId}`);
    } else {
      navigate(`/game-detail/${gameId}?preview=true`);
    }
  };

  // Kart boyutunu ekran boyutuna göre hesapla
  const getCardWidth = () => {
    if (isSmallScreen) return '240px';
    if (isMediumScreen) return '280px';
    return '320px';
  };

  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: { width: '100%' },
        [theme.breakpoints.down('md')]: { width: '100%' },
        height: "50vh",
        background: 'transparent',
        marginTop: "20px",
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
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
      {/* Use the reusable Header component */}
      <Header
        title={t("Game Paradise Awaits")}
        // Choose your icon:
        icon={<Gamepad />} 
        variant="default"
        theme={theme}    
      />

      <Box sx={{
        position: 'relative',
        height: '40vh',
        width: '100%',
        zIndex: 2
      }}>
        {/* Navigation Arrows */}
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor:  theme.palette.background.dot,
            backdropFilter: 'blur(5px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronLeft fontSize="large" />
        </IconButton>

        {/* Right Arrow */}
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: theme.palette.background.dot,
            backdropFilter: 'blur(5px)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              transform: 'translateY(-50%) scale(1.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            color: '#022b3a',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronRight fontSize="large" />
        </IconButton>

        {/* Scrollable Container */}
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: { xs: 2, md: 3 },
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            '&::-webkit-scrollbar': { display: 'none' },
            height: '100%',
            padding: '0 40px',
            alignItems: 'center'
          }}
        >
          {GAMES.map((game, index) => {
            const fullyImplemented = isGameFullyImplemented(game.id);

            return (
              <Box
                key={game.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleGameClick(game.id)}
                sx={{
                  flex: '0 0 auto',
                  width: getCardWidth(),
                  aspectRatio: '16/9',
                  position: 'relative',
                  borderRadius: '25px',
                  overflow: 'hidden',
                  height: { xs: '75%', md: '80%' },
                  cursor: 'pointer',
                  scrollSnapAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: hoveredIndex === index
                    ? fullyImplemented ? '0 12px 32px rgba(78, 205, 196, 0.5)' : '0 12px 32px rgba(255, 180, 0, 0.5)'
                    : '0 6px 16px rgba(0, 0, 0, 0.2)',
                  border: '2px solid',
                  borderColor: hoveredIndex === index
                    ? fullyImplemented ? '#4ECDC4' : '#FFB400'
                    : 'transparent',
                  transform: hoveredIndex === index ? 'translateY(-8px) scale(1.03)' : 'translateY(0) scale(1)'
                }}
              >
                {/* Game status badge for non-implemented games */}
                {!fullyImplemented && (
                  <Box sx={{
                    position: 'absolute',
                    top: 15,
                    right: 15,
                    zIndex: 5,
                    backgroundColor: theme.palette.warning.light,
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <Construction fontSize="small" />
                    <Typography variant="caption" fontWeight="bold">{t("Preview Mode")}</Typography>
                  </Box>
                )}

                {/* Image Container - enhanced transition and effects */}
                <Box
                  component="img"
                  src={game.image}
                  alt={t(`${game.translationKey}.title`)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                    filter: !fullyImplemented
                      ? 'brightness(0.85)'
                      : hoveredIndex === index
                        ? 'brightness(1.1)'
                        : 'brightness(0.9)',
                    transition: 'transform 0.6s ease-out, filter 0.4s ease', // Daha yumuşak geçiş
                    transform: hoveredIndex === index ? 'scale(1.08)' : 'scale(1)' // Daha belirgin büyütme
                  }}
                />

                {/* Game highlight for Bingo */}
                {fullyImplemented && (
                  <Box sx={{
                    position: 'absolute',
                    top: 15,
                    left: 15,
                    zIndex: 5,
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <EmojiEvents fontSize="small" />
                    <Typography variant="caption" fontWeight="bold">{t("FULLY READY!")}</Typography>
                  </Box>
                )}

                {/* Content Overlay - enhanced blur effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 80%, transparent 100%)', // Geliştirilmiş gradient
                    backdropFilter: 'blur(3px)', // Daha belirgin blur efekti
                    transition: 'all 0.3s ease-in-out',
                    height: hoveredIndex === index ? 'auto' : 'auto', // Hover durumunda otomatik yükseklik
                  }}
                >
                  <Typography variant="h6" sx={{
                    color: '#fff',
                    mb: 1,
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {t(`${game.translationKey}.title`)}
                  </Typography>

                  {/* Game Info Icons */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    '& > *': {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                    }
                  }}>
                    <Box>
                    </Box>
                  </Box>

                  {/* Play Button - Now all are active */}
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation(); // Çift tıklama sorununu önle
                      handleGameClick(game.id);
                    }}
                    fullWidth
                    sx={{
                      bgcolor: fullyImplemented ? theme.palette.secondary.light : theme.palette.warning.light,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      padding: '10px 0',
                      transition: 'all 0.3s ease',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      '&:hover': {
                        bgcolor: fullyImplemented ? theme.palette.secondary.main  : theme.palette.warning.main,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.3)'
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      }
                    }}
                  >
                    {fullyImplemented ? t('Play Now') : t('Try Preview')}
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default ActiveGamesArea;