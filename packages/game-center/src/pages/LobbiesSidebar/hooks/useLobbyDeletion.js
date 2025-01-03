import { useNavigate } from "react-router-dom";
import { useLobbyContext } from "../../MainScreen/MainScreenMiddleArea/LobbyContext";

export const useLobbyDeletion = () => {
    const { deleteLobby } = useLobbyContext();
    const navigate = useNavigate();
  
    const handleDelete = async (lobbyCode, event) => {
      if (event) {
        event.stopPropagation();
      }
      
      try {
        await deleteLobby(lobbyCode);
        navigate('/');
      } catch (error) {
        console.error('Error deleting lobby:', error);
      }
    };
  
    return { handleDelete };
  };