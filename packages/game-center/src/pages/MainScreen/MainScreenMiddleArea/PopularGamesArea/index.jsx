import { Box } from '@mui/material';
import React from 'react';
import GameShowcase from './GameShowcase';
import GameList from './GameList';

const PopularGamesArea = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "column",
        },
        height: { xs: '100%', md: '70vh' },
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: { xs: '100%', md: '40vh' },
          width: { xs: '100%', md: '40vw' }
        }}
      >
        <GameShowcase priority="high" />
      </Box>
      <Box
        sx={{
          height: "40vh",
          mt: 2,
          width: "40vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <GameList priorityCount={3} />
      </Box>
    </Box>
  );
};

export default PopularGamesArea;