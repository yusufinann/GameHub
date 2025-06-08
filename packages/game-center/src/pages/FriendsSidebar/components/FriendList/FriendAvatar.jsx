import React, { memo, useState } from 'react';
import { Box, Avatar, Typography, Tooltip, IconButton, Menu, MenuItem, Badge, Fade } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useTranslation } from 'react-i18next';
import {useNavigate } from "react-router-dom";

const FriendAvatar = memo(({ friend, onInvite, existingLobby }) => {
  const status = friend.isOnline ? 'online' : 'offline';
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMessageClick = () => {
    navigate(`/conversation/all/friend/${friend.id}`);
    handleClose();
  };

  const handleInviteClick = () => {
    onInvite(friend);
    handleClose();
  };
  
  const handleIconClick = (event) => {
    event.stopPropagation(); // Prevent avatar click handler from firing if this icon is on top of clickable area
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Tooltip title={`${friend.name} (${status})`} placement="right">
          <Box
            sx={{
              position: 'relative',
              p: '3px',
              borderRadius: '50%',
              background: friend.isOnline 
                ? 'linear-gradient(45deg, #00d2ff 0%, #3a7bd5 100%)'
                : 'linear-gradient(45deg, #808080 0%, #a0a0a0 100%)',
              // Make avatar clickable even when offline to open menu
              cursor: 'pointer', 
              opacity: friend.isOnline ? 1 : 0.7, // Frame opacity reduced when offline
              '&:hover': { // Keep hover effect consistent, or differentiate if needed
                transform: 'scale(1.05)',
                boxShadow: friend.isOnline 
                  ? '0 0 15px rgba(0, 210, 255, 0.5)' 
                  : '0 0 10px rgba(128, 128, 128, 0.5)', // Adjusted shadow for offline hover
              },
              transition: 'all 0.3s ease',
            }}
            onClick={handleClick} // This click opens the menu
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              badgeContent={
                friend.hasNewMessages ? (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: '#FF5252',
                      borderRadius: '50%',
                      boxShadow: '0 0 10px #FF5252',
                    }}
                  />
                ) : null
              }
            >
              <Avatar
                alt={friend.name}
                src={friend.avatar}
                sx={{
                  width: 50,
                  height: 50,
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  filter: 'none',
                }}
              />
            </Badge>
            
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 15,
                height: 15,
                borderRadius: '50%',
                backgroundColor: status === 'online'
                  ? 'rgb(46, 213, 115)'
                  : 'rgb(255, 71, 87)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: status === 'online' 
                  ? '0 0 10px rgba(46, 213, 115, 0.7)' 
                  : '0 0 10px rgba(255, 71, 87, 0.7)',
                zIndex: 3,
              }}
            />
          </Box>
        </Tooltip>
        
        {/* Options icon with tooltip - Always visible */}
        <Tooltip title={t("click")} placement="right">
          <IconButton 
            size="small" 
            onClick={handleIconClick} // This click also opens the menu
            sx={{ 
              position: 'absolute', 
              top: -5, 
              right: -5, 
              // Use a neutral or slightly adapted color if friend is offline, or keep it consistent
              bgcolor: friend.isOnline ? 'rgba(0, 210, 255, 0.8)' : 'rgba(128, 128, 128, 0.8)', 
              color: 'white',
              width: 20,
              height: 20,
              fontSize: '12px',
              zIndex: 2,
              boxShadow: friend.isOnline ? '0 0 5px rgba(0, 210, 255, 0.5)' : '0 0 5px rgba(128, 128, 128, 0.5)',
              '&:hover': {
                bgcolor: friend.isOnline ? 'rgba(0, 210, 255, 1)' : 'rgba(128, 128, 128, 1)',
                transform: 'scale(1.1)'
              },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>+</Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            borderRadius: '12px',
            minWidth: '150px',
            mt: 0,
            '& .MuiMenuItem-root': {
              color: 'white',
              fontWeight: 500,
              py: 1.5,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          }
        }}
      >
        <MenuItem onClick={handleMessageClick}>
          <MailIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">{t("Send Message")}</Typography>
        </MenuItem>
        {
          existingLobby && (
            <MenuItem onClick={handleInviteClick}>
              <GroupAddIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">{t("inviteLobby")}</Typography>
            </MenuItem>
          )
        }
      </Menu>
    </>
  );
});

export default FriendAvatar;