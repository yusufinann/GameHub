import React, { useState } from 'react';
import { List, ListItem, ListItemIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import WeekendIcon from '@mui/icons-material/Weekend';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

const StyledList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  marginTop: '1rem',
  color: '#6e7f71',
}));

// "button" prop'unu DOM'a geçirmemek için shouldForwardProp kullanıyoruz.
const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'button'
})(({ theme, selected }) => ({
  height: '5vh',
  color: selected ? '#ff726f' : '#6e7f71',
  '& .MuiListItemIcon-root': {
    color: selected ? 'red' : '#6e7f71'
  },
  '&:hover': {
    '& .MuiListItemIcon-root': {
      color: '#fff'
    },
  },
  cursor: 'pointer',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, selected }) => ({
  minWidth: '40px',
  color: selected ? '#fff' : '#6e7f71',
  justifyContent: 'center',
}));

function SidebarMenu() {
  const [selectedItem, setSelectedItem] = useState('/');
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, to: '/' },
    { name: 'Lobbies', icon: <WeekendIcon />, to: '/lobbies' },
    { name: 'Games', icon: <SportsEsportsIcon />, to: '/games' },
    { name: 'Settings', icon: <SettingsIcon />, to: '/settings' },
  ];

  const handleItemClick = (to) => {
    setSelectedItem(to);
    navigate(to);
  };

  return (
    <StyledList>
      {menuItems.map((item) => (
        <StyledListItem
          key={item.name}
          button
          selected={selectedItem === item.to}
          onClick={() => handleItemClick(item.to)}
        >
          <StyledListItemIcon selected={selectedItem === item.to}>
            {item.icon}
          </StyledListItemIcon>
        </StyledListItem>
      ))}
    </StyledList>
  );
}

export default SidebarMenu;
