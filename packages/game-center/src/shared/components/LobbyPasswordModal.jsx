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
import ErrorModal from "./ErrorModal";
import JoiningLobbyAnimation from "./JoiningLobbyAnimation";
import { useTranslation } from "react-i18next";

const LobbyPasswordModal = memo(({ open, onClose, onSubmit, lobbyDetails, theme }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleErrorModalClose = useCallback(() => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  }, []);

  const processAndSetErrorMessage = (error) => {
    let displayMsg;
    const errorPayload = error?.response?.data || error?.data || error;

    if (errorPayload && errorPayload.errorKey) {
      const translationParams = {};
      if (errorPayload.errorParams && errorPayload.errorParams.gameTypeIdentifier) {
        translationParams.gameType = t(`gameNames.${errorPayload.errorParams.gameTypeIdentifier}`);
      }
      displayMsg = t(errorPayload.errorKey, translationParams);
    } else if (errorPayload && errorPayload.message) {
      displayMsg = errorPayload.message;
    } else if (error instanceof Error && error.message) {
      displayMsg = error.message;
    } else if (typeof errorPayload === 'string') {
      displayMsg = errorPayload;
    } else {
      displayMsg = t("common.error");
    }
    setErrorMessage(displayMsg);
  };

  const handlePasswordSubmit = async () => {
    if (!password) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      await onSubmit(password);
      onClose();
    } catch (error) {
      console.error('Lobiye katılma hatası (LobbyPasswordModal - Şifreli):', error);
      setIsErrorModalOpen(true);
      processAndSetErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublicJoin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await onSubmit("");
    } catch (error) {
      console.error('Lobiye katılma hatası (LobbyPasswordModal - Herkese Açık):', error);
      setIsErrorModalOpen(true);
      processAndSetErrorMessage(error);
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
                  {isPasswordProtected ? t('lobby.passwordModal.titleProtected') : t('lobby.passwordModal.titlePublic')}
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
                    {t('lobby.passwordModal.descriptionProtected')}
                  </Typography>

                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label={t('lobby.passwordModal.passwordLabel')}
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
                            aria-label="toggle password visibility"
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
                          backgroundColor: palette.primary?.darker || '#3a9f71',
                        },
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {t('lobby.passwordModal.joinButton')}
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
                    {t('lobby.passwordModal.descriptionPublic')}
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
                          backgroundColor: palette.success?.medium || '#4c9f38',
                        },
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      }}
                    >
                      {t('lobby.passwordModal.joinLobbyButton')}
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

      <ErrorModal
        open={isErrorModalOpen}
        onClose={handleErrorModalClose}
        errorMessage={errorMessage}
      />
    </>
  );
});

export default LobbyPasswordModal;