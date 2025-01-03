import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import MembersList from "./components/MembersList/MembersList";
import GameArea from "./components/GameArea";
import { useLobbyDeletion } from "../LobbiesSidebar/hooks/useLobbyDeletion";

const GameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { handleDelete } = useLobbyDeletion();
  const [members, setMembers] = useState([
    { id: 1, name: "Host Player", isHost: true, isReady: true },
    { id: 2, name: "Player 2", isReady: false },
    { id: 3, name: "Player 3", isReady: true },
  ]);

  const userLobby = localStorage.getItem("userLobby");
  const lobbyDetails = JSON.parse(userLobby);
  if (!lobbyDetails || lobbyDetails.lobbyCode !== link) {   
    navigate("/");
    return null;
  }

  return (
    <Box
      sx={{ p: 1, minHeight: "calc(100vh - 100px)", display: "flex", gap: 1 }}
    >
      <MembersList members={members} />
      <GameArea
        lobbyInfo={lobbyDetails}
        link={link}
        onDelete={(e) => handleDelete(lobbyDetails.lobbyCode, e)}
        members={members}
      />
    </Box>
  );
};

export default GameLobbyPage;
