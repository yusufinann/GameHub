import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  TextField,
  InputAdornment,
  AvatarGroup
} from "@mui/material";
import {
  Search as SearchIcon,
  Link as LinkIcon,
  FiberManualRecord as StatusIcon
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

const ChatBoxHeader = ({ chatType, chatTitle, selectedFriend, selectedConversation, currentUser }) => {
  const theme = useTheme();
  const [isMembersMenuOpen, setIsMembersMenuOpen] = useState(false);
  const membersButtonRef = useRef(null);
  const [inviteMenuAnchor, setInviteMenuAnchor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [appBaseUrl, setAppBaseUrl] = useState(''); 
  
  useEffect(() => {
    setAppBaseUrl(window.location.origin);
  }, []);

  const handleMembersMenuOpen = () => setIsMembersMenuOpen(true);
  const handleMembersMenuClose = () => {
    setSearchTerm("");
    setIsMembersMenuOpen(false);
  };

  const handleInviteMenuOpen = (event) => {
    setInviteMenuAnchor(event.currentTarget);
  };
  const handleInviteMenuClose = () => {
    setInviteMenuAnchor(null);
  };

  const invitationLinkPath = selectedConversation?.invitationLink;
  const fullInvitationLink = invitationLinkPath ? `${appBaseUrl}${invitationLinkPath}` : null;
  
  const handleCopyLink = () => {
    if (fullInvitationLink) {
      navigator.clipboard.writeText(fullInvitationLink);
      alert('Link was copied: ' + fullInvitationLink);
    }
    handleInviteMenuClose();
  };

  const filteredMembers = selectedConversation?.members?.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{
      p: 1,
      backgroundColor: theme.palette.background.paper,
      borderBottom: `1px solid ${theme.palette.divider}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: '10%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {chatType === 'conversation' && (
          <Avatar
            src={selectedFriend?.avatar}
            sx={{ 
              width: 40, 
              height: 40,
              border: `2px solid ${theme.palette.primary.light}`
            }}
          />
        )}
        <Box>
          {selectedConversation?.type === 'friendGroup' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                lineHeight: 1.2, 
                color: theme.palette.text.primary,
                fontFamily: theme.typography.fontFamily
              }}>
                {selectedConversation.groupName}
              </Typography>
              {fullInvitationLink  && (
                <Tooltip title="Davet Linkini Görüntüle ve Kopyala" arrow>
                  <IconButton 
                    onClick={handleInviteMenuOpen} 
                    size="small" 
                    aria-label="davet linkini göster"
                    sx={{
                      color: theme.palette.secondary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              lineHeight: 1.2, 
              color: theme.palette.text.primary,
              fontFamily: theme.typography.fontFamily
            }}>
              {chatTitle}
            </Typography>
          )}
          {chatType === 'conversation' && (
            <Typography variant="caption" sx={{
              color: selectedFriend?.isOnline ?
                theme.palette.success.main :
                theme.palette.text.secondary,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontFamily: theme.typography.fontFamily
            }}>
              <StatusIcon sx={{ fontSize: '0.8rem' }} />
              {selectedFriend?.isOnline ? 'Online' : 'Offline'}
            </Typography>
          )}
        </Box>
      </Box>

      {(chatType === 'group' || chatType === 'friendGroup') && (
        <Tooltip title="Grup Üyelerini Görüntüle" arrow>
          <IconButton
            onClick={handleMembersMenuOpen}
            ref={membersButtonRef}
          >
            <AvatarGroup 
              max={4}
              sx={{
                '& .MuiAvatar-root': {
                  borderColor: theme.palette.background.paper
                }
              }}
            >
              {selectedConversation?.members?.map((member) => (
                <Avatar 
                  key={member._id} 
                  alt={member.name} 
                  src={member.avatar}
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText
                  }}
                />
              ))}
            </AvatarGroup>
          </IconButton>
        </Tooltip>
      )}

      {(chatType === 'group' || chatType === 'friendGroup') && (
        <Menu
          anchorEl={membersButtonRef.current}
          open={isMembersMenuOpen}
          onClose={handleMembersMenuClose}
          PaperProps={{ 
            sx: { 
              maxHeight: 300, 
              width: 300,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`
            } 
          }}
        >
          <Box sx={{ p: 1 }}>
            <TextField
              placeholder="Üye ara..."
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon 
                      fontSize="small" 
                      sx={{ color: theme.palette.text.secondary }}
                    />
                  </InputAdornment>
                ),
                sx: {
                  '& input': {
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily
                  }
                }
              }}
            />
          </Box>
          <MenuList dense>
            {filteredMembers?.length ? filteredMembers.map((member) => (
              <MenuItem 
                key={member._id} 
                disabled={member._id === currentUser?.id}
                sx={{
                  '&:hover': {
                    bgcolor: theme.palette.action.hover
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={member.name} 
                    src={member.avatar}
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.username}
                  primaryTypographyProps={{ 
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily
                  }}
                  secondaryTypographyProps={{ 
                    variant: 'caption',
                    color: theme.palette.text.secondary,
                    fontFamily: theme.typography.fontFamily
                  }}
                />
              </MenuItem>
            )) : (
              <MenuItem disabled>
                <ListItemText 
                  primary="Hiç üye bulunamadı." 
                  primaryTypographyProps={{
                    color: theme.palette.text.secondary,
                    fontFamily: theme.typography.fontFamily
                  }}
                />
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      )}

      {inviteMenuAnchor && (
        <Menu
          anchorEl={inviteMenuAnchor}
          open={Boolean(inviteMenuAnchor)}
          onClose={handleInviteMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              bgcolor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              border: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          <MenuItem 
            onClick={handleCopyLink}
            sx={{
              fontFamily: theme.typography.fontFamily,
              '&:hover': {
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            {fullInvitationLink ? 
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontFamily: 'monospace'
                }}
              >
                {fullInvitationLink}
              </Typography> : 
              "Invitation link not exist."}
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

export default ChatBoxHeader;