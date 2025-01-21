import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../../MainScreen/MainScreenMiddleArea/LobbyContext";
import { useSnackbar } from "../../../shared/context/SnackbarContext";


export const useLobbyDeletion = () => {
  const { deleteLobby } = useLobbyContext();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar(); // Snackbar için örnek bir context

  const handleDelete = async (lobbyCode, event) => {
    if (event) {
      event.stopPropagation(); // Event bubbling'i durdur
    }

    try {
      // Lobi silme işlemini başlat
      await deleteLobby(lobbyCode);

      // Başarılı mesaj göster
      showSnackbar({
        message: "Lobi başarıyla silindi.",
        severity: "success",
      });

      // Ana sayfaya yönlendir
      navigate("/");
    } catch (error) {
      console.error("Lobi silme hatası:", error);

      // Hata mesajını kullanıcıya göster
      showSnackbar({
        message: error.response?.data?.message || "Lobi silinirken bir hata oluştu.",
        severity: "error",
      });
    }
  };

  return { handleDelete };
};