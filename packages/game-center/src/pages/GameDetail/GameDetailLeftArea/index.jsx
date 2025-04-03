import React, { useEffect } from 'react'
import {Box} from '@mui/material';
 import GameInfo from './components/GameInfo/GameInfo';
import BingoGameDetails from './components/BingoGameDetail';
function GameDetailLeftArea({colorScheme,game,filteredLobbies}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
       <Box sx={{flex: '1 1 600px', minWidth: 0 }}>
        <GameInfo colorScheme={colorScheme} game={game} filteredLobbies={filteredLobbies}/>
        <BingoGameDetails colorScheme={colorScheme} />
     </Box>
  )
}

export default GameDetailLeftArea