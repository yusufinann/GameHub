import { useParams } from "react-router-dom";
import { Box, Typography, keyframes } from "@mui/material";
import GameDetailLeftArea from "./GameDetailLeftArea";
import GameDetailRightArea from "./GameDetailRightArea";
import { GAMES } from "../../utils/constants";
import { useEffect, useState } from "react";
import { useLobbyContext } from "../../shared/context/context";

const GameDetail = () => {
  const { gameId } = useParams();
  const { lobbies, existingLobby } = useLobbyContext();
  const [filteredLobbies, setFilteredLobbies] = useState([]);

  const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

  useEffect(() => {
    if (lobbies) {
      const activeLobbies = lobbies.filter((lobby) => lobby.game === gameId);
      setFilteredLobbies(activeLobbies);
    }
  }, [lobbies, gameId]);

  const game = GAMES.find((g) => g.id.toString() === gameId);
  
  const colorScheme = {
    gradientBg: "linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(45,253,163,1) 100%)",
    cardBg: "rgba(255, 255, 255, 0.8)",
    accentGradient: "linear-gradient(135deg, #2dcbb0 0%, #2dccb0 100%)",
    buttonGradient: "linear-gradient(135deg, #22c1c3 0%, #2dccb0 100%)",
    hoverGradient: "linear-gradient(135deg, #20b1b3 0%, #25b69c 100%)",
  };

  if (!game) {
    return (
      <Box p={3}>
        <Typography variant="h4">Game Not Found!</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "transparent",
        minHeight: "100vh",
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        animation: `${fadeIn} 0.6s ease-out 0.2s both`,
        opacity: 0, 
        animationFillMode: "forwards",
      }}
    >
      <GameDetailLeftArea
        colorScheme={colorScheme}
        game={game}
        filteredLobbies={filteredLobbies}
        lobbies={lobbies}
        existingLobby={existingLobby}
      />
      <GameDetailRightArea
        colorScheme={colorScheme}
        game={game}
        lobbies={lobbies}
        existingLobby={existingLobby}
        filteredLobbies={filteredLobbies}
        setFilteredLobbies={setFilteredLobbies}
      />
    </Box>
  );
};

export default GameDetail;