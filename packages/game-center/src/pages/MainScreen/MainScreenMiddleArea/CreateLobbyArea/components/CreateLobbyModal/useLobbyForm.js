import { useState } from "react";
import { useLobbyContext } from "../../../context";
import { useAuthContext } from "../../../../../../shared/context/AuthContext";
export const useLobbyForm = () => {
  const { createLobby } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    lobbyName: "",
    eventType: "normal",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    password: "",
    gameId: "",
    maxMembers: 4,
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
        startTime: formData.eventType === "event" ? `${formData.startDate}T${formData.startTime}` : null,
        endTime: formData.eventType === "event" ? `${formData.endDate}T${formData.endTime}` : null,
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
        startDate: "",
        startTime: "",
        endDate: "",
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
    isSubmitting,setFormData
  };
};