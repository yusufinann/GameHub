import React, { useState } from 'react';
import {
  IconButton,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Popper,
  ClickAwayListener,
  Box,
  CircularProgress,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const searchUsers = async (query) => {
  try {
    const response = await fetch(`http://localhost:3001/api/users/search?username=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
const theme=useTheme();
const{t}=useTranslation();
  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setAnchorEl(event.currentTarget);

    if (query.length >= 2) {
      setIsLoading(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchResults([]);
    setSearchQuery('');
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setSearchResults([]);
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box>
        <Paper
          sx={{
            p: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
            borderRadius: 2,        
         background:theme.palette.background.gradientFadeBg,
             
          }}
        >
          <IconButton sx={{ p: '10px', color: theme.palette.primary.light }}>
            {isLoading ? (
              <CircularProgress size={24} color={theme.palette.primary.light} />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, color: 'white' }}
            placeholder={t("Search users...")}
            value={searchQuery}
            onChange={handleSearch}
          />
        </Paper>

        <Popper
          open={Boolean(searchResults.length > 0 || isLoading)}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ width: 400, zIndex: 1200 }}
        >
          <Paper sx={{ mt: 1, borderRadius: 2, boxShadow: 3, bgcolor: 'transparent' }}>
            <List>
              {isLoading ? (
                <ListItem>
                  <ListItemText primary="Searching..." />
                </ListItem>
              ) : (
                searchResults.map((user) => (
                  <ListItem
                    key={user._id || user.id}
                    button
                    onClick={() => handleUserClick(user._id || user.id)}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.avatar} alt={user.name || user.username}>
                        {(user.name || user.username || '?')[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={user.username}  sx={{color:'white'}}/>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default UserSearch;
