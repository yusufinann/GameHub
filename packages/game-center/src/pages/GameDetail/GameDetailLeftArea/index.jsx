import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import GameInfo from './components/GameInfo/GameInfo';
import BingoGameDetail from './components/BingoGameDetail';
import HangmanGameDetails from './components/HangmanGameDetail';

function GameDetailLeftArea({ game, filteredLobbies }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getGameDetail = (id) => {
    switch (id) {
      case 1:
        return <BingoGameDetail />;
      case 2:
        return <HangmanGameDetails />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        flexBasis: { xs: 'auto', md: '65%' },
        width: { xs: '100%', md: '65%' }
      }}
    >
      <GameInfo game={game} filteredLobbies={filteredLobbies} />
      {getGameDetail(game.id)}
    </Box>
  );
}

export default GameDetailLeftArea;
