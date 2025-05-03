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
  useTheme,
  alpha,
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
  handleSubmit
}) {
  const theme = useTheme();
  
  // Define styles using theme tokens directly
  const styles = {
    pageContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundSize: "cover",
      padding: theme.spacing(3),
    },
    container: {
      maxWidth: "430px",
      width: "100%",
      mx: "auto",
      position: "relative",
    },
    formWrapper: {
      position: "relative",
      zIndex: 1,
    },
    formBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.palette.background.stripeBg,
      borderRadius: "20px",
      boxShadow: `0 8px 32px ${theme.palette.background.elevation[1]}`,
      zIndex: -1,
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.palette.background.gradientB,
        backdropFilter: "blur(10px)",
      },
    },
    form: {
      padding: theme.spacing(5),
      borderRadius: "16px",
      position: "relative",
    },
    title: {
      marginBottom: theme.spacing(4),
      fontSize: "2.2rem",
      fontWeight: 700,
      textAlign: "center",
      background: theme.palette.text.title,
      backgroundClip: "text",
      textFillColor: "transparent",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "0.5px",
      textShadow: `0px 2px 4px ${alpha(theme.palette.background.default, 0.15)}`,
    },
    textField: {
      marginY: theme.spacing(2),
      "& .MuiOutlinedInput-root": {
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "56px",
        "& fieldset": {
          borderColor: alpha(theme.palette.primary.light, 0.3),
          transition: "all 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: alpha(theme.palette.primary.light, 0.5),
        },
        "&.Mui-focused fieldset": {
          borderColor: theme.palette.primary.light,
          borderWidth: "2px",
        },
        "&.Mui-focused": {
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
        },
      },
      "& .MuiInputLabel-root": {
        color: theme.palette.text.secondary,
        fontWeight: 500,
      },
      "& .MuiOutlinedInput-input": {
        color: theme.palette.text.primary,
        height: "100%",
        padding: '16.5px 14px',
        "&::placeholder": {
          color: alpha(theme.palette.text.secondary, 0.8),
          opacity: 1,
        },
        "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
          WebkitBoxShadow: `0 0 0px 1000px ${alpha(theme.palette.background.paper, 0.9)} inset !important`,
          WebkitTextFillColor: `${theme.palette.text.primary} !important`,
          caretColor: `${theme.palette.text.primary} !important`,
          borderRadius: "inherit",
          transition: 'background-color 5000s ease-in-out 0s',
        },
      },
    },
    inputIcon: {
      color: theme.palette.primary.main,
      opacity: 0.8,
    },
    visibilityIcon: {
      color: theme.palette.text.secondary,
      opacity: 0.7,
      transition: "opacity 0.2s ease",
      "&:hover": {
        opacity: 1,
      }
    },
    button: {
      marginTop: theme.spacing(3),
      padding: "12px",
      borderRadius: "12px",
      fontWeight: 600,
      fontSize: "1.1rem",
      textTransform: "none",
      letterSpacing: "0.5px",
      background: theme.palette.text.title,
      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
      color: theme.palette.primary.contrastText,
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
        transition: "left 0.5s ease",
      },
      "&:hover": {
        background: theme.palette.primary.main,
        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
        "&::after": {
          left: "100%",
        },
      },
      "&:active": {
        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
      },
      "&.Mui-disabled": {
        background: theme.palette.action.disabledBackground,
        boxShadow: 'none',
        color: theme.palette.action.disabled,
      }
    },
    checkboxLabel: {
      color: theme.palette.text.secondary,
      "& .MuiCheckbox-root": {
        color: theme.palette.primary.main,
      },
      marginY: theme.spacing(1),
    },
    linkContainer: {
      textAlign: "center",
      marginTop: theme.spacing(3),
    },
    link: {
      color: theme.palette.primary.main,
      fontSize: "0.95rem",
      fontWeight: 500,
      textDecoration: "none",
      position: "relative",
      padding: "2px 0",
      transition: "all 0.3s ease",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "0%",
        height: "2px",
        background: theme.palette.primary.main,
        transition: "width 0.3s ease",
      },
      "&:hover": {
        color: alpha(theme.palette.primary.main, 0.9),
        "&::after": {
          width: "100%",
        },
      },
    },
    errorMessage: {
      marginTop: theme.spacing(2),
      textAlign: "center",
      color: theme.palette.error.main,
      fontWeight: 500,
      padding: theme.spacing(1, 1.5),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.error.main, 0.08),
    },
    loadingIcon: {
      color: theme.palette.primary.contrastText,
    },
    decorativeElement: {
      position: "absolute",
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
      filter: "blur(20px)",
      zIndex: -1,
    },
    decorativeTop: {
      top: "-40px",
      right: "-30px",
    },
    decorativeBottom: {
      bottom: "-40px",
      left: "-30px",
    }
  };

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