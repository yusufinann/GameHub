import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Fade,
  Stack,
  IconButton
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

function LoginSrc() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "https://cdn.pixabay.com/photo/2024/10/07/20/38/ai-generated-9103752_1280.jpg",
    "https://cdn.pixabay.com/photo/2024/10/03/14/13/orc-9093828_1280.jpg",
    "https://cdn.pixabay.com/photo/2024/03/02/15/41/ai-generated-8608836_1280.png",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Image with Fade Effect */}
      <Fade in timeout={800}>
        <Box
          component="img"
          src={images[currentImage]}
          alt="background"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }
          }}
        />
      </Fade>

      {/* Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }}
      />

      {/* Main Content */}
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center">
          {/* Title Section */}
          <Box textAlign="center">
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 100,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 7,
              }}
            >
              Discover Your Next
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: 'rgba(255, 255, 255, 0.50)',
                fontWeight: 50,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 5,
              }}
            >
              Gaming Adventure
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                fontWeight: 50,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              Access thousands of games in one place
            </Typography>
          </Box>

          {/* Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                color: 'black',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  bgcolor: 'rgba(214, 207, 207, 0.49)',
                },
              }}
            >
              Explore Games
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'white',
                fontWeight: 'bold',
                px: 4,
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.9)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Learn More
            </Button>
          </Stack>

          {/* Image Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handlePrev}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowLeft />
            </IconButton>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {images.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: index === currentImage ? 'white' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: index === currentImage ? 'white' : 'rgba(255,255,255,0.7)',
                    },
                  }}
                />
              ))}
            </Box>

            <IconButton
              onClick={handleNext}
              sx={{ color: 'white' }}
            >
              <KeyboardArrowRight />
            </IconButton>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

export default LoginSrc;