import { IconButton, CircularProgress, Button, Box, Tooltip } from "@mui/material"; // Tooltip ekledik
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility, Edit as EditIcon } from "@mui/icons-material"; // EditIcon import edildi

export const LobbyActions = ({
  isJoined,
  isJoining,
  isCreator,
  onDelete,
  onJoin,
  onNavigate,
  onEdit,
  isMobile,
}) => {
  return (
    <>
      {isCreator && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}> {/* Box container for icons */}
          <IconButton
            onClick={onDelete}
            size="small"
            sx={{
              color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
              "&:hover": {
                color: "rgba(244, 3, 3, 0.8)",
                backgroundColor: "rgba(245, 128, 128, 0.1)",
              },
            }}
          >
            <DeleteIcon fontSize="medium" />
          </IconButton>

          <Tooltip title="Edit Lobby"> {/* Tooltip eklendi */}
            <IconButton // IconButton for Edit
              variant="contained" // variant kaldırıldı, IconButton variantı yok
              color="secondary" // color kaldırıldı, IconButton color propertysi farklı
              size={isMobile ? 'small' : 'medium'}
              onClick={onEdit}
              sx={{
                color: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', // Stil IconButton'a taşındı
                "&:hover": {
                  color: "rgba(3, 169, 244, 0.8)", // Hover rengi değiştirilebilir
                  backgroundColor: "rgba(128, 245, 245, 0.1)", // Hover arka planı
                },
              }}
            >
              <EditIcon fontSize="small" />  {/* EditIcon eklendi */}
            </IconButton>
          </Tooltip>
        </Box>
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
              color: "rgba(248, 9, 9, 0.8)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
          disabled={isJoining}
        >
          {isJoining ? (
            <CircularProgress size={24} />
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