import React, { useState } from 'react';
import { Box, Button, Typography, Fade, Paper, useTheme } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const FeaturedGameItem = ({ title, thumbnail, openGiveawayUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useTheme();

  return (
    <Paper
      elevation={isHovered ? 8 : 3}
      sx={{
        width: '100%',
        height: { xs: '240px', sm: '280px', md: '320px' },
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        '&:hover': {
          boxShadow: `0 12px 24px ${theme.palette.success.main}40`,
        },
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.open(openGiveawayUrl, '_blank')}
    >
      <Box
        sx={{
          backgroundImage: `url(${thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'transform 0.6s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: isHovered
              ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.85) 100%)'
              : 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.9) 85%)',
            transition: 'background 0.4s ease',
          }
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: { xs: '12px', sm: '16px' },
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            mb: { xs: 1, sm: 1.5 },
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '90%',
            mx: 'auto'
          }}
        >
          {title}
        </Typography>

        <Fade in={isHovered}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              backgroundColor: theme.palette.success.main,
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '24px',
              padding: { xs: '6px 16px', sm: '8px 24px' },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(openGiveawayUrl, '_blank');
            }}
          >
            Şimdi Oyna
          </Button>
        </Fade>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: isHovered
            ? 'linear-gradient(45deg, rgba(46, 125, 50, 0.2) 0%, rgba(0, 0, 0, 0) 100%)'
            : 'none',
          transition: 'all 0.4s ease',
          opacity: isHovered ? 1 : 0,
          zIndex: 1
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          transform: 'skewX(-15deg)',
          transition: 'all 0.7s ease',
          opacity: isHovered ? 1 : 0,
          zIndex: 2
        }}
      />
    </Paper>
  );
};

export default FeaturedGameItem;