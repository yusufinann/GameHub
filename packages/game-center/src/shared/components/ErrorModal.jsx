import { Box, Modal, Typography, Button } from "@mui/material";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

const ErrorModal = ({ open, onClose, errorMessage }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
          p: 4,
          borderRadius: "16px",
          textAlign: "center",
        }}
      >
        <ErrorOutline sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
        <Typography variant="h6" component="h2" mb={3}>
          Error
        </Typography>
        <Typography variant="body1" mb={3}>
          {errorMessage}
        </Typography>
        <Button
          onClick={onClose}
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
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default ErrorModal;