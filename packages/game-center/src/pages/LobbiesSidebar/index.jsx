import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { SidebarHeader } from './components/SidebarHeader';
import TabList  from './components/TabList';
import { LobbyList } from './components/LobbyList';
import { useLobbyContext } from '../MainScreen/MainScreenMiddleArea/context';

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = (e) => setMatches(e.matches);

    setMatches(media.matches);
    media.addEventListener('change', updateMatch);

    return () => media.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
};

function LobbiesSidebar (){
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const isSmallScreen = useMediaQuery('(max-width: 1000px)'); // useMediaQuery direkt kullanıldı
  const { lobbies } = useLobbyContext();

  useEffect(() => {
    if (isSmallScreen) {
      setIsOpen(false);
    }
  }, [isSmallScreen]);

  const toggleSidebar = () => {
    setIsOpen((prevState) => {
      if (prevState) {
        setSelectedTab('all');
      }
      return !prevState;
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: '#FFF',
        margin: '10px',
        position: 'relative',
        height: '100%',
        width: isOpen ? '15vw' : '50px',
        transition: 'width 0.3s ease',
        borderRadius: '15px',
        overflow: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SidebarHeader isOpen={isOpen} toggleSidebar={toggleSidebar} />
      {/* {isOpen && (
        <TabList
          isOpen={isOpen}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      )} */}
      <LobbyList lobbies={lobbies} isOpen={isOpen} selectedTab={selectedTab} />
    </Box>
  );
};

export default LobbiesSidebar;