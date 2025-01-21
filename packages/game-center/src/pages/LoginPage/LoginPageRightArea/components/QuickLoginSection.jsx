import React from "react";
import { Box, TextField, Button, Avatar, Typography, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const QuickLoginSection = ({ 
  savedUser, 
  quickLogin, 
  password, 
  handlePasswordChange, 
  showPassword, 
  handleClickShowPassword,
  handleUseDifferentAccount, // Add the new prop
  loading
}) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        bgcolor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Avatar 
        sx={{ 
          width: 80,
          height: 80,
          bgcolor: 'primary.main',
          fontSize: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {savedUser.email[0].toUpperCase()}
      </Avatar>
      
      <Typography variant="h6" sx={{ color: 'black' }}>
        {savedUser.email}
      </Typography>

      <TextField
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        value={password}
        onChange={handlePasswordChange}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'rgba(255, 255, 255, 0.09)',
            borderRadius: 2,
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClickShowPassword} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        onClick={quickLogin}
        disabled={!password}
        variant="contained"
        fullWidth
        sx={{
          background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          '&:hover': {
            background: 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)',
          }
        }}
      >
       {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
      </Button>

      <Button
        onClick={handleUseDifferentAccount} // Add the onClick handler
        variant="text"
        sx={{ 
          color: 'text.secondary',
          textTransform: 'none',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
        }}
      >
        Use a different account
      </Button>
    </Box>
  );
};

export default QuickLoginSection;