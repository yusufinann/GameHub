import { useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { getLobbyDetails, joinLobby as apiJoinLobby } from "../../../pages/MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../context/LobbyContext/context";
import { useTranslation } from "react-i18next";

export const useLobbyItem = (lobby, currentUser) => {
  const {
    setMembersByLobby,
    deleteLobby: contextDeleteLobby,
    setIsJoined,
    membersByLobby,
  } = useLobbyContext();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMember = membersByLobby[lobby.lobbyCode]?.some(
    (member) => member.id === currentUser?.id
  );

  const handleJoin = async (password = "") => {
    setError(null);
    setIsJoining(true);

    try {
      const joinResponse = await apiJoinLobby(lobby.lobbyCode, password);
      const updatedLobby = await getLobbyDetails(lobby.lobbyCode);

      setMembersByLobby((prevState) => {
        const currentMembers = prevState[lobby.lobbyCode] || [];
        const isHost = updatedLobby.createdBy === currentUser.id;
        const existingMemberIndex = currentMembers.findIndex(
          (m) => m.id === currentUser.id
        );

        let newMembersList;
        if (existingMemberIndex >= 0) {
          newMembersList = [...currentMembers];
          newMembersList[existingMemberIndex] = {
            ...newMembersList[existingMemberIndex],
            isHost,
            name: currentUser.name,
            avatar: currentUser.avatar,
          };
        } else {
          newMembersList = [
            ...currentMembers,
            {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              isHost,
            },
          ];
        }
        return { ...prevState, [lobby.lobbyCode]: newMembersList };
      });

      if (typeof setIsJoined === 'function') {
        setIsJoined(true);
      }
      navigate(`/lobby/${lobby.lobbyCode}`);

      const successMessage = joinResponse.data?.successKey
        ? t(joinResponse.data.successKey, { lobbyName: updatedLobby.lobbyName })
        : joinResponse.data?.message || t("lobby.success.joined", { lobbyName: updatedLobby.lobbyName });

      showSnackbar({
        message: successMessage,
        severity: "success",
      });
      return joinResponse;
    } catch (err) {
      console.error("Lobiye katılma hatası (useLobbyItem):", err);
      const errorPayload = err.response?.data || err.data || err;
      let displayErrorMessage;
      let errorSeverity = "error";
      let errorKey = null;
      let errorParams = null;

      if (errorPayload && errorPayload.errorKey) {
        errorKey = errorPayload.errorKey;
        errorParams = errorPayload.errorParams || {};
        const translationParams = { ...errorParams };
        if (errorParams.gameTypeIdentifier) {
          translationParams.gameType = t(`gameNames.${errorParams.gameTypeIdentifier}`, { defaultValue: errorParams.gameTypeIdentifier });
        }
        displayErrorMessage = t(errorKey, translationParams) || errorPayload.message;

        switch (errorKey) {
          case "lobby.gameInProgress":
          case "lobby.full":
          case "lobby.invalidPassword":
          case "lobby.alreadyInAnotherLobby":
            errorSeverity = "warning";
            break;
          default:
            errorSeverity = "error";
        }
      } else if (errorPayload && errorPayload.message) {
        displayErrorMessage = errorPayload.message;
        const status = err.response?.status;
        if (status === 400 || status === 401 || status === 403 || status === 404) {
          errorSeverity = "warning";
           if (status === 404 && !displayErrorMessage) displayErrorMessage = t('common.notFound', { resource: t('lobby.lobby') });
           if (status === 401 && !displayErrorMessage) displayErrorMessage = t('error.unauthorized');
        }
      } else if (err.message) {
        displayErrorMessage = err.message;
      } else if (typeof errorPayload === 'string') {
        displayErrorMessage = errorPayload;
        errorSeverity = "info";
      } else {
        displayErrorMessage = t("common.error");
      }

      const structuredError = {
        message: displayErrorMessage,
        severity: errorSeverity,
        errorKey: errorKey,
        errorParams: errorParams
      };
      setError(structuredError);

      showSnackbar({
        message: displayErrorMessage,
        severity: errorSeverity,
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async (lobbyCode) => {
    setIsDeleting(true);
    setError(null);

    try {
      await contextDeleteLobby(lobbyCode);
      showSnackbar({
        message: t("lobby.success.deleted"),
        severity: "success",
      });
    } catch (caughtError) {
      console.error("Lobi silme hatası (useLobbyItem - raw):", caughtError);
      const errorPayload = caughtError.response?.data || caughtError.data || caughtError;
      let displayErrorMessage;
      let errorKey = null;

      if (errorPayload && errorPayload.errorKey) {
         errorKey = errorPayload.errorKey;
         displayErrorMessage = t(errorKey, errorPayload.errorParams || {}) || errorPayload.message;
      } else if (errorPayload && errorPayload.message) {
        displayErrorMessage = errorPayload.message;
      } else if (caughtError.message) {
        displayErrorMessage = caughtError.message;
      } else {
        displayErrorMessage = t("lobby.error.deleteFailed");
      }
      
      console.error("Lobi silme hatası (useLobbyItem - parsed):", displayErrorMessage);
      
      const structuredError = {
        message: displayErrorMessage,
        severity: "error",
        errorKey: errorKey
      };
      setError(structuredError);

      showSnackbar({
        message: displayErrorMessage,
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const clearError = () => {
    setError(null);
  }

  return {
    isJoining,
    isMember,
    error,
    handleJoin,
    handleDelete,
    isDeleting,
    clearError,
  };
};