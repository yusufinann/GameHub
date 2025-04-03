import React, { useState } from 'react';
import { Box, Avatar, styled, Tooltip, Zoom,Typography, Popover } from '@mui/material';
import { People, Celebration } from '@mui/icons-material';

// Styled avatar with enhanced visual effects
const StyledAvatar = styled(Avatar)(({ theme, gradient, isHovered }) => ({
  width: 48,
  height: 48,
  fontSize: '1.1rem',
  background: gradient,
  border: '3px solid white',
  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  cursor: 'pointer',
  transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
  '&:hover': {
    transform: 'scale(1.2) rotate(5deg)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    zIndex: 100 + '!important',
  },
}));

// Customized tooltip
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: '#333',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -6,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #333',
    }
  },
}));

// Fun animation for the "more" avatar
const BounceAvatar = styled(StyledAvatar)(({ isOpen }) => ({
  animation: isOpen ? 'none' : 'bounce 2s infinite',
  '@keyframes bounce': {
    '0%, 100%': {
      transform: 'translateY(0) scale(1)',
    },
    '50%': {
      transform: 'translateY(-8px) scale(1.1)',
    }
  }
}));

function CustomAvatarGroup({ members, gradient, max = 7, getInitials }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayedMembers = members.slice(0, max);
  const extraMembers = members.slice(max);
  const extraCount = members.length - max;

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
    setIsExpanded(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsExpanded(false);
  };

  const open = Boolean(anchorEl);

  // Generate random background positions for the confetti pattern
  const getRandomPosition = () => {
    return `${Math.floor(Math.random() * 100)}% ${Math.floor(Math.random() * 100)}%`;
  };

  const confettiColors = ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'];
  
  // Create confetti background style
  const getConfettiStyle = (color, index) => ({
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '2px',
    backgroundColor: confettiColors[index % confettiColors.length],
    top: getRandomPosition(),
    left: getRandomPosition(),
    transform: `rotate(${Math.random() * 360}deg)`,
    opacity: 0.8,
    zIndex: 0,
  });

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        marginLeft: 2,
      }}
    >
      {/* Group Label with fun icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginRight: 2,
          backgroundColor: 'rgba(255, 225, 76, 0.2)',
          padding: '4px 10px',
          borderRadius: 20,
          transform: 'rotate(-2deg)',
          border: '1px dashed rgba(255, 225, 76, 0.5)',
        }}
      >
        <People sx={{ color: '#FFE14C', mr: 0.5, fontSize: 20 }} />
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'text.primary',
            fontFamily: '"Fredoka One", cursive',
          }}
        >
          {members.length}
        </Typography>
      </Box>
      
      {/* Avatar Stack */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            filter: 'blur(10px)',
            zIndex: -1,
          }
        }}
      >
        {displayedMembers.map((member, index) => (
          <StyledTooltip 
            title={member.name}
            key={index}
            TransitionComponent={Zoom}
            arrow
          >
            <StyledAvatar
              src={member.avatar || undefined}
              gradient={gradient}
              isHovered={hoveredIndex === index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                ml: index === 0 ? 0 : '-16px',
                zIndex: members.length - index,
                border: `3px solid ${
                  ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][index % 5]
                }`,
              }}
            >
              {!member.avatar && getInitials(member.name)}
            </StyledAvatar>
          </StyledTooltip>
        ))}
        
        {/* "More" Avatar with animation */}
        {extraCount > 0 && (
          <>
            <StyledTooltip 
              title={`Click to see ${extraCount} more players!`}
              arrow
            >
              <BounceAvatar
                isOpen={open}
                onClick={handleMoreClick}
                sx={{
                  ml: '-16px',
                  zIndex: 0,
                  background: 'linear-gradient(135deg, #FF9800, #F44336)',
                  border: '3px solid #FFD700',
                }}
              >
                +{extraCount}
              </BounceAvatar>
            </StyledTooltip>
            
            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 3,
                  padding: 2,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,240,240,0.95))',
                  border: '2px solid #FFE14C',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  position: 'relative',
                }
              }}
            >
              {/* Confetti decorations in popover */}
              {[...Array(10)].map((_, i) => (
                <Box key={i} sx={getConfettiStyle(confettiColors[i % 5], i)} />
              ))}
              
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <Celebration sx={{ color: '#FFD700', mr: 1 }} />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: '"Fredoka One", cursive',
                  }}
                >
                  More Players
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 300, position: 'relative', zIndex: 1 }}>
                {extraMembers.map((member, index) => (
                  <StyledTooltip key={index} title={member.name} arrow>
                    <StyledAvatar
                      src={member.avatar || undefined}
                      gradient={gradient}
                      sx={{
                        width: 40,
                        height: 40,
                        border: `3px solid ${
                          ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#9C27B0'][index % 5]
                        }`,
                      }}
                    >
                      {!member.avatar && getInitials(member.name)}
                    </StyledAvatar>
                  </StyledTooltip>
                ))}
              </Box>
            </Popover>
          </>
        )}
      </Box>
    </Box>
  );
}

export default CustomAvatarGroup;