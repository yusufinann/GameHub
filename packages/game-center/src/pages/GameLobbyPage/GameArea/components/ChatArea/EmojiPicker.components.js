import {
  styled,
  keyframes,
  alpha,
  Button,
  IconButton,
} from "@mui/material";
import {
  EmojiEmotions as EmojiEmotionsIcon,
  ThumbUp as ThumbUpIcon,
  Celebration as CelebrationIcon,
  Favorite as HeartIcon,
  SportsEsports as GameIcon,
} from "@mui/icons-material";

// Animasyon Keyframes
export const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Statik Veri: Emoji Kategorileri
export const emojiCategories = [
  {
    name: "Yüz İfadeleri",
    icon: <EmojiEmotionsIcon />,
    emojis: ["😀", "😁", "😂", "🤣", "😊", "😇", "🙂", "😍", "🥰", "😘", "😜", "😎", "🤩", "😱", "🥺", "😴"],
  },
  {
    name: "Jestler",
    icon: <ThumbUpIcon />,
    emojis: ["👍", "👏", "👋", "🙌", "🤝", "✌️", "🤙", "💪", "👊", "🙏", "🫶", "🤲", "🫂", "🤗", "👀", "💯"],
  },
  {
    name: "Kutlama",
    icon: <CelebrationIcon />,
    emojis: ["🎉", "🎊", "🎁", "🎂", "🍾", "🥂", "🏆", "🏅", "🎯", "⭐", "✨", "🌟", "💫", "🔥", "❄️", "🎮"],
  },
  {
    name: "Kalpler",
    icon: <HeartIcon />,
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💖", "💗", "💓", "💝"],
  },
  {
    name: "Oyun",
    icon: <GameIcon />,
    emojis: ["🎮", "🎲", "🎯", "🎪", "🎭", "🎨", "🧩", "♟️", "🎪", "🎯", "🎪", "🚀", "🏁", "🎫", "🎟️", "🧸"],
  },
];

// Styled Component: Emoji Butonu
export const EmojiButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  height: "42px",
  width: "42px",
  borderRadius: "50%",
  fontSize: "22px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: theme.spacing(0.3),
  padding: 0,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: "blur(5px)",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow: `0 5px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
    background: alpha(theme.palette.primary.light, 0.15),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

// Styled Component: Navigasyon Butonu
export const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`,
  zIndex: 2,
  "&:hover": {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
  },
}));