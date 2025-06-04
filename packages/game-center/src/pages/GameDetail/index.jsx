import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, keyframes } from '@mui/material';
import GameDetailLeftArea from './GameDetailLeftArea';
import GameDetailRightArea from './GameDetailRightArea';
import { GAMES } from '../../utils/constants';
import { useLobbyContext } from '../../shared/context/LobbyContext/context';
import { useTranslation } from 'react-i18next';

const GameDetail = () => {
  const { gameId } = useParams();
  const { t } = useTranslation();
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
      const now = new Date();
      const nowTime = now.getTime();

      const gameSpecificLobbies = lobbies.filter((lobby) => {
        if (lobby.game !== gameId || !lobby.isActive) {
          return false;
        }
        if (lobby.lobbyType === 'event') {
          if (!lobby.endTime || new Date(lobby.endTime).getTime() <= nowTime) {
            return false;
          }
        }
        return true;
      });

      const sortedLobbies = [...gameSpecificLobbies].sort((a, b) => {
        const aIsEvent = a.lobbyType === 'event';
        const bIsEvent = b.lobbyType === 'event';

        let aCategory, bCategory;

        if (aIsEvent) {
          const aStartTimeMs = a.startTime ? new Date(a.startTime).getTime() : nowTime;
          aCategory = aStartTimeMs <= nowTime ? 0 : 1;
        } else {
          aCategory = 2;
        }

        if (bIsEvent) {
          const bStartTimeMs = b.startTime ? new Date(b.startTime).getTime() : nowTime;
          bCategory = bStartTimeMs <= nowTime ? 0 : 1;
        } else {
          bCategory = 2;
        }

        if (aCategory !== bCategory) {
          return aCategory - bCategory;
        }

        if (aIsEvent && bIsEvent) {
          const aHasSpecificStartTime = !!a.startTime;
          const bHasSpecificStartTime = !!b.startTime;

          if (aHasSpecificStartTime && bHasSpecificStartTime) {
            const stA = new Date(a.startTime).getTime();
            const stB = new Date(b.startTime).getTime();
            if (stA !== stB) {
              return stA - stB;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          } else if (aHasSpecificStartTime && !bHasSpecificStartTime) {
            return -1;
          } else if (!aHasSpecificStartTime && bHasSpecificStartTime) {
            return 1;
          } else {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        }

        if (!aIsEvent && !bIsEvent) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return 0;
      });

      setFilteredLobbies(sortedLobbies);
    }
  }, [lobbies, gameId]);

  const game = GAMES.find((g) => g.id.toString() === gameId);

  if (!game) {
    return (
      <Box p={3}>
        <Typography variant="h4">{t("Game Not Found!")}</Typography>
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
        gameId={gameId}
      />
    </Box>
  );
};

export default GameDetail;