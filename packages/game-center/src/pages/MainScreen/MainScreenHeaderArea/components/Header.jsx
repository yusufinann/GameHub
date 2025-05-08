import {
  Typography,
  IconButton,
  Stack,
  Toolbar,
  Box,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleProfileClick = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  return (
    <Toolbar
      sx={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        flexWrap: { xs: "wrap", sm: "nowrap" },
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Typography
        variant="h6"
        noWrap
        sx={{
          color: "white",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          flexShrink: 1,
          mr: 1,
        }}
      >
        {t("Welcome")}, {currentUser?.name}
      </Typography>
      
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <UserSearch />
        <IconButton
          onClick={handleProfileClick}
          sx={{ 
            bgcolor: "rgba(255, 255, 255, 0.1)",
            ml: 1,
          }}
        >
          <AccountCircleIcon
            sx={{
              color: "white",
              fontSize: { xs: "1.75rem", sm: "2rem" },
            }}
          />
        </IconButton>
      </Box>
    </Toolbar>
  );
}

export default Header;