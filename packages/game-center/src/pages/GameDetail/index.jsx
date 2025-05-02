import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, keyframes } from '@mui/material';
import GameDetailLeftArea from './GameDetailLeftArea';
import GameDetailRightArea from './GameDetailRightArea';
import { GAMES } from '../../utils/constants';
import { useLobbyContext } from '../../shared/context/LobbyContext/context';

const GameDetail = () => {
  const { gameId } = useParams();
  const { lobbies, existingLobby } = useLobbyContext();
  const [filteredLobbies, setFilteredLobbies] = useState([]);

  const fadeIn = keyframes`
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  useEffect(() => {
    if (lobbies) {
      const activeLobbies = lobbies.filter((lobby) => lobby.game === gameId);
      setFilteredLobbies(activeLobbies);
    }
  }, [lobbies, gameId]);

  const game = GAMES.find((g) => g.id.toString() === gameId);

  if (!game) {
    return (
      <Box p={3}>
        <Typography variant="h4">Game Not Found!</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'transparent',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        flexWrap: 'wrap',
        animation: `${fadeIn} 0.6s ease-out 0.2s both`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <GameDetailLeftArea
        game={game}
        filteredLobbies={filteredLobbies}
      />
      <GameDetailRightArea
        lobbies={lobbies}
        existingLobby={existingLobby}
        filteredLobbies={filteredLobbies}
      />
    </Box>
  );
};

export default GameDetail;