// LobbyList.js
import React, { useMemo } from "react";
import { Box, Card, Divider, useTheme } from "@mui/material";
import LobbyItem from "../../../../../shared/LobbyItem/LobbyItem";
import NoActiveLobbies from "../../../../GameDetail/GameDetailRightArea/components/NoActiveLobbies";
import { useAuthContext } from "../../../../../shared/context/AuthContext"; 

export const LobbyList = ({ lobbies = [], activeTab }) => { 
  const { currentUser } = useAuthContext(); 

  const filteredLobbies = useMemo(() => {
    let filtered = [...lobbies];

    if (activeTab === 'normal') {
      filtered = lobbies.filter(lobby => lobby.lobbyType === 'normal');
    } else if (activeTab === 'event') {
      filtered = lobbies.filter(lobby => lobby.lobbyType === 'event');
    } else if (activeTab === 'myGroups') {
      filtered = lobbies.filter(lobby =>
        lobby.members && lobby.members.some(member => member.id === currentUser?.id)
      );
    } 

    return filtered;
  }, [lobbies, activeTab, currentUser]);


  // Lobby sorting function on filtered lobbies
  const sortedLobbies = useMemo(() => {
    return [...filteredLobbies].sort((a, b) => {
      // First priority: Event type lobbies always come first
      if (a.lobbyType === "event" && b.lobbyType !== "event") return -1;
      if (a.lobbyType !== "event" && b.lobbyType === "event") return 1;

      // Second priority: For event lobbies, sort by start time
      if (a.lobbyType === "event" && b.lobbyType === "event") {
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
  }, [filteredLobbies]);

  const theme = useTheme();

  return (
    <Box
          sx={{
            [theme.breakpoints.up('md')]: {
              width: '100%', },
            [theme.breakpoints.down('md')]: { width: '100%' },
            position: 'relative',
            height: '65vh',
            transition: 'width 0.3s ease',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
    <Card
      sx={{
        background: 'linear-gradient(135deg, #caecd5 0%, rgb(50,135,97) 100%)',
        height: "100%",
        overflow: "auto",
        position: "relative",
        boxShadow: theme.shadows[4],
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          boxShadow: theme.shadows[8], 

        },
        p: 0,
      }}
    >
      {sortedLobbies.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.1)', 
            height: '100%'
          }}
        >
          {sortedLobbies.map((lobby, index) => (
            <React.Fragment key={lobby.lobbyCode || index}>
              <LobbyItem lobby={lobby} />
              {index < sortedLobbies.length - 1 && (
                <Divider
                  sx={{
                    backgroundColor: 'rgba(50,135,97,0.3)',                     
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)' 
          }}
        >
          <NoActiveLobbies />
        </Box>
      )}
    </Card>
    </Box>
  );
};

export default LobbyList;