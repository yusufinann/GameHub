import { Typography, IconButton, Toolbar, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import UserSearch from "./UserSearch";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Header({
  theme,
  currentSlideColor,
}) {
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleProfileClick = () => {
    if (currentUser?.id) {
      navigate(`/profile/${currentUser.id}`);
    }
  };

  const activeSlideColorForGradient =
    currentSlideColor || theme.palette.primary.main;

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
          fontSize: { xs: "1rem", sm: "1.2rem" },
          flexShrink: 1,
          mr: 1,
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: 600,
            background:
              theme.palette.text.gradient ||
              `linear-gradient(45deg, ${activeSlideColorForGradient}, ${theme.palette.text.primary})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow:
              theme.palette.mode === "neonOcean"
                ? `0 0 10px ${activeSlideColorForGradient}60`
                : "0 1px 3px rgba(0,0,0,0.2)",
            ml: 0.5,
            transition: "all 0.8s ease-in-out",
          }}
        >
          {t("Welcome")}, {currentUser?.name}
        </Box>
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center" }}>
        <UserSearch />
        <IconButton
          onClick={handleProfileClick}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.1)",
            ml: 1,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: `${activeSlideColorForGradient}20`,
              transform: "scale(1.05)",
            },
          }}
        >
          <AccountCircleIcon
            sx={{
              color: "white",
              fontSize: { xs: "1.75rem", sm: "2rem" },
              filter:
                theme.palette.mode === "neonOcean"
                  ? `drop-shadow(0 0 8px ${activeSlideColorForGradient}60)`
                  : "none",
              transition: "filter 0.8s ease-in-out",
            }}
          />
        </IconButton>
      </Box>
    </Toolbar>
  );
}

export default Header;
