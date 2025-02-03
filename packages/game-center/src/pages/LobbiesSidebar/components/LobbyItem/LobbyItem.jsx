import React, { useState, useMemo } from "react";
import { ListItem, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LobbyAvatar } from "./LobbyAvatar";
import { LobbyInfo } from "./LobbyInfo";
import { LobbyActions } from "./LobbyActions";
import { useLobbyContext } from "../../../MainScreen/MainScreenMiddleArea/context";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import { useLobbyItem } from "./useLobbyItem";
import LobbyPasswordModal from "../../../../shared/LobbyPasswordModal";
import { getEventTimeInfo } from "../../../../utils/lobbyItemUtils";

const COLORS = {
  private: '#FFD700',
  event: '#FF69B4', 
  default: '#87CEEB'
};

function LobbyItem({ lobby, isOpen }) {
  const { existingLobby } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { isJoining,isMember, handleJoin, handleDelete,eventStatus } = useLobbyItem(lobby, currentUser);

  const [startDate, startTime] = lobby.startTime ? lobby.startTime.split("T") : [null, null];
  const [endDate, endTime] = lobby.endTime ? lobby.endTime.split("T") : [null, null];

  const timeInfo = useMemo(() => {

    return getEventTimeInfo(
      startDate, 
      startTime, 
      endDate, 
      endTime, 
      eventStatus // WebSocket durumunu ilet
    );
  }, [startDate, startTime, endDate, endTime, eventStatus]);
  
  const backgroundColor = lobby.lobbyType === "event" ? COLORS.event : COLORS[lobby.eventType] || COLORS.default;

  const isCreator = currentUser?.id === lobby.createdBy;
  const handleJoinClick = () => {
    if (lobby.password) {
      setIsPasswordModalOpen(true);
    } else {
      handleJoin();
    }
  };

  const handleNavigate = () => {
    navigate(`/lobby/${lobby.lobbyCode}`);
  };

  return (
    <>
      <Tooltip
        title={isOpen ? "" : `${lobby.lobbyName || "Unnamed Lobby"} (${lobby.eventType || "unknown"})`}
        arrow
        placement="right"
      >
        <ListItem
          button
          sx={{
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: "12px",
            backgroundColor: isOpen ? backgroundColor : "#FFF",
            color: isOpen ? "#FFF" : "#333",
            transition: "all 0.3s ease",
            padding: isOpen ? "8px 16px" : "8px",
            "&:hover": {
              backgroundColor: isOpen ? `${backgroundColor}dd` : COLORS.default,
              color: "#FFF",
            },
          }}
        >
          <LobbyAvatar lobbyType={lobby.lobbyType} backgroundColor={backgroundColor} />

          {isOpen && (
            <>
              <LobbyInfo lobbyName={lobby.lobbyName} timeInfo={timeInfo} />
              <LobbyActions
                isJoined={isMember}
                isJoining={isJoining}
                isCreator={isCreator}
                lobbyCode={lobby.lobbyCode}
                existingLobbyCode={existingLobby?.lobbyCode}
                onDelete={(e) => handleDelete(lobby.lobbyCode, e)}
                onJoin={handleJoinClick}
                onNavigate={handleNavigate}
              />
            </>
          )}  
        </ListItem>
      </Tooltip>

      <LobbyPasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleJoin}
      />
    </>
  );
}

export default LobbyItem;