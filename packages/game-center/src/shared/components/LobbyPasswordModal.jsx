import React, { useState, useCallback, memo } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock, Public } from "@mui/icons-material";
import MessageModal from "./MessageModal";
import JoiningLobbyAnimation from "./JoiningLobbyAnimation";
import { useTranslation } from "react-i18next";

const LobbyPasswordModal = memo(({ open, onClose, onSubmit, lobbyDetails, theme }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isInternalMessageModalOpen, setIsInternalMessageModalOpen] = useState(false);
  const [internalModalConfig, setInternalModalConfig] = useState({ message: "", severity: "error", title: undefined });

  const { t } = useTranslation();

  const handleInternalMessageModalClose = useCallback(() => {
    setIsInternalMessageModalOpen(false);
  }, []);

  const showInternalMessage = (message, severity = "error", title = undefined) => {
    setInternalModalConfig({ message, severity, title });
    setIsInternalMessageModalOpen(true);
  };

  const processAndShowInternalMessage = (error) => {
    const errorPayload = error?.response?.data || error?.data || error;
    let displayMsg;
    let currentSeverity = "error";
    let customTitle = undefined;

    if (errorPayload && errorPayload.errorKey) {
      const translationParams = { ...errorPayload.errorParams };
      if (errorPayload.errorParams && errorPayload.errorParams.gameTypeIdentifier) {
        translationParams.gameType = t(`gameNames.${errorPayload.errorParams.gameTypeIdentifier}`);
      }
      displayMsg = t(errorPayload.errorKey, translationParams);

      switch (errorPayload.errorKey) {
        case "lobby.gameInProgress":
        case "lobby.full":
          currentSeverity = "warning";
          customTitle = t('Warning');
          break;
        case "lobby.invalidPassword":
          currentSeverity = "warning";
          customTitle = t('passwordModal.invalidPasswordTitle');
          break;
        default:
          currentSeverity = "error";
          customTitle = t('Error');
      }
    } else if (errorPayload && errorPayload.message) {
      displayMsg = errorPayload.message;
      const status = error?.response?.status;
      if (status === 400 || status === 401 || status === 403 || status === 404) {
        currentSeverity = "warning";
        customTitle = t('common.warningTitle');
        if (status === 404 && !displayMsg) displayMsg = t('common.notFound', { resource: t('lobby.lobby') });
        if (status === 401 && !displayMsg) displayMsg = t('error.unauthorized');
      } else {
        currentSeverity = "error";
        customTitle = t('Error');
      }
    } else if (error instanceof Error && error.message) {
      displayMsg = error.message;
      currentSeverity = "error";
      customTitle = t('Error');
    } else if (typeof errorPayload === 'string') {
      displayMsg = errorPayload;
      currentSeverity = "info";
      customTitle = t('common.infoTitle');
    } else {
      displayMsg = t("common.error");
      currentSeverity = "error";
      customTitle = t('Error');
    }
    showInternalMessage(displayMsg, currentSeverity, customTitle);
  };

  const handlePasswordSubmit = async () => {
    if (!password) return;
    setIsLoading(true);
    try {
      await onSubmit(password);
    } catch (error) {
      console.error('Lobiye katılma hatası (LobbyPasswordModal - onSubmit catch):', error);
      processAndShowInternalMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicJoin = async () => {
    setIsLoading(true);
    try {
      await onSubmit("");
    } catch (error) {
      console.error('Lobiye katılma hatası (LobbyPasswordModal - onSubmit catch):', error);
      processAndShowInternalMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (!lobbyDetails) {
    return null;
  }

  const isPasswordProtected = lobbyDetails.isPasswordProtected;
  const palette = theme?.palette || {};

  return (
    <>
      <Modal
        open={open && !isLoading}
        onClose={onClose}
        aria-labelledby="lobby-join-modal-title"
        aria-describedby="lobby-join-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        closeAfterTransition
      >
        <Fade in={open && !isLoading}>
          <Paper
            elevation={8}
            sx={{
              width: { xs: "90%", sm: 420 },
              p: 4,
              borderRadius: 3,
              bgcolor: palette.background?.paper || '#fff',
              backgroundImage: palette.background?.gradientB,
              border: `1px solid ${palette.primary?.light || '#3f51b5'}`,
              outline: 'none',
              overflow: 'hidden',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: palette.background?.stripe || 'none',
                opacity: 0.5,
                pointerEvents: 'none',
                zIndex: 0,
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 2,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: isPasswordProtected
                      ? palette.warning?.main || 'rgba(255, 180, 0, 1)'
                      : palette.success?.main || '#2E7D32',
                    color: 'white',
                  }}
                >
                  {isPasswordProtected ? (
                    <Lock fontSize="large" />
                  ) : (
                    <Public fontSize="large" />
                  )}
                </Box>

                <Typography
                  id="lobby-join-modal-title"
                  variant="h5"
                  component="h2"
                  fontWeight="bold"
                  sx={{
                    backgroundImage: palette.text?.title || 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                  }}
                >
                  {isPasswordProtected ? t('passwordModal.titleProtected') : t('passwordModal.titlePublic')}
                </Typography>
              </Box>

              {isPasswordProtected ? (
                <>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    textAlign="center"
                  >
                    {t('passwordModal.descriptionProtected')}
                  </Typography>

                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label={t('passwordModal.passwordLabel')}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && password) handlePasswordSubmit(); }}
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: palette.primary?.light || '#81C784',
                        },
                        '&:hover fieldset': {
                          borderColor: palette.primary?.main || '#3f51b5',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: palette.primary?.main || '#3f51b5',
                        },
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={t('common.togglePasswordVisibility')}
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                    <Button
                      onClick={onClose}
                      variant="outlined"
                      disabled={isLoading}
                      sx={{
                        borderColor: palette.primary?.light || '#81C784',
                        color: palette.primary?.main || '#3f51b5',
                        '&:hover': {
                          borderColor: palette.primary?.main || '#3f51b5',
                          backgroundColor: 'rgba(63, 81, 181, 0.08)',
                        },
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handlePasswordSubmit}
                      variant="contained"
                      disabled={isLoading || !password}
                      sx={{
                        backgroundColor: palette.primary?.main || '#3f51b5',
                        '&:hover': {
                          backgroundColor: palette.primary?.darker || '#303f9f',
                        },
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {t('passwordModal.joinButton')}
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    id="lobby-join-modal-description"
                    variant="body1"
                    mb={3}
                    textAlign="center"
                    color="text.secondary"
                  >
                    {t('passwordModal.descriptionPublic')}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                    <Button
                      onClick={onClose}
                      variant="outlined"
                      disabled={isLoading}
                      sx={{
                        borderColor: palette.primary?.light || '#81C784',
                        color: palette.primary?.main || '#3f51b5',
                        '&:hover': {
                          borderColor: palette.primary?.main || '#3f51b5',
                          backgroundColor: 'rgba(63, 81, 181, 0.08)',
                        },
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handlePublicJoin}
                      variant="contained"
                      disabled={isLoading}
                      sx={{
                        backgroundColor: palette.success?.main || '#2E7D32',
                        '&:hover': {
                          backgroundColor: palette.success?.dark || '#1B5E20',
                        },
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {t('passwordModal.joinLobbyButton')}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Fade>
      </Modal>

      <Modal
        open={isLoading}
        aria-hidden="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <JoiningLobbyAnimation />
      </Modal>

      <MessageModal
        open={isInternalMessageModalOpen}
        onClose={handleInternalMessageModalClose}
        message={internalModalConfig.message}
        severity={internalModalConfig.severity}
        title={internalModalConfig.title}
      />
    </>
  );
});

export default LobbyPasswordModal;