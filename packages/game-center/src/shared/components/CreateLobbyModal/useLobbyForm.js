// src/components/MainScreen/CreateLobbyModal/useLobbyForm.js
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useLobbyContext } from "../../context/LobbyContext/context";
export const useLobbyForm = () => {
  const { createLobby,isCreatingLobby } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    lobbyName: "",
    eventType: "normal",
    startTime: "",
    endTime: "", // datetime-local will provide combined date and time
    password: "",
    gameId: "",
    maxMembers: 2, //default
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const lobbyData = {
        lobbyName: formData.lobbyName,
        lobbyType: formData.eventType,
        startTime: formData.eventType === "event" ? formData.startTime : null, // Directly use datetime-local value
        endTime: formData.eventType === "event" ? formData.endTime : null,     // Directly use datetime-local value
        password: formData.password,
        game: formData.gameId,
        maxMembers: formData.maxMembers,
        createdBy: currentUser.id,
      };

      await createLobby(lobbyData);

      setSnackbar({
        open: true,
        message: "Lobi başarıyla oluşturuldu!",
        severity: "success",
      });

      setFormData({
        lobbyName: "",
        eventType: "normal",
        startTime: "",
        endTime: "",
        password: "",
        gameId: "",
        maxMembers: 4,
      });

    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Lobi oluşturulurken bir hata oluştu.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    snackbar,
    setSnackbar,
    handleChange,
    handleSubmit,
    isSubmitting, setFormData,
    isCreatingLobby
  };
};