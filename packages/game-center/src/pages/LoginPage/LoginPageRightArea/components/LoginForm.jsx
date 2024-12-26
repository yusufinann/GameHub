import React from "react";
import { Box, TextField, Button, Typography, IconButton, InputAdornment, FormControlLabel, Checkbox, Link, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import useLoginForm from "../useLoginForm"; // Import the custom hook

function LoginForm() {
  const {
    email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleClickShowPassword,
    handleSubmit,
  } = useLoginForm();

  const formStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.09)",
      borderRadius: "12px",
      "& fieldset": {
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.5)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#80cbc4",
      },
    },
    "& .MuiInputLabel-root": {
      color: "black",
    },
    "& .MuiOutlinedInput-input": {
      color: "black",
    },
    marginY: 2,
  };

  const buttonStyles = {
    background: "linear-gradient(45deg, #43a047 30%, #66bb6a 90%)",
    marginTop: 3,
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "bold",
    fontSize: "1.1rem",
    textTransform: "none",
    boxShadow: "0 3px 15px rgba(102, 187, 106, 0.3)",
    "&:hover": {
      background: "linear-gradient(45deg, #2e7d32 30%, #43a047 90%)",
      boxShadow: "0 3px 20px rgba(102, 187, 106, 0.4)",
    },
  };

  return (
    <Box sx={{ maxWidth: "400px", width: "100%" }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: 4,
          color: "black",
          textAlign: "center",
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        Login
      </Typography>
      <Box component="form" sx={formStyles} onSubmit={handleSubmit}>
        <TextField
          type="email"
          label="Email Address"
          name="email"
          value={email}
          onChange={handleEmailChange}
          required
          fullWidth
          sx={textFieldStyles}
          InputProps={{
            sx: { height: "56px" },
          }}
        />
        <TextField
          type={showPassword ? "text" : "password"}
          label="Password"
          name="password"
          value={password}
          onChange={handlePasswordChange}
          required
          fullWidth
          sx={textFieldStyles}
          InputProps={{
            sx: { height: "56px" },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={handleRememberMeChange}
              color="primary"
            />
          }
          label="Remember me"
          sx={{ color: "black", marginY: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={buttonStyles}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
        </Button>
        {error && <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>{error}</Typography>}
        <Box sx={{ textAlign: "center", marginTop: 2 }}>
          <Link href="#" sx={{ color: "black", textDecoration: "none", textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
            Forgot password?
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;
