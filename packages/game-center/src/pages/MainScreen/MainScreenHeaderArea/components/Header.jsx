import {
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuthContext } from "../../../../shared/context/AuthContext";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";
import UnifiedNotifications from "./UnifiedNotifications";

function Header() {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "common.white",
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        Welcome back, {currentUser?.name}
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="center">
        <UserSearch />        
        <IconButton onClick={handleProfileClick} sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}>
          <AccountCircleIcon sx={{ color: "common.white" }} />
        </IconButton>
        <IconButton sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}>
          <ShoppingCartIcon sx={{ color: "common.white" }} />
        </IconButton>
        {/* WebSocket bağlantısını FriendRequestNot bileşenine geçiriyoruz */}
      <UnifiedNotifications/>
      </Stack>
    </Stack>
  );
}

export default Header;