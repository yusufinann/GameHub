import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { SidebarHeader } from './components/SidebarHeader';
import { TabList } from './components/TabList';
import { RoomList } from './components/RoomList';
import { useLobbyContext } from '../MainScreen/MainScreenMiddleArea/LobbyContext';

const RoomsSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const isSmallScreen = useMediaQuery('(max-width: 1000px)');
  const {lobbies}=useLobbyContext();
  const colors = {
    private: '#FFD700',
    event: '#FF69B4',
    default: '#87CEEB',
  };

 

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
      {isOpen && (
        <TabList
          isOpen={isOpen}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />
      )}
      <RoomList
        lobbies={lobbies}
        isOpen={isOpen}
        colors={colors}
        selectedTab={selectedTab}
      />
    </Box>
  );
};

export default RoomsSidebar;