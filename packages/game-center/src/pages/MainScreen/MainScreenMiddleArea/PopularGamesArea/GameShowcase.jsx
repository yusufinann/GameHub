import { Box, Typography, IconButton, Paper } from '@mui/material';
import React, { useState, useEffect } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import GamesIcon from '@mui/icons-material/Games';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import StarIcon from '@mui/icons-material/Star';

const GameShowcase = () => {
  // Oyun verileri ve görselleri
  const games = [
    { 
      id: 1, 
      title: 'Space Adventure', 
      rating: 4.8, 
      category: 'Action',
      imageUrl: 'https://images.unsplash.com/photo-1547025603-ef800f02690e?q=80&w=2100&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      color: '#4caf50' // Yeşil
    },
    { 
      id: 2, 
      title: 'Monster Hunter', 
      rating: 4.5, 
      category: 'RPG',
      imageUrl: 'https://wallpapercave.com/wp/wp10779455.jpg',
      color: '#2196f3' // Mavi  
    },
    { 
      id: 3, 
      title: 'Racing Legends', 
      rating: 4.2, 
      category: 'Sports',
      imageUrl: 'https://wallpapercave.com/uwp/uwp4701154.jpeg',
      color: '#ff9800' // Turuncu  
    },
    { 
      id: 4, 
      title: 'Zombie Survival', 
      rating: 4.7, 
      category: 'Horror',
      imageUrl: 'https://wallpapercave.com/wp/wp10779462.jpg',
      color: '#009688' // Turkuaz  
    },
    { 
      id: 5, 
      title: 'Treasure Island', 
      rating: 4.0, 
      category: 'Adventure',
      imageUrl: 'https://wallpapercave.com/wp/wp10779479.jpg',
      color: '#00bcd4' // Açık Turkuaz  
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Ana uygulama arka plan rengi
  const appBackgroundColor = 'rgb(157,222,175)';
  // Kart arka plan rengi - ana renge yakın ama biraz daha açık ton
  const cardBackgroundColor = 'rgb(175,230,190)';

  // Otomatik slayt değişimi
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % games.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [games.length]);

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % games.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length);
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: appBackgroundColor, 
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}
    >
      {/* Üst Başlık */}
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          backgroundColor: 'rgba(255,255,255,0.7)', // Yarı şeffaf beyaz
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#333333', 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600
          }}
        >
          <GamesIcon sx={{ mr: 1, color: games[activeIndex].color }} /> Popular Games
        </Typography>
        <Box>
          <IconButton 
            onClick={handlePrev}
            sx={{ color: games[activeIndex].color }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton 
            onClick={handleNext}
            sx={{ color: games[activeIndex].color }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Ana İçerik */}
      <Box 
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'relative',
          background: `linear-gradient(135deg, ${appBackgroundColor} 0%, rgba(140,210,160,0.8) 100%)`
        }}
      >
        {/* Arka plan dekoratif elementleri */}
        <Box 
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(220,255,220,0.2) 100%)',
            zIndex: 0
          }}
        />
        
        {/* Oyun kartları karuseli */}
        <Box 
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            transition: 'transform 0.5s ease',
            transform: 'translateX(0%)',
            zIndex: 1
          }}
        >
          {games.map((game, index) => {
            const isActive = index === activeIndex;
            const isNext = (index === (activeIndex + 1) % games.length);
            const isPrev = (index === (activeIndex - 1 + games.length) % games.length);
            
            return (
              <Paper
                key={game.id}
                elevation={isActive ? 10 : 3}
                onMouseEnter={() => setHoveredCard(game.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  width: isActive ? '260px' : '180px',
                  height: isActive ? '220px' : '160px',
                  margin: '0 10px',
                  display: isActive || isNext || isPrev ? 'flex' : 'none',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  transform: isActive ? 'scale(1)' : 'scale(0.85)',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.5s ease',
                  color: 'white',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  order: isActive ? 0 : (isNext ? 1 : -1),
                  zIndex: isActive ? 2 : 1,
                  background: cardBackgroundColor, // Uygulamanın rengine uyumlu kart arka planı
                  borderRadius: 2,
                  border: isActive ? `3px solid ${game.color}` : 'none',
                }}
              >
                {/* Oyun görseli */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${game.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(rgba(0,0,0,0.1), ${game.color}cc)`,
                    }
                  }}
                />
                
                <Box sx={{ zIndex: 1, position: 'relative', p: 1.5 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      color: game.color,
                      padding: '2px 8px',
                      borderRadius: 4,
                      display: 'inline-block',
                      fontWeight: 'bold'
                    }}
                  >
                    {game.category}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                    {game.title}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    zIndex: 1,
                    p: 1.5,
                    position: 'relative'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}>
                    <StarIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                    <Typography variant="body2" sx={{ ml: 0.5, color: '#333' }}>
                      {game.rating}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    <SportsEsportsIcon sx={{ fontSize: 18, color: game.color }} />
                  </Box>
                </Box>
                
                {hoveredCard === game.id && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      background: `linear-gradient(transparent, ${game.color})`,
                      padding: 1,
                      transform: 'translateY(0)',
                      transition: 'transform 0.3s ease',
                      zIndex: 2
                    }}
                  >
                    <Typography 
                      align="center" 
                      variant="button" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <SportsEsportsIcon sx={{ mr: 1, fontSize: 16 }} />
                      HEMEN OYNA
                    </Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
      
      {/* Nokta navigasyonu */}
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: 1,
          backgroundColor: 'rgba(255,255,255,0.7)', // Yarı şeffaf beyaz
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        {games.map((game, index) => (
          <Box
            key={index}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              margin: '0 4px',
              backgroundColor: index === activeIndex ? game.color : '#e0e0e0',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default GameShowcase;