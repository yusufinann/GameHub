import React, { useMemo, useCallback, memo } from "react";
import { Box, Card, Divider, useTheme, useMediaQuery } from "@mui/material";
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import LobbyItem from "../../../../../shared/components/LobbyItem/LobbyItem";
import NoActiveLobbies from "../../../../GameDetail/GameDetailRightArea/components/NoActiveLobbies";
import { useAuthContext } from "../../../../../shared/context/AuthContext";
import { useTranslation } from "react-i18next";

const InnerRowContent = memo(({ lobby, isLastItem, dividerColor }) => (
  <>
    <LobbyItem lobby={lobby} />
    {!isLastItem && (
      <Divider
        sx={{
          backgroundColor: dividerColor,
          mx: 2,
        }}
      />
    )}
  </>
));

const Row = memo(({ index, style, data }) => {
  const { lobbies, theme } = data;
  const lobby = lobbies[index];

  if (!lobby) {
    return null;
  }

  const isLastItem = index === lobbies.length - 1;
  const dividerColor = theme.palette.divider;

  return (
    <Box style={style}>
      <InnerRowContent
        lobby={lobby}
        isLastItem={isLastItem}
        dividerColor={dividerColor}
      />
    </Box>
  );
});

export const LobbyList = memo(({ lobbies = [], activeTab, searchTerm }) => {
  const { currentUser } = useAuthContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const finalLobbies = useMemo(() => {
    return lobbies
      .filter(lobby => {
        const matchesSearch = !searchTerm || (lobby.lobbyName && lobby.lobbyName.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;

        if (activeTab === 'normal') return lobby.lobbyType === 'normal';
        if (activeTab === 'event') return lobby.lobbyType === 'event';
        if (activeTab === 'myGroups') {
          return currentUser && lobby.members && lobby.members.some(member => member.id === currentUser.id);
        }

        return true; 
      })
      .sort((a, b) => {
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
  }, [lobbies, searchTerm, activeTab, currentUser]);
  
  const getItemSize = useCallback(index => {
    const lobby = finalLobbies[index];
    const dividerHeight = 1;
    
    if (isMobile) {
        return lobby.lobbyType === 'event' ? 200 + dividerHeight : 160 + dividerHeight;
    } else {
        return lobby.lobbyType === 'event' ? 175 + dividerHeight : 155 + dividerHeight;
    }
  }, [finalLobbies, isMobile]);

  const itemData = useMemo(() => ({
    lobbies: finalLobbies,
    theme: theme,
  }), [finalLobbies, theme]);

  const hasLobbiesToShow = finalLobbies && finalLobbies.length > 0;
  
  const getNoLobbiesMessage = () => {
    if (lobbies.length > 0 && searchTerm && finalLobbies.length === 0) {
      return <NoActiveLobbies message={t("No lobbies match your search criteria.")} />;
    }
    if (lobbies.length > 0 && finalLobbies.length === 0) {
      return <NoActiveLobbies message={t("No lobbies match your current filter and search.")} />;
    }
    return <NoActiveLobbies />;
  };

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        height: '55vh',
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
          position: "relative",
          boxShadow: theme.shadows[4],
          p: 0,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasLobbiesToShow ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={finalLobbies.length}
                itemSize={getItemSize}
                itemData={itemData}
                overscanCount={5}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
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
            {getNoLobbiesMessage()}
          </Box>
        )}
      </Card>
    </Box>
  );
});