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
    setSearchTerm(""); // Arama kutusunu sıfırla
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
      backgroundColor: 'white',
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
            sx={{ width: 40, height: 40 }}
          />
        )}
        <Box>
          {selectedConversation?.type === 'friendGroup' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                {selectedConversation.groupName}
              </Typography>
              {fullInvitationLink  && (
                <Tooltip title="Davet Linkini Görüntüle ve Kopyala" arrow>
                  <IconButton 
                    onClick={handleInviteMenuOpen} 
                    size="small" 
                    aria-label="davet linkini göster"
                  >
                    <LinkIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
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
              gap: 0.5
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
            sx={{
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <AvatarGroup max={4}>
              {selectedConversation?.members?.map((member) => (
                <Avatar key={member._id} alt={member.name} src={member.avatar} />
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
          PaperProps={{ sx: { maxHeight: 300, width: 300 } }}
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
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <MenuList dense>
            {filteredMembers?.length ? filteredMembers.map((member) => (
              <MenuItem key={member._id} disabled={member._id === currentUser?.id}>
                <ListItemAvatar>
                  <Avatar alt={member.name} src={member.avatar} />
                </ListItemAvatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.username}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </MenuItem>
            )) : (
              <MenuItem disabled>
                <ListItemText primary="Hiç üye bulunamadı." />
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
        >
          <MenuItem onClick={handleCopyLink}>
          {fullInvitationLink ? fullInvitationLink : "Invitation link not exist."} 
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
};

export default ChatBoxHeader;
