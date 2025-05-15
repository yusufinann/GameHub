import { useState, useEffect } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import { getLobbyDetails, joinLobby } from "../../../pages/MainScreen/MainScreenMiddleArea/LobbiesArea/api";
import { useLobbyContext } from "../../context/LobbyContext/context";

export const useLobbyItem = (lobby, currentUser) => {
  const { 
    setMembersByLobby,
    deleteLobby, 
    setIsJoined,
    membersByLobby 
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
    setIsErrorModalOpen(false);// Modal'ı kapat
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
      const errorMessage = err.response?.data?.message || err.message || "Failed to join the lobby.";
      setError(errorMessage); // Hata mesajını ErrorModal için ayarla
      setIsErrorModalOpen(true);
      showSnackbar({
        message: error.message || "Failed to join the lobby.",
        severity: "error",
      });
      throw error;
    } finally {
      setIsJoining(false);
    }
  };

  const handleDelete = async (lobbyCode, event) => {
    if (event) {
      event.stopPropagation();
    }
    setIsDeleting(true);
    setError(""); // Temizle
    setIsErrorModalOpen(false); // Temizle
    try {
      await deleteLobby(lobbyCode);

      showSnackbar({
        message: "Lobby successfully deleted.",
        severity: "success",
      });
      
    } catch (err) {
      console.error("Error deleting lobby:", err);
      const errorMessage = err.response?.data?.message || "An error occurred while deleting the lobby.";
      setError(errorMessage); // Silme hatasını da modal ile göstermek isterseniz
      setIsErrorModalOpen(true); // Veya sadece snackbar ile

      showSnackbar({
        message: error.response?.data?.message || "An error occurred while deleting the lobby.",
        severity: "error",
      });
    }finally {
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
      isErrorModalOpen, // Modal'ın durumunu dışarı ver
    closeErrorModal,  // Modal'ı kapatma fonksiyonunu dışarı ver
  };
};