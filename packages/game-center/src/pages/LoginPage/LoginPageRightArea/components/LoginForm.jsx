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
import useLoginForm from "../useLoginForm";
import QuickLoginSection from "./QuickLoginSection";

const createStyles = (theme) => {
  const isDarkMode = theme.palette.mode === 'dark';

  const primaryMain = isDarkMode ? "#1d2e4a" : "#3f51b5";
  const primaryLight = isDarkMode ? "#2d4368" : "#81C784";
  const successMain = isDarkMode ? "#48bb78" : "#2E7D32";
  const successLight = isDarkMode ? "#68d391" : "#4caf50";
  const successDark = isDarkMode ? "#38a169" : "#328761";
  const bgPaper = isDarkMode ? "#2d3748" : "#FFFFFF";
  const textPrimary = isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.87)";
  const textSecondary = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)";
  const textGradient = isDarkMode
    ? "linear-gradient(45deg, #4169e1 0%, #1d2e4a 100%)"
    : "linear-gradient(45deg, #ff6b6b 0%, rgb(78, 205, 133) 100%)";

  const autofillBgColor = isDarkMode
    ? alpha(bgPaper, 0.15) 
    : alpha(bgPaper, 0.9); 

  return {
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
      background: isDarkMode
        ? "repeating-linear-gradient(45deg, rgba(29, 46, 74, 0.8), rgba(29, 46, 74, 0.8) 10px, rgba(22, 35, 57, 0.8) 10px, rgba(22, 35, 57, 0.8) 20px)"
        : "repeating-linear-gradient(45deg, rgba(63, 81, 181, 0.05), rgba(63, 81, 181, 0.05) 10px, rgba(129, 199, 132, 0.08) 10px, rgba(129, 199, 132, 0.08) 20px)",
      borderRadius: "20px", 
      boxShadow: isDarkMode
        ? "0 8px 32px rgba(0, 0, 0, 0.5)"
        : "0 8px 32px rgba(50, 135, 97, 0.25)",
      zIndex: -1,
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(29, 46, 74, 0.9) 0%, rgba(11, 16, 24, 0.9) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(202, 236, 213, 0.85) 100%)",
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
      background: textGradient,
      backgroundClip: "text",
      textFillColor: "transparent",
      WebkitBackgroundClip: "text", 
      WebkitTextFillColor: "transparent",
      letterSpacing: "0.5px",
      textShadow: isDarkMode
        ? "0px 2px 4px rgba(0, 0, 0, 0.5)"
        : "0px 2px 4px rgba(0, 0, 0, 0.15)",
    },
    textField: {
      marginY: theme.spacing(2),
      "& .MuiOutlinedInput-root": {
        backgroundColor: isDarkMode
          ? alpha(bgPaper, 0.1)
          : alpha(bgPaper, 0.7),
        borderRadius: "12px", 
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "56px", 
        "& fieldset": {
          borderColor: isDarkMode
            ? alpha(primaryLight, 0.3)
            : alpha(primaryMain, 0.2),
          transition: "all 0.3s ease",
        },
        "&:hover fieldset": {
          borderColor: isDarkMode
            ? alpha(primaryLight, 0.5)
            : alpha(primaryMain, 0.4),
        },
        "&.Mui-focused fieldset": {
          borderColor: isDarkMode ? primaryLight : primaryMain,
          borderWidth: "2px",
        },
        "&.Mui-focused": {
          backgroundColor: isDarkMode
            ? alpha(bgPaper, 0.15)
            : alpha(bgPaper, 0.9),
        },
      },
      "& .MuiInputLabel-root": {
        color: textSecondary,
        fontWeight: 500,
      },
      "& .MuiOutlinedInput-input": { 
        color: textPrimary,
        height: "100%", 
        padding: '16.5px 14px', 
        "&::placeholder": {
          color: isDarkMode
            ? alpha(textSecondary, 0.7)
            : alpha(textSecondary, 0.8),
          opacity: 1,
        },
        "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active": {
            WebkitBoxShadow: `0 0 0px 1000px ${autofillBgColor} inset !important`,
            WebkitTextFillColor: `${textPrimary} !important`,
            caretColor: `${textPrimary} !important`,
            borderRadius: "inherit",
            transition: 'background-color 5000s ease-in-out 0s',
        },
      },
    },
    inputIcon: {
      color: isDarkMode ? primaryLight : primaryMain,
      opacity: 0.8,
    },
    visibilityIcon: {
      color: textSecondary,
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
      background: isDarkMode
        ? `linear-gradient(45deg, ${primaryMain} 0%, ${primaryLight} 100%)`
        : `linear-gradient(45deg, ${successDark} 0%, ${successLight} 100%)`,
      boxShadow: isDarkMode
        ? `0 4px 15px ${alpha(primaryMain, 0.5)}`
        : `0 4px 15px ${alpha(successDark, 0.3)}`,
      color: "#FFFFFF",
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
        background: isDarkMode
          ? "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
          : "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
        transition: "left 0.5s ease",
      },
      "&:hover": {
        background: isDarkMode
          ? `linear-gradient(45deg, ${primaryLight} 0%, ${primaryMain} 100%)`
          : `linear-gradient(45deg, ${successMain} 0%, ${successDark} 100%)`,
        boxShadow: isDarkMode
          ? `0 6px 20px ${alpha(primaryMain, 0.6)}`
          : `0 6px 20px ${alpha(successDark, 0.4)}`,
        "&::after": {
          left: "100%",
        },
      },
      "&:active": {
        boxShadow: isDarkMode
          ? `0 2px 10px ${alpha(primaryMain, 0.5)}`
          : `0 2px 10px ${alpha(successDark, 0.3)}`,
      },
      "&.Mui-disabled": { 
         background: theme.palette.action.disabledBackground,
         boxShadow: 'none',
         color: theme.palette.action.disabled,
      }
    },
    checkboxLabel: {
      color: textSecondary,
      "& .MuiCheckbox-root": {
        color: isDarkMode ? primaryLight : primaryMain,
      },
      marginY: theme.spacing(1),
    },
    linkContainer: {
      textAlign: "center",
      marginTop: theme.spacing(3),
    },
    link: {
      color: isDarkMode ? primaryLight : primaryMain,
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
        background: isDarkMode ? primaryLight : primaryMain,
        transition: "width 0.3s ease",
      },
      "&:hover": {
        color: isDarkMode ? alpha(primaryLight, 0.9) : alpha(primaryMain, 0.9),
        "&::after": {
          width: "100%",
        },
      },
    },
    errorMessage: {
      marginTop: theme.spacing(2),
      textAlign: "center",
      color: isDarkMode ? "#f56565" : theme.palette.error.main, 
      fontWeight: 500,
      padding: theme.spacing(1, 1.5), 
      borderRadius: theme.shape.borderRadius, 
      backgroundColor: isDarkMode
        ? alpha("#f56565", 0.1)
        : alpha(theme.palette.error.main, 0.08),
    },
    loadingIcon: {
      color: "#FFFFFF", 
    },
    decorativeElement: {
      position: "absolute",
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      background: isDarkMode
        ? `linear-gradient(135deg, ${alpha(primaryLight, 0.2)} 0%, ${alpha(primaryMain, 0.05)} 100%)`
        : `linear-gradient(135deg, ${alpha(successLight, 0.2)} 0%, ${alpha(successMain, 0.05)} 100%)`,
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
};

function LoginForm() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    email,
    password,
    showPassword,
    rememberMe,
    loading,
    error,
    savedUser,
    handleEmailChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleClickShowPassword,
    handleSubmit,
    quickLogin,
    handleUseDifferentAccount,
  } = useLoginForm();

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

  const renderLoginForm = () => (
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

        {/* Decorative elements */}
        <Box sx={{...styles.decorativeElement, ...styles.decorativeTop}} />
        <Box sx={{...styles.decorativeElement, ...styles.decorativeBottom}} />
      </Box>
    </>
  );

  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.container}>
        <Box sx={styles.formWrapper}>
          <Box sx={styles.formBackground} />
          {savedUser ? (
            <QuickLoginSection
              savedUser={savedUser}
              quickLogin={quickLogin}
              password={password}
              handlePasswordChange={handlePasswordChange}
              showPassword={showPassword}
              handleClickShowPassword={handleClickShowPassword}
              handleUseDifferentAccount={handleUseDifferentAccount}
              loading={loading}
              error={error}
              textFieldStyles={styles.textField} 
              visibilityIconStyles={styles.visibilityIcon}
              inputIconStyles={styles.inputIcon}
              buttonStyles={styles.button}
              errorMessageStyles={styles.errorMessage}
              loadingIconStyles={styles.loadingIcon}
            />
          ) : (
            renderLoginForm()
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;