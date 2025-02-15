import { Box, Typography, useTheme } from '@mui/material'
import React from 'react'

import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
function NoActiveLobbies() {
    const theme=useTheme();
  return (
    <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      color: theme.palette.common.white,
    }}
  >
    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 60, mb: 2 }} />
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
      Oops! No active lobbies found.
    </Typography>
  </Box>
  )
}

export default NoActiveLobbies