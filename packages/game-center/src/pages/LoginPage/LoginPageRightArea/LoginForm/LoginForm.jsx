import React from "react";
import { Box} from "@mui/material";
import { useTheme } from "@mui/material";
import useLoginForm from "./useLoginForm";
import LoginFormView from "./LoginFormView";
import QuickLoginSection from "./QuickLoginSection";
import { createStyles } from "./styles";

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
              styles={styles}
            />
          ) : (
            <LoginFormView 
              email={email}
              password={password}
              showPassword={showPassword}
              rememberMe={rememberMe}
              loading={loading}
              error={error}
              handleEmailChange={handleEmailChange}
              handlePasswordChange={handlePasswordChange}
              handleRememberMeChange={handleRememberMeChange}
              handleClickShowPassword={handleClickShowPassword}
              handleSubmit={handleSubmit}
              styles={styles}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default LoginForm;