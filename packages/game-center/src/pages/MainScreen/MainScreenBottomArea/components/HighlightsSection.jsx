import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Chip} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const HighlightsSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const featuredGames = [
    {
      id: 1,
      title: "Arma 3",
      images: {
        main: "https://wallpapercave.com/wp/wp1948123.jpg",
        thumbnails: [
          "https://wallpapercave.com/wp/wp1948117.jpg",
          "https://wallpapercave.com/uwp/uwp4706340.jpeg",
          "https://wallpapercave.com/wp/wp1948117.jpg",
          "https://wallpapercave.com/wp/wp1948127.jpg",
        ]
      },
      status: "Yayınlandı",
      mostSold: "En Çok Satan",
      originalPrice: "$14.99",
      discount: "88%",
      currentPrice: "$1.79 USD",
      platforms: ["windows", "mac"]
    },
    {
      id: 2,
      title: "Half-Life 2",
      images: {
        main: "https://wallpapercave.com/wp/wp2897666.jpg",
        thumbnails: [
          "https://wallpapercave.com/wp/wp2897668.jpg",
          "https://wallpapercave.com/wp/wp2897688.jpg",
          "https://wallpapercave.com/wp/wp2897685.jpg",
          "https://wallpapercave.com/wp/wp2897685.jpg",
        ]
      },
      status: "Yayınlandı",
      mostSold: "En Çok Satan",
      originalPrice: "$9.99",
      discount: "75%",
      currentPrice: "$2.49 USD",
      platforms: ["windows", "mac", "linux"]
    },
    {
      id: 3,
      title: "GTA V",
      images: {
        main: "https://wallpapercave.com/wp/wp11870780.jpg",
        thumbnails: [
          "https://wallpapercave.com/wp/wp7282947.jpg",
          "https://wallpapercave.com/wp/wp12978113.jpg",
          "https://wallpapercave.com/wp/wp4095932.jpg",
          "https://wallpapercave.com/wp/wp5301143.jpg",
        ]
      },
      status: "Yayınlandı",
      mostSold: "En Çok Satan",
      originalPrice: "$29.99",
      discount: "50%",
      currentPrice: "$14.99 USD",
      platforms: ["windows"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % featuredGames.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? featuredGames.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % featuredGames.length);
  };

  const handleDotClick = (index) => {
    setActiveSlide(index);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '60vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#171a21', 
      }}
    >
      {/* Main Slider */}
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          transition: 'transform 0.5s ease',
          transform: `translateX(-${activeSlide * 100}%)`,
        }}
      >
        {featuredGames.map((game) => (
          <Box
            key={game.id}
            sx={{
              minWidth: '100%',
              height: '100%',
              position: 'relative',
              display: 'flex',
            }}
          >
            {/* Left arrow */}
            <IconButton
              onClick={handlePrevSlide}
              sx={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 0,
                height: '100%',
                width: '36px',
                zIndex: 10,
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            {/* Main image section - left two-thirds */}
            <Box
              sx={{
                width: '65%',
                height: '100%',
                position: 'relative',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden' // Added to contain the image
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${game.images.main})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </Box>

            {/* Info panel - right third */}
            <Box
              sx={{
                width: '35%',
                height: '100%',
                backgroundColor: '#42b781 ', // Slightly lighter than the background
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden' // Added to ensure content doesn't overflow
              }}
            >
              {/* Game title area */}
              <Box
                sx={{
                  padding: '20px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: '#328761',
                }}
              >
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 600 }}>
                  {game.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Typography variant="body1" sx={{ color: '#8f98a0' }}>
                    {game.status}
                  </Typography>
                  {game.mostSold && (
                    <Chip
                      label={game.mostSold}
                      size="small"
                      sx={{
                        backgroundColor: '#3a9f71',
                        color: 'white',
                        fontSize: '0.75rem',
                        height: '24px',
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Thumbnails grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  padding: '8px',
                  flex: 1,
                  overflow: 'auto' // Allow scrolling if thumbnails are too many
                }}
              >
                {game.images.thumbnails.map((thumbnail, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: '100%',
                      height: '120px', // Fixed height for thumbnails
                      border: '1px solid rgba(255,255,255,0.1)',
                      overflow: 'hidden' // Ensure image is contained
                    }}
                  >
                    <Box
                      component="img"
                      src={thumbnail}
                      alt={`${game.title} screenshot ${idx + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Cover the container while maintaining aspect ratio
                        display: 'block' // Remove any bottom spacing
                      }}
                    />
                  </Box>
                ))}
              </Box>

              {/* Price area */}
              <Box
                sx={{
                  padding: '12px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#3a9f71',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      backgroundColor: '#4c9f38', // Green discount background
                      padding: '2px 5px',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                      -{game.discount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#bbc2c8',
                        textDecoration: 'line-through',
                        fontSize: '0.75rem',
                      }}
                    >
                      {game.originalPrice}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {game.currentPrice}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {game.platforms.includes('windows') && (
                    <Box
                      sx={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Windows icon placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                    </Box>
                  )}
                  {game.platforms.includes('mac') && (
                    <Box
                      sx={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Mac icon placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                        <path d="M9 2h6l1 7h-8z"></path>
                        <path d="M4 14.5c0 3.5 2 6.5 5 6.5h6c3 0 5-3 5-6.5 0-3-1-5.5-3.5-5.5h-9c-2.5 0-3.5 2.5-3.5 5.5z"></path>
                      </svg>
                    </Box>
                  )}
                  {game.platforms.includes('linux') && (
                    <Box
                      sx={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Linux icon placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                        <path d="M2 17l10 5 10-5"></path>
                        <path d="M2 12l10 5 10-5"></path>
                      </svg>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Right arrow */}
            <IconButton
              onClick={handleNextSlide}
              sx={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 0,
                height: '100%',
                width: '36px',
                zIndex: 10,
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.5)' },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        ))}
      </Box>

      {/* Dot indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '6px',
          zIndex: 2,
        }}
      >
        {featuredGames.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => handleDotClick(idx)}
            sx={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              backgroundColor: idx === activeSlide ? '#cccccc' : '#555555',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                backgroundColor: idx === activeSlide ? '#ffffff' : '#777777',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HighlightsSection;