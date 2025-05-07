import {
  Typography,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header() {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const{t}=useTranslation();
  const handleProfileClick = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  return (
    <Toolbar
      sx={{
        flexWrap: "wrap",
        gap: 1,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "white",
          fontWeight: "bold",
          fontSize: { xs: "1.5rem", sm: "2rem" },
        }}
      >
        {t("Welcome back")}, {currentUser?.name}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <UserSearch/>
        <IconButton
          onClick={handleProfileClick}
          sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
        >
          <AccountCircleIcon
            sx={{
              color: "white",
              fontSize: { xs: "2rem", sm: "2.5rem" },
            }}
          />
        </IconButton>
      </Stack>
    </Toolbar>
  );
}

export default Header;
