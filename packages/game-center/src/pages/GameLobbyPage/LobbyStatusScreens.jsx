import React from "react";
import { Box, CircularProgress, Typography, Button } from "@mui/material";

export const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

export const ErrorScreen = ({ error, navigate, t }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: 2,
      textAlign: "center",
      p: 2,
    }}
  >
    <Typography variant="h6" color="error">
      {typeof error === 'string' ? error : t("errors.unexpected", "An unexpected error occurred.")}
    </Typography>
    <Button variant="contained" onClick={() => navigate("/")}>
      {t("navigation.goToMainScreen", "Go to Main Screen")}
    </Button>
  </Box>
);

export const AccessDeniedScreen = ({ navigate, t }) => (
 <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: 2,
      textAlign: "center",
      p: 2,
    }}
  >
    <Typography variant="h5" color="error">
      {t("errors.accessDenied", "Access Denied")}
    </Typography>
    <Typography variant="body1">
      {t("errors.accessDeniedMessage", "You are not a member of this lobby or do not have permission to access it.")}
    </Typography>
    <Button variant="contained" onClick={() => navigate("/")}>
      {t("navigation.goToMainScreen", "Go to Main Screen")}
    </Button>
  </Box>
);