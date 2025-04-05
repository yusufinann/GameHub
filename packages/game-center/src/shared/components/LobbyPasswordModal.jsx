import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useCallback, memo } from "react";
import ErrorModal from "./ErrorModal"; // ErrorModal bileşenini import edin
import JoiningLobbyAnimation from "./JoiningLobbyAnimation";

const LobbyPasswordModal = memo(({ open, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleErrorModalClose = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit(password); // onSubmit fonksiyonunu çağır
      onClose(); // Şifre doğruysa modalı kapat
    } catch (error) {
      console.error('Lobiye katılma hatası:', error); // Hata detaylarını logla
      setIsErrorModalOpen(true); // Şifre yanlışsa ErrorModal'ı aç
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open && !isLoading} // isLoading true ise bu modalı kapat
        onClose={onClose}
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
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
              disabled={isLoading}
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
      </Modal>

      {/* JoiningLobbyAnimation için ayrı bir Modal */}
      <Modal
        open={isLoading} // isLoading true ise bu modalı aç
        onClose={() => {}} // isLoading true iken kapatma işlemi yapma
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(12px)",
          background: "radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
        }}
      >
        <JoiningLobbyAnimation />
      </Modal>

      <ErrorModal open={isErrorModalOpen} onClose={handleErrorModalClose} />
    </>
  );
});

export default LobbyPasswordModal; 