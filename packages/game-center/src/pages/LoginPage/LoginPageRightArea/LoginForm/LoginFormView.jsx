import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

function LoginFormView({
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
  styles
}) {
  const renderPasswordField = () => (
    <TextField
      type={showPassword ? "text" : "password"}
      label="Password"
      name="password"
      value={password}
      onChange={handlePasswordChange}
      required
      fullWidth
      variant="outlined"
      sx={styles.textField}
      autoComplete="current-password"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Lock sx={styles.inputIcon} />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClickShowPassword}
              edge="end"
              aria-label={showPassword ? "hide password" : "show password"}
              sx={{ p: 1 }}
            >
              {showPassword ? (
                <VisibilityOff sx={styles.visibilityIcon} />
              ) : (
                <Visibility sx={styles.visibilityIcon} />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  const renderEmailField = () => (
    <TextField
      type="email"
      label="Email Address"
      name="email"
      value={email}
      onChange={handleEmailChange}
      required
      fullWidth
      variant="outlined"
      sx={styles.textField}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Email sx={styles.inputIcon} />
          </InputAdornment>
        ),
      }}
      autoComplete="email"
    />
  );

  const renderLoginButton = () => (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      sx={styles.button}
      disabled={loading}
      aria-label="Login"
    >
      {loading ? (
        <CircularProgress size={24} sx={styles.loadingIcon} />
      ) : (
        "Login"
      )}
    </Button>
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    return (
      <Typography sx={styles.errorMessage}>
        {error}
      </Typography>
    );
  };

  return (
    <>
      <Typography variant="h4" sx={styles.title}>
        Login
      </Typography>
      <Box component="form" sx={styles.form} onSubmit={handleSubmit} noValidate>
        {renderEmailField()}
        {renderPasswordField()}
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={handleRememberMeChange}
              color="primary" 
            />
          }
          label="Remember me"
          sx={styles.checkboxLabel}
        />
        {renderLoginButton()}
        {renderErrorMessage()}
        <Box sx={styles.linkContainer}>
          <Link href="#" sx={styles.link}>
            Forgot password?
          </Link>
        </Box>

        <Box sx={{...styles.decorativeElement, ...styles.decorativeTop}} />
        <Box sx={{...styles.decorativeElement, ...styles.decorativeBottom}} />
      </Box>
    </>
  );
}

export default LoginFormView;