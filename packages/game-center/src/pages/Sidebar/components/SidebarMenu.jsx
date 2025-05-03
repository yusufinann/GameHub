import React from 'react';
import { List, ListItem, ListItemIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import ForumIcon from '@mui/icons-material/Forum';
import { useNavigate, useLocation } from 'react-router-dom';

const StyledList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  marginTop: '1rem',
  color: theme.palette.text.secondary,
}));

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'button' && prop !== 'selected'
})(({ theme, selected }) => ({
  height: '5vh',
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: theme.palette.background.elevation[1],
    '& .MuiListItemIcon-root': {
      color: theme.palette.text.primary
    },
  },
  cursor: 'pointer',
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme, selected }) => ({
  minWidth: '40px',
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  justifyContent: 'center',
}));

function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, to: '/' },
    { name: 'Community', icon: <ForumIcon />, to: '/community' },
    { name: 'Conversation', icon: <GroupIcon />, to: '/conversation/all' },
    { name: 'Settings', icon: <SettingsIcon />, to: '/settings' },
  ];

  const handleItemClick = (to) => {
    navigate(to);
  };

  return (
    <StyledList>
      {menuItems.map((item) => {
        const isSelected = location.pathname === item.to || 
                          (item.to !== '/' && location.pathname.startsWith(item.to));
        
        return (
          <StyledListItem
            key={item.name}
            selected={isSelected}
            onClick={() => handleItemClick(item.to)}
          >
            <StyledListItemIcon selected={isSelected}>
              {item.icon}
            </StyledListItemIcon>
          </StyledListItem>
        );
      })}
    </StyledList>
  );
}

export default SidebarMenu;