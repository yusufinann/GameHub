import { IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export const LobbyActions = ({
  isJoined,
  isJoining,
  isCreator,
  onDelete,
  onJoin,
  onNavigate
}) => {
  return (
    <>
      {isCreator && (
        <IconButton
          onClick={onDelete}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}

      {isJoined && (
        <IconButton
          onClick={onNavigate}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      )}

      {!isJoined && !isCreator && (
        <IconButton
          onClick={onJoin}
          size="small"
          sx={{
            color: "rgba(255, 255, 255, 0.8)",
            "&:hover": {
              color: "#fff",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          disabled={isJoining}
        >
          {isJoining ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            <PersonAddIcon fontSize="small" />
          )}
        </IconButton>
      )}
    </>
  );
};