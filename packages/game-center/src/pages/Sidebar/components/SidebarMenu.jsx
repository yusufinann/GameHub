import React, { useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import WeekendIcon from '@mui/icons-material/Weekend';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const StyledList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  marginTop: '1rem',
  color: '#6e7f71',
  [theme.breakpoints.down('md')]: {
    fontSize: '0.85rem',
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.55rem',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  height: '5vh',
  backgroundColor: selected ? '#269366' : 'transparent', // Highlight selected item
  color: selected ? '#fff' : '#6e7f71', // Change text color on select
  '&:hover': {
    backgroundColor: '#269366',
    color: '#fff',
    '& .MuiListItemIcon-root': {
      color: '#fff', // Set icon color to white on hover
    },
  },
  [theme.breakpoints.down('md')]: {
    height: '4vh',
  },
  cursor: 'pointer',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, selected }) => ({
  minWidth: '40px', // Default distance
  color: selected ? '#fff' : '#6e7f71', // Set icon color to white when selected
  [theme.breakpoints.down('sm')]: {
    minWidth: '30px', // Smaller distance for small screens
  },
}));

function SidebarMenu() {
  const [selectedItem, setSelectedItem] = useState('/');
  const navigate = useNavigate(); // Get navigate function

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, to: '/' },
    { name: 'Lobbies', icon: <WeekendIcon />, to: '/lobbies' },
    { name: 'Games', icon: <SportsEsportsIcon />, to: '/games' },
    { name: 'Settings', icon: <SettingsIcon />, to: '/settings' },
  ];

  const handleItemClick = (to) => {
    setSelectedItem(to); // Set selected item state
    navigate(to); // Navigate to the selected route
  };

  return (
    <StyledList>
      {menuItems.map((item) => (
        <StyledListItem
          key={item.name}
          button
          selected={selectedItem === item.to} // Set selected if the item's route matches
          onClick={() => handleItemClick(item.to)} // Use handleItemClick for navigation
        >
          <StyledListItemIcon selected={selectedItem === item.to}>
            {item.icon}
          </StyledListItemIcon>
          <ListItemText primary={item.name} />
        </StyledListItem>
      ))}
    </StyledList>
  );
}

export default SidebarMenu;
