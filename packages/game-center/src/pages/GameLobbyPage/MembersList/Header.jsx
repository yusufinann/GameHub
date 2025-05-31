import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, EmojiEvents as TrophyIcon } from '@mui/icons-material';

function Header({ count, isCollapsed, onToggle,t }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 1,
        borderBottom: '2px solid #1a237e',
        p: 1,
      }}
    >
      {!isCollapsed && (
        <>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#1a237e',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <TrophyIcon fontSize="small" /> {t("Members")}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              bgcolor: '#1a237e',
              color: 'white',
              px: 1.5,
              py: 0.3,
              borderRadius: '12px',
              fontSize: '0.7rem',
            }}
          >
            {count}
          </Typography>
        </>
      )}
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          ml: isCollapsed ? 'auto' : 1,
          color: '#1a237e',
        }}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>
    </Box>
  );
}

export default Header;