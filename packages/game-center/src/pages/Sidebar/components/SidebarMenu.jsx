import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import WeekendIcon from '@mui/icons-material/Weekend';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  marginTop: '10px',
  color: '#6e7f71',
  [theme.breakpoints.down('md')]: {
    fontSize: '0.85em',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  height: '5vh',
  borderRadius: '5px',
  '&:hover': {
    backgroundColor: '#269366',
    color: '#fff',
    '& .MuiListItemIcon-root': {
      color: '#fff', // İkonun rengini beyaza ayarla
    },
  },
  [theme.breakpoints.down('md')]: {
    height: '4vh',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: '40px', // Varsayılan mesafe
  color: '#6e7f71', // Varsayılan ikon rengi
  [theme.breakpoints.down('sm')]: { // Küçük ekranlar için daha küçük mesafe
    minWidth: '30px',
  },
}));

function SidebarMenu() {
  const menuItems = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Lobbies', icon: <WeekendIcon /> },
    { name: 'Games', icon: <SportsEsportsIcon /> },
    { name: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <StyledList>
      {menuItems.map((item) => (
        <StyledListItem key={item.name} button>
          <StyledListItemIcon>{item.icon}</StyledListItemIcon>
          <ListItemText primary={item.name} />
        </StyledListItem>
      ))}
    </StyledList>
  );
}

export default SidebarMenu;
