import { IconButton, CircularProgress, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility } from "@mui/icons-material";

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
            color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', 
            "&:hover": {
              color:  "rgba(244, 3, 3, 0.8)",
              backgroundColor: "rgba(245, 128, 128, 0.1)",
            },
          }}
        >
          <DeleteIcon fontSize="medium" />
        </IconButton>
      )}

      {isJoined && (
        <IconButton
          onClick={onNavigate}
          size="small"
          sx={{
            color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', 
            "&:hover": {
              color: "rgba(248, 9, 9, 0.8)",
              backgroundColor: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', 
            },
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </IconButton>
      )}

      {!isJoined && !isCreator && (
        <Button
          onClick={onJoin}
          size="small"
          sx={{
            color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
            "&:hover": {
              color:"rgba(248, 9, 9, 0.8)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          disabled={isJoining}
        >
          {isJoining ? (
            <CircularProgress size={24}/>
          ) : (
            <Button
            variant="contained"
            size="small"
            startIcon={<Visibility />}
            
            sx={{
              background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
              color: '#333',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '20px',
              boxShadow: '0px 3px 10px rgba(0,0,0,0.2)',
              transition: 'background 0.3s, transform 0.3s',
              '&:hover': {
                background: 'linear-gradient(45deg, #fad0c4, #ff9a9e)',
                transform: 'scale(1.05)',
              },
            }}
          >
            Join
          </Button>
          )}
        </Button>
      )}
    </>
  );
};