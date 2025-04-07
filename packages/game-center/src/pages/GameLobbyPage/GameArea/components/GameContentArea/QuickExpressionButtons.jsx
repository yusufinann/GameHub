// QuickExpressionButtons.jsx
import React from "react";
import { Box, Button } from "@mui/material";
import { styled, alpha, useTheme } from "@mui/material/styles";

// Predefined expressions (you can move this to a config file if needed)
const predefinedExpressions = [
  "👍", "😂", "❤️", "🎉", "😮", "👏", "💯", "🤔", "🙏", "🔥", "🤝", "🤩",
];

// Styled Button component for quick expressions - Daha Büyük ve Şık Versiyon
const QuickEmojiButton = styled(Button)(({ theme }) => ({
  minWidth: "auto",
  width: "50px", // Daha büyük genişlik
  height: "50px", // Daha büyük yükseklik
  fontSize: "24px", // Daha büyük emoji boyutu
  borderRadius: "15px", // Daha yuvarlak kenarlar
  p: 0,
  mx: 0.5, // Daha fazla yatay boşluk
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid", // Daha kalın kenarlık
  borderColor: theme.palette.primary.light, // Kenarlık rengi (tema rengi)
  color: theme.palette.primary.main, // Emoji rengi (tema rengi)
  transition: "all 0.3s ease-in-out", // Daha yumuşak geçiş efekti
  "&:hover": {
    backgroundColor: theme.palette.secondary.main, // Hover rengi - tema ikincil renk
    color: theme.palette.common.white, // Hover emoji rengi - beyaz
    boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.3)}`, // Daha belirgin gölge
  },
}));

// QuickExpressionButtons Component
const QuickExpressionButtons = ({ onSendExpression }) => {
  const theme = useTheme(); // Tema erişimi için useTheme kullanıyoruz

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 0.5,
        overflowX: "auto",
        px: 1,
        pb: 1,
        "::-webkit-scrollbar": {
          height: "8px", // Scrollbar yüksekliği biraz artırıldı
        },
        "::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.05)",
          borderRadius: "12px", // Scrollbar track yuvarlaklığı biraz artırıldı
        },
        "::-webkit-scrollbar-thumb": {
          background: alpha(theme.palette.primary.main, 0.5), // Scrollbar rengi tema rengiyle uyumlu
          borderRadius: "12px", // Scrollbar thumb yuvarlaklığı biraz artırıldı
          "&:hover": {
            background: alpha(theme.palette.primary.main, 0.7), // Hover scrollbar rengi
          },
        }
      }}
    >
      {predefinedExpressions.map((emoji, index) => (
        <QuickEmojiButton
          key={index}
          onClick={() => onSendExpression(emoji)}
          variant="outlined" // variant="contained" veya "text" seçeneklerini de deneyebilirsiniz
        >
          {emoji}
        </QuickEmojiButton>
      ))}
    </Box>
  );
};

export default QuickExpressionButtons;