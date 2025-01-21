import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  keyframes,
} from "@mui/material";
import { useState, useCallback, memo } from "react";
import PeopleAlt from "@mui/icons-material/PeopleAlt";
import SportsEsports from "@mui/icons-material/SportsEsports";
import Widgets from "@mui/icons-material/Widgets";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";
import ErrorModal from "./ErrorModal"; // Import the ErrorModal component

// Define keyframe animations
const float = keyframes`
  0%, 100% { transform: translateY(0) rotateX(0); }
  25% { transform: translateY(-20px) rotateX(20deg); }
  75% { transform: translateY(20px) rotateX(-20deg); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

const wave = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
`;

const LobbyPasswordModal = memo(({ open, onClose, onPasswordSubmit, lobbyCode }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // State to control ErrorModal visibility
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call delay
      const isPasswordCorrect = await onPasswordSubmit(password); // Assume onPasswordSubmit returns a boolean or throws an error

      if (!isPasswordCorrect) {
        throw new Error("Incorrect password. Please try again."); // Throw an error if password is incorrect
      }

      navigate(`/lobby/${lobbyCode}`); // Navigate only if password is correct
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setIsErrorModalOpen(true); // Open the ErrorModal on error
    } finally {
      setIsLoading(false);
    }
  }, [password, onPasswordSubmit, lobbyCode, navigate]);

  const handleErrorModalClose = useCallback(() => {
    setIsErrorModalOpen(false); // Close the ErrorModal
  }, []);

  const loadingContent = (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        perspective: "1000px",
      }}
    >
      {/* Central portal effect */}
      <Box
        sx={{
          position: "relative",
          width: 200,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Orbiting circles */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            animation: `${spin} 10s linear infinite`,
            willChange: "transform",
          }}
        >
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                transform: `rotate(${i * 45}deg)`,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: (theme) => theme.palette.primary.main,
                  animation: `${bounce} 2s infinite ${i * 0.2}s`,
                  filter: "blur(4px)",
                  willChange: "transform, opacity",
                },
              }}
            />
          ))}
        </Box>

        {/* Central element with icons */}
        <Box
          sx={{
            width: 80,
            height: 80,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            willChange: "transform",
          }}
        >
          <PeopleAlt
            sx={{
              fontSize: 40,
              color: "primary.main",
              animation: `${pulse} 1.5s ease-in-out infinite`,
              willChange: "transform, opacity",
            }}
          />
          <SportsEsports
            sx={{
              fontSize: 40,
              color: "secondary.main",
              animation: `${pulse} 1.5s ease-in-out infinite 0.5s`,
              willChange: "transform, opacity",
            }}
          />
          <Widgets
            sx={{
              fontSize: 40,
              color: "success.main",
              animation: `${pulse} 1.5s ease-in-out infinite 1s`,
              willChange: "transform, opacity",
            }}
          />
        </Box>
      </Box>

      {/* Wave text effect */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 1,
          justifyContent: "center",
        }}
      >
        {"JOINING THE LOBBY".split("").map((letter, i) => (
          <Typography
            key={i}
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
              animation: `${wave} 1.2s infinite ${i * 0.04}s`,
              textShadow: "0 0 10px rgba(25, 118, 210, 0.5)",
              willChange: "transform",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </Typography>
        ))}
      </Box>

      {/* Energy particles */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
            animation: `${float} ${3 + Math.random() * 2}s infinite ${Math.random() * 2}s`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.8,
            filter: "blur(2px)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </Box>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
        }}
      >
        {isLoading ? (
          loadingContent
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: 400 },
              bgcolor: "background.paper",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
              p: 4,
              borderRadius: "16px",
              background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
            }}
          >
            <Typography variant="h6" component="h2" mb={3} textAlign="center">
              Enter Lobby Password
            </Typography>

            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              disabled={isLoading}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
            />

            {error && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "error.light",
                  p: 1,
                  borderRadius: "4px",
                  mt: 1,
                }}
              >
                <ErrorOutline sx={{ color: "error.main" }} />
                <Typography variant="body2" color="error.main">
                  {error}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 3 }}>
              <Button
                onClick={onClose}
                variant="outlined"
                sx={{
                  borderRadius: "12px",
                  border: "2px solid",
                  borderColor: "primary.main",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "white",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{
                  borderRadius: "12px",
                  background: "linear-gradient(145deg, #1976d2, #115293)",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    background: "linear-gradient(145deg, #115293, #1976d2)",
                  },
                }}
              >
                Join
              </Button>
            </Box>
          </Box>
        )}
      </Modal>

      {/* Render the ErrorModal */}
      <ErrorModal
        open={isErrorModalOpen}
        onClose={handleErrorModalClose}
        errorMessage={error}
      />
    </>
  );
});

export default LobbyPasswordModal;