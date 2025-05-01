import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

const Header = ({ title, icon, variant = 'default', theme }) => {
  // Different style variants
  const variants = {
    default: {
      container: {
        borderRadius: 2,
        py: 1.5,
        px: 2.5,
        mt:2,
        boxShadow: 3,
        background: theme.palette.background.gradient,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette.secondary.gold}, ${theme.palette.secondary.main}, ${theme.palette.secondary.gold})`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
      },
      title: {
        fontWeight: 900,
        background: theme.palette.text.title,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      icon: {
        fontSize: '2rem',
        color: theme.palette.secondary.gold,
        mr: 2,
        filter: `drop-shadow(0 0 5px ${theme.palette.background.elevation[1]})`,
        transition: 'transform 0.4s ease',
        '&:hover': {
          transform: 'scale(1.1)',
        }
      },
      divider: {
        mt: 2,
        border: 'none',
        height: '2px',
        background: `linear-gradient(90deg, transparent 0%, ${theme.palette.secondary.main} 50%, transparent 100%)`,
        opacity: 0.7,
      },
      indicators: {
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }
    },
    trending: {
      container: {
        borderRadius: 2,
        py: 1.5,
        px: 2.5,
        boxShadow: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.card} 0%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${theme.palette.secondary.light}22, transparent)`,
          transform: 'skewX(-15deg)',
          animation: 'flash 3s infinite',
        },
        '@keyframes flash': {
          '0%': { transform: 'translateX(-150%) skewX(-15deg)' },
          '100%': { transform: 'translateX(150%) skewX(-15deg)' },
        },
      },
      title: {
        fontWeight: 900,
        background: `linear-gradient(45deg, ${theme.palette.secondary.gold}, ${theme.palette.text.primary})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textTransform: 'uppercase',
        letterSpacing: '2px',
      },
      icon: {
        fontSize: '2.2rem',
        color: theme.palette.secondary.gold,
        mr: 2,
        filter: `drop-shadow(0 0 8px ${theme.palette.background.elevation[2]})`,
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      divider: {
        mt: 2,
        border: 'none',
        height: '2px',
        background: `linear-gradient(90deg, ${theme.palette.secondary.gold}22 0%, ${theme.palette.secondary.gold} 50%, ${theme.palette.secondary.gold}22 100%)`,
      },
      indicators: {
        display: 'flex',
        gap: 1,
        alignItems: 'center',
      }
    },
    featured: {
      container: {
        borderRadius: 2,
        py: 1.5,
        px: 2.5,
        boxShadow: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      },
      title: {
        fontWeight: 800,
        color: theme.palette.text.contrast,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textShadow: `0 2px 4px ${theme.palette.background.elevation[3]}`,
      },
      icon: {
        fontSize: '2.2rem',
        color: theme.palette.secondary.gold,
        mr: 2,
        filter: 'brightness(1.3)',
        transition: 'transform 0.3s ease-out',
        '&:hover': {
          transform: 'rotate(10deg)',
        }
      },
      divider: {
        mt: 2,
        border: 'none',
        height: '3px',
        background: theme.palette.secondary.main,
        opacity: 0.8,
      },
      indicators: {
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
      }
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <Box sx={currentVariant.container}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && React.cloneElement(icon, {
            sx: currentVariant.icon
          })}
          <Typography variant="h2" sx={currentVariant.title}>
            {title}
          </Typography>
        </Box>
        
        {/* Indicator dots/decorative elements */}
        <Box sx={currentVariant.indicators}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.palette.primary.main,
              boxShadow: `0 0 5px ${theme.palette.background.elevation[1]}`
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.palette.primary.medium,
              boxShadow: `0 0 5px ${theme.palette.background.elevation[1]}`
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.palette.secondary.main,
              boxShadow: `0 0 5px ${theme.palette.background.elevation[1]}`
            }}
          />
        </Box>
      </Box>
      <Divider sx={currentVariant.divider} />
    </Box>
  );
};

export default Header;