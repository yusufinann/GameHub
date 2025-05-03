import React from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Typography, 
  IconButton, 
  InputAdornment, 
  CircularProgress,
  useTheme
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const QuickLoginSection = ({
  savedUser,
  quickLogin,
  password,
  handlePasswordChange,
  showPassword,
  handleClickShowPassword,
  handleUseDifferentAccount,
  loading,
  error
}) => {
  const theme = useTheme();
  
  const handleSubmit = (event) => {
    event.preventDefault();
    quickLogin();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        bgcolor: theme.palette.background.paper,
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: `0 4px 20px ${theme.palette.background.elevation[1]}`,
      }}
    >
      <Avatar
        src={savedUser.avatar || undefined}
        sx={{
          width: 80,
          height: 80,
          bgcolor: theme.palette.primary.main,
          fontSize: '2rem',
          boxShadow: `0 4px 12px ${theme.palette.background.elevation[1]}`
        }}
      >
        {!savedUser.avatar ? savedUser.name[0].toUpperCase() : null}
      </Avatar>

      <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
        {savedUser.email}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          type="email"
          name="email"
          value={savedUser.email}
          autoComplete="username email"
          sx={{ display: 'none' }}
          InputProps={{ readOnly: true }}
        />

        <TextField
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          fullWidth
          error={!!error}
          helperText={error}
          autoComplete="current-password"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.background.offwhite,
              borderRadius: 2,
            },
            '& .MuiFormHelperText-root': {
              color: theme.palette.error.main,
              marginTop: 1,
              fontSize: '0.85rem'
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? 
                    <VisibilityOff sx={{ color: theme.palette.text.secondary }} /> : 
                    <Visibility sx={{ color: theme.palette.text.secondary }} />
                  }
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          disabled={!password || loading}
          variant="contained"
          fullWidth
          sx={{
            background: theme.palette.background.gradient,
            py: 1.5,
            borderRadius: 2,
            marginTop: 2,
            textTransform: 'none',
            color: theme.palette.primary.contrastText,
            '&:hover': {
              background: `linear-gradient(45deg, ${theme.palette.primary.darker} 30%, ${theme.palette.primary.main} 90%)`,
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Login"
          )}
        </Button>
      </Box>

      <Button
        onClick={handleUseDifferentAccount}
        variant="text"
        sx={{ 
          color: theme.palette.text.secondary,
          textTransform: 'none',
          '&:hover': { bgcolor: theme.palette.background.offwhite }
        }}
      >
        Use a different account
      </Button>
    </Box>
  );
};

export default QuickLoginSection;