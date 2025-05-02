import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import GameInfo from './components/GameInfo/GameInfo';
import BingoGameDetails from './components/BingoGameDetail';

function GameDetailLeftArea({ game, filteredLobbies }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box
      sx={{
        flexGrow: 1,
        flexBasis: { xs: 'auto', md: '65%' },
        width: { xs: '100%', md: '65%' }
      }}
    >
      <GameInfo game={game} filteredLobbies={filteredLobbies} />
      <BingoGameDetails />
    </Box>
  );
}

export default GameDetailLeftArea;
