// src/components/UserSearch/UserSearch.js
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
import { searchUsersApi } from './api'; // Import from the local api.js

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null); // Optional: to display search errors
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const handleSearch = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setAnchorEl(event.currentTarget);
    setSearchError(null); // Clear previous errors

    if (query.length >= 2) {
      setIsLoading(true);
      try {
        const results = await searchUsersApi(query);
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (error) {
        console.error('Search error in component:', error);
        setSearchError(error.message || t("Failed to search users."));
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
      if (query.length === 0) {
        setAnchorEl(null); // Close popper if query is empty
      }
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchResults([]);
    setSearchQuery('');
    setAnchorEl(null);
    setSearchError(null);
  };

  const handleClickAway = () => {
    // Only close if not loading and not actively typing a short query
    if (!isLoading && searchQuery.length < 2) {
        setSearchResults([]);
        setAnchorEl(null);
        setSearchError(null);
    } else if (searchQuery.length === 0) { // if query was cleared
        setSearchResults([]);
        setAnchorEl(null);
        setSearchError(null);
    }
    // If there are results or loading, clicking away might be undesirable
    // For a simpler behavior, always close:
    // setSearchResults([]);
    // setAnchorEl(null);
    // setSearchError(null);
  };

  const isOpen = Boolean(anchorEl && (searchResults.length > 0 || isLoading || searchError));

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}> {/* Added for Popper positioning context if needed */}
        <Paper
          component="form" // Added for semantics, prevents default submit if Enter is pressed
          onSubmit={(e) => e.preventDefault()}
          sx={{
            p: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            width: { xs: '250px', sm: '300px', md: '400px' }, // Responsive width
            borderRadius: 2,
            background: theme.palette.background.gradientFadeBg || theme.palette.background.paper, // Fallback
            boxShadow: theme.shadows[1],
          }}
        >
          <IconButton sx={{ p: '10px', color: theme.palette.primary.light || theme.palette.action.active }}>
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: theme.palette.primary.light || theme.palette.primary.main }} />
            ) : (
              <SearchIcon />
            )}
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }} // Use theme text color
            placeholder={t("Search users...")}
            value={searchQuery}
            onChange={handleSearch}
            onFocus={(event) => { // Open popper on focus if query is already valid
              if (searchQuery.length >= 2) {
                setAnchorEl(event.currentTarget.parentElement); // parentElement is the Paper
              }
            }}
          />
        </Paper>

        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ width: anchorEl ? anchorEl.clientWidth : 400, zIndex: theme.zIndex.modal }} // Use anchorEl width
          modifiers={[
            {
              name: 'offset',
              options: {
                offset: [0, 8], // Add some space between input and popper
              },
            },
          ]}
        >
          <Paper sx={{ 
            mt: 1, 
            borderRadius: 2, 
            boxShadow: 3, 
            bgcolor: theme.palette.background.paper, // Use standard paper background
            maxHeight: '300px', // Prevent popper from being too tall
            overflowY: 'auto'   // Allow scrolling for many results
          }}>
            <List dense> {/* dense for more compact list */}
              {isLoading && searchResults.length === 0 && ( // Show loading only if no results yet
                <ListItem>
                  <Box sx={{display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', p:1}}>
                    <CircularProgress size={20} sx={{mr:1}}/>
                    <ListItemText primary={t("Searching...")} sx={{color: theme.palette.text.secondary}}/>
                  </Box>
                </ListItem>
              )}
              {!isLoading && searchError && (
                <ListItem>
                  <ListItemText primary={searchError} sx={{ color: theme.palette.error.main, textAlign: 'center' }} />
                </ListItem>
              )}
              {!isLoading && !searchError && searchResults.length === 0 && searchQuery.length >=2 && (
                 <ListItem>
                    <ListItemText primary={t("No users found.")} sx={{color: theme.palette.text.secondary, textAlign: 'center'}}/>
                 </ListItem>
              )}
              {!isLoading && !searchError && searchResults.map((user) => (
                <ListItem
                  key={user._id || user.id}
                  button // Replaced with sx for hover effect for better control
                  onClick={() => handleUserClick(user._id || user.id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar 
                        src={user.avatarUrl || user.avatar} // Check for common avatar field names
                        alt={user.username}
                        sx={{ bgcolor: theme.palette.primary.main }} // Fallback avatar color
                    >
                      {(user.username || '?')[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={user.username} 
                    sx={{color: theme.palette.text.primary }} // Use theme text color
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default UserSearch;