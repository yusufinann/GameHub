import React from 'react';
import { Box } from '@mui/material';
import { gameData } from '../../../../utils/constants';
import GameCardImage from './GameCardImage'; 

/**
 * Oyun kartlarını listeleyen ve ilk birkaç elemanın yüklenmesini
 * önceliklendiren akıllı bir liste bileşeni.
 * @param {object} props
 * @param {number} [props.priorityCount=0] - Yüksek öncelikle yüklenecek ilk eleman sayısı. 
 *                                            Sayfanın en üstündeki listeler için kullanılır.
 */
function GameList({ priorityCount = 0 }) {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      alignItems: 'center',
      gap: 3,
      overflowX: 'auto',
    }}>
      {gameData.map((game, index) => (
        <GameCardImage
          key={game.id}
          game={game}
          priority={index < priorityCount ? 'high' : 'lazy'}
        />
      ))}
    </Box>
  );
}

export default GameList;