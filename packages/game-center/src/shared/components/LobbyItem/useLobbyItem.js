import { useState, useEffect } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { getLobbyDetails, joinLobby } from "../../../pages/MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../context/LobbyContext/context";

export const useLobbyItem = (lobby, currentUser) => {
  const {
    setMembersByLobby,
    deleteLobby: contextDeleteLobby,
    setIsJoined,
    membersByLobby,
  } = useLobbyContext();

  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const isMember = membersByLobby[lobby.lobbyCode]?.some(
    (member) => member.id === currentUser?.id
  );

  useEffect(() => {
    setIsJoined(isMember);
  }, [isMember, setIsJoined]);

  const handleJoin = async (password = "") => {
    setError("");
    setIsErrorModalOpen(false);
    setIsJoining(true);

    try {
      const joinResponse = await joinLobby(lobby.lobbyCode, password);
      const updatedLobby = await getLobbyDetails(lobby.lobbyCode);

      setMembersByLobby((prevState) => {
        const currentMembers = prevState[lobby.lobbyCode] || [];
        const isHost = updatedLobby.createdBy === currentUser.id;
        const existingMemberIndex = currentMembers.findIndex(
          (m) => m.id === currentUser.id
        );

        if (existingMemberIndex >= 0) {
          const updatedMembers = [...currentMembers];
          updatedMembers[existingMemberIndex] = {
            ...updatedMembers[existingMemberIndex],
            isHost,
          };
          return { ...prevState, [lobby.lobbyCode]: updatedMembers };
        } else {
          return {
            ...prevState,
            [lobby.lobbyCode]: [
              ...currentMembers,
              {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                isHost,
              },
            ],
          };
        }
      });
      setIsJoined(true);
      navigate(`/lobby/${lobby.lobbyCode}`);

      showSnackbar({
        message: joinResponse.message || "Successfully joined the lobby.",
        severity: "success",
      });
    } catch (err) {
      setError(err);
      setIsErrorModalOpen(true);
      showSnackbar({
        message: err,
        severity: "error",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async (lobbyCode, event) => {
    if (event) {
      event.stopPropagation();
    }
    setIsDeleting(true);
    setError("");
    setIsErrorModalOpen(false);
    try {
      await contextDeleteLobby(lobbyCode);

      showSnackbar({
        message: "Lobby successfully deleted.",
        severity: "success",
      });
    } catch (caughtError) {
      console.error("Error deleting lobby (raw):", caughtError);
      const errorMessage = caughtError.response?.data?.message || caughtError.message || "An error occurred while deleting the lobby.";
      console.error("Parsed error message for UI (delete):", errorMessage);

      setError(errorMessage);
      setIsErrorModalOpen(true);

      showSnackbar({
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setError("");
  };

  return {
    isJoining,
    isMember,
    error,
    handleJoin,
    handleDelete,
    setError,
    isDeleting,
    isErrorModalOpen,
    closeErrorModal,
  };
};