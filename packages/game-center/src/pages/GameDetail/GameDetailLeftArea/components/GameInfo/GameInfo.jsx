import React from 'react';
import {Box} from '@mui/material';
import GameInfoHeader from './GameInfoHeader';
import GameInfoDetails from './GameInfoDetails';

function GameInfo({game, filteredLobbies }) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        boxShadow: '0 10px 40px rgba(34,193,195,0.2)',
        overflow: 'hidden',
      }}
    >
      <GameInfoHeader game={game} filteredLobbies={filteredLobbies}/>
      <Box sx={{ px: 2 }}>
        <GameInfoDetails
          game={game}
          filteredLobbies={filteredLobbies}
        />
      </Box>
    </Box>
  );
}

export default GameInfo;