import React, { useMemo } from "react";
import { Box, Card, Divider, useTheme } from "@mui/material";
import LobbyItem from "../../../../../shared/components/LobbyItem/LobbyItem";
import NoActiveLobbies from "../../../../GameDetail/GameDetailRightArea/components/NoActiveLobbies";
import { useAuthContext } from "../../../../../shared/context/AuthContext";
import { useTranslation } from "react-i18next";

export const LobbyList = ({ lobbies = [], activeTab, searchTerm }) => {
  const { currentUser } = useAuthContext();
  const theme = useTheme();
  const { t } = useTranslation();

 
  const searchedLobbies = useMemo(() => {
    if (!searchTerm) {
      return lobbies; 
    }
    return lobbies.filter(lobby =>
      lobby.lobbyName && lobby.lobbyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lobbies, searchTerm]);

  
  const filteredByTabLobbies = useMemo(() => {
    let filtered = [...searchedLobbies]; 

    if (activeTab === 'normal') {
      filtered = searchedLobbies.filter(lobby => lobby.lobbyType === 'normal');
    } else if (activeTab === 'event') {
      filtered = searchedLobbies.filter(lobby => lobby.lobbyType === 'event');
    } else if (activeTab === 'myGroups') {
      filtered = searchedLobbies.filter(lobby =>
        currentUser && lobby.members && lobby.members.some(member => member.id === currentUser.id)
      );
    }

    return filtered;
  }, [searchedLobbies, activeTab, currentUser]);


  
  const sortedLobbies = useMemo(() => {
    return [...filteredByTabLobbies].sort((a, b) => {
    
      if (a.lobbyType === "event" && b.lobbyType !== "event") return -1;
      if (a.lobbyType !== "event" && b.lobbyType === "event") return 1;


      if (a.lobbyType === "event" && b.lobbyType === "event") {
        const dateA = new Date(`${a.startDate}T${a.startTime}`);
        const dateB = new Date(`${b.startDate}T${b.startTime}`);
        if (isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) return 1; 
        if (!isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return -1; 
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0; 
        return dateA - dateB; 
      }

      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [filteredByTabLobbies]);

  const hasOriginalLobbies = lobbies && lobbies.length > 0;
  const hasSearchedLobbies = searchedLobbies && searchedLobbies.length > 0;
  const hasFinalLobbies = sortedLobbies && sortedLobbies.length > 0;

  let noLobbiesMessage = <NoActiveLobbies />;
  if (hasOriginalLobbies && searchTerm && !hasSearchedLobbies) {
      noLobbiesMessage = <NoActiveLobbies message={t("No lobbies match your search criteria.")} />;
  } else if (hasOriginalLobbies && hasSearchedLobbies && !hasFinalLobbies) {
      noLobbiesMessage = <NoActiveLobbies message={t("No lobbies match your current filter and search.")} />
  }


  return (
    <Box
      sx={{
        [theme.breakpoints.up('md')]: {
          width: '100%',
        },
        [theme.breakpoints.down('md')]: {
          width: '100%'
        },
        position: 'relative',
        height: '55vh', 
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.primary.main, 
        borderRadius: 2,
      }}
    >
      <Card
        sx={{
          background: theme.palette.background.stripeBg,
          height: "100%",
          overflow: "auto", 
          position: "relative",
          boxShadow: theme.shadows[4],
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: theme.shadows[8],
          },
          p: 0, 
          borderRadius: 2,
        }}
      >
        {hasFinalLobbies ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {sortedLobbies.map((lobby, index) => (
              <React.Fragment key={lobby.lobbyCode || lobby.id || index}> 
                <LobbyItem lobby={lobby} />
                {index < sortedLobbies.length - 1 && (
                  <Divider
                    sx={{
                      backgroundColor: `${theme.palette.divider}`, 
                      mx: 2,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: `${theme.palette.background.paper}40`, 
              padding: 3
            }}
          >
            {noLobbiesMessage}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default LobbyList;