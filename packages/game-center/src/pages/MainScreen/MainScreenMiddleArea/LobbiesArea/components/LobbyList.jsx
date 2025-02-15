import React, { useMemo } from 'react';
import {Card, useTheme } from '@mui/material';
import LobbyItem from '../../../../../shared/LobbyItem/LobbyItem';
import NoActiveLobbies from '../../../../GameDetail/GameDetailRightArea/components/NoActiveLobbies';

export const LobbyList = ({ lobbies = []}) => {
  // Lobileri sıralama fonksiyonu
  const sortedLobbies = useMemo(() => {
    return [...lobbies].sort((a, b) => {
      // First priority: Event type lobbies always come first
      if (a.lobbyType === 'event' && b.lobbyType !== 'event') return -1;
      if (a.lobbyType !== 'event' && b.lobbyType === 'event') return 1;
      
      // Second priority: For event lobbies, sort by start time
      if (a.lobbyType === 'event' && b.lobbyType === 'event') {
        const dateA = new Date(`${a.startDate}T${a.startTime}`);
        const dateB = new Date(`${b.startDate}T${b.startTime}`);
        return dateA - dateB;
      }
      
      // Third priority: For non-event lobbies, sort by creation time (if available)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      return 0;
    });
  }, [lobbies]);
 const theme = useTheme();
 return (
  <Card
    sx={{
      p:1,
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      height:'100%',
      overflow: 'auto',
      position: 'relative',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        boxShadow: theme.shadows[12],
      },
    }}
  >
    {sortedLobbies.length > 0 ? (
      sortedLobbies.map((lobby, index) => (
        <LobbyItem key={lobby.lobbyCode || index} lobby={lobby} />
      ))
    ) : (
      <NoActiveLobbies />
    )}
  </Card>
);

};