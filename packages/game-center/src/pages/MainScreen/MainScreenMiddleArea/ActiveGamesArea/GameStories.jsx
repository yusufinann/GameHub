import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Button, 
  IconButton,
  Stack,
  Grow,
  Paper,
  useTheme,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import InfoIcon from '@mui/icons-material/Info';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';

const GameStories = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme=useTheme();
  const games = [
    {
      id: 1,
      title: 'Valheim',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg',
      releaseInfo: 'Yayınlandı: 2 Şub 2021',
      description: 'Efsanevi Viking savaşçılarının ölümden sonra yaşadığı mitolojik dünya Valheim\'da hayatta kalmak için savaşın. Valhalla\'ya layık olduğunuzu kanıtlamak için tehlikeli ormanları keşfedin ve dağları tırmanın.',
      originalPrice: '$10.49',
      discountedPrice: '$5.24 USD',
      discount: '-50%'
    },
    {
      id: 2,
      title: 'Half-Life: Alyx',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/546560/header.jpg',
      releaseInfo: 'Yayınlandı: 23 Mar 2020',
      description: 'Half-Life\'ın sanal gerçeklik dünyasında geçen bu yeni bölümünde, Combine\'ın artan gücüne karşı insanlığın tek umudu sizsiniz.',
      originalPrice: '$59.99',
      discountedPrice: '$8.09 USD',
      discount: '-85%'
    },
    {
      id: 3,
      title: 'Traffic Police',
      image: 'https://wallpapercave.com/wp/wp8747352.jpg',
      releaseInfo: 'Yayınlandı: 15 May 2023',
      description: 'Trafik polisi olarak görev yapın, trafik kurallarını ihlal edenleri yakalayın ve şehrin düzenini sağlayın.',
      originalPrice: '$14.99',
      discountedPrice: '$7.34 USD',
      discount: '-51%',
      isLive: true
    },
    {
      id: 4,
      title: 'Game 4',
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
      releaseInfo: 'Yayınlandı: 1 Jan 2023',
      description: 'Örnek oyun açıklaması burada yer alacak.',
      originalPrice: '$19.99',
      discountedPrice: '$9.99 USD',
      discount: '-50%'
    }
  ];
  const displayedGames = games.slice(currentIndex, currentIndex + 3);

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(games.length - 3, prev + 1));
  };

  const handleMouseEnter = (index) => {
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };


  return (
    <Box
      sx={{
        position: 'relative',
        height: '50vh',
        width: '100%',
        overflow: 'visible',
        backgroundColor: 'transparent',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Buttons & Navigation */}
      <Box sx={{
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderRadius: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center',
          p: 1, 
          gap: 2 
        }}>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, gap: 1 }}>
          <Typography variant="h4" sx={{color:'black', textShadow: '0 4px 6px rgba(0,0,0,0.2)',fontWeight: 800,filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            Adventure Stories
          </Typography>
        </Box>
      </Box>
    
      {/* Game Carousel */}
      <Stack 
        direction="row" 
        sx={{ 
          flex: 1, 
          position: 'relative',
          justifyContent: 'center', 
          alignItems: 'center',
          px: 6
        }}
      >
        {/* Navigation Arrows */}
        <IconButton 
          sx={{ 
            position: 'absolute', 
            left: 10, 
            zIndex: 10, 
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>

        {/* Games */}
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ 
            width: '100%',
            justifyContent: 'space-between',
            px: 2
          }}
        >
          {displayedGames.map((game, index) => {
            const isLastItem = index === displayedGames.length - 1;
            const showInfo = hoverIndex === index; // Sadece hover durumunda göster
            
            return (
              <Box
                key={game.id}
                sx={{
                  flex: 1,
                  position: 'relative',
                }}
              >
                {/* Main Game Card with Info Overlay Indicator */}
                <Box
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  sx={{ 
                    width: '100%',
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'visible',
                    zIndex: showInfo ? 50 : 1,
                    transition: 'transform 0.2s ease-out',
                    transform: showInfo ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': { 
                      cursor: 'pointer',
                      '& .overlay-indicator': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  <Card
                    sx={{ 
                      width: '100%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      backgroundColor: 'transparent',
                      position: 'relative'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={game.image}
                      alt={game.title}
                      sx={{ 
                        height: 140,
                        transition: 'all 0.3s ease',
                        filter: showInfo ? 'brightness(0.7)' : 'brightness(1)'
                      }}
                    />
                    
                    {/* Overlay Info Indicator - visible on hover */}
                    <Box 
                      className="overlay-indicator"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                      }}
                    >
                      <Box sx={{
                        display: 'flex',
                        gap: 1,
                        p: 1,
                        borderRadius: 8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                      }}>
                        <InfoIcon sx={{ color: 'white' }} />
                      </Box>
                    </Box>
                    
                    {/* Basic Info */}
                    <CardContent sx={{ 
                      backgroundColor: '#1a1a1a', 
                      color: 'white',
                      p: 1,
                      '&:last-child': { pb: 1 }
                    }}>
                      <Typography variant="subtitle1" noWrap>
                        {game.title}
                      </Typography>
                    </CardContent>
                    
                    {/* Live Badge */}
                    {game.isLive && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: 10,
                          top: 10,
                          backgroundColor: theme.palette.error.main,
                          color: 'white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          zIndex: 2
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                          }}
                        />
                        <Typography variant="caption">CANLI</Typography>
                      </Box>
                    )}
                  </Card>
                  
                  {/* Hover Details Speech Bubble Popup with Animation */}
                  {showInfo && (
                    <Grow in={showInfo} timeout={300}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 20,
                          ...(isLastItem 
                            ? { right: '100%' } 
                            : { left: '100%' }),
                          width: 320,
                          zIndex: 999,
                        }}
                      >
                        {/* Speech Bubble Container */}
                        <Box
                          sx={{
                            position: 'relative',
                            ...(isLastItem 
                              ? { mr: 1 } 
                              : { ml: 1 }),
                          }}
                        >
                          {/* Arrow/Tail for the speech bubble */}
                          <Box
                            sx={{
                              position: 'absolute',
                              ...(isLastItem 
                                ? { 
                                    right: -10,
                                    top: 20,
                                    width: 0,
                                    height: 0,
                                    borderTop: '10px solid transparent',
                                    borderLeft: `10px solid  ${theme.palette.secondary.paper}`,
                                    borderBottom: '10px solid transparent',
                                  } 
                                : {
                                    left: -10,
                                    top: 20,
                                    width: 0,
                                    height: 0,
                                    borderTop: '10px solid transparent',
                                    borderRight: `10px solid  ${theme.palette.secondary.paper}`,
                                    borderBottom: '10px solid transparent',
                                  }),
                            }}
                          />
                          
                          {/* Bubble Content */}
                          <Paper
                            elevation={6}
                            sx={{
                              backgroundColor: theme.palette.secondary.paper,
                              p: 2,
                              color: 'white',
                              borderRadius: 2,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Typography variant="h6" gutterBottom sx={{ color: '#90caf9' }}>
                                {game.title}
                              </Typography>
                              <Typography variant="caption" display="block" sx={{ color: 'white', mb: 1 }}>
                                {game.releaseInfo}
                              </Typography>
                              <Typography variant="body2">
                                {game.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                {game.discount && (
                                  <Box sx={{ bgcolor: '#4CAF50', color: 'white', px: 1, py: 0.5, borderRadius: 0.5 }}>
                                    {game.discount}
                                  </Box>
                                )}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textDecoration: 'line-through',
                                    color: '#aaa'
                                  }}
                                >
                                  {game.originalPrice}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    color: '#90caf9',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {game.discountedPrice}
                                </Typography>
                              </Box>
                              
                              {/* Action Buttons */}
                              <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                mt: 2,
                                gap: 1
                              }}>
                                <Button 
                                  variant="contained" 
                                  startIcon={<ShoppingCartIcon />}
                                  size="small"
                                  sx={{ 
                                    bgcolor: '#1a1a1a', 
                                    '&:hover': { bgcolor: '#333' } 
                                  }}
                                >
                                  Satın Al
                                </Button>
                                <Button 
                                  variant="contained" 
                                  startIcon={<PlayArrowIcon />}
                                  color="primary"
                                  size="small"
                                  sx={{   
                                    bgcolor: '#90caf9', 
                                    color: '#000',
                                    '&:hover': { bgcolor: '#64b5f6' } 
                                  }}
                                >
                                  Oyna
                                </Button>
                                <IconButton 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(255,255,255,0.1)', 
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                                  }}
                                >
                                  <FavoriteIcon fontSize="small" sx={{ color: 'white' }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Paper>
                        </Box>
                      </Box>
                    </Grow>
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>

        <IconButton 
          sx={{ 
            position: 'absolute', 
            right: 10, 
            zIndex: 10,
            color: 'white',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
          }}
          onClick={handleNext}
          disabled={currentIndex >= games.length - 3}
        >
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default GameStories;