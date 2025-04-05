import React from "react";
import {
Box,
TextField,
IconButton,
InputAdornment,
CircularProgress,
} from "@mui/material";
import {
Send as SendIcon,
EmojiEmotions as EmojiIcon,
} from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';

const ChatInput = ({ newMessage, setNewMessage, handleSendMessage, isMessagingLoading }) => {
  const theme = useTheme();

  return (
    <Box sx={{
      p: 2,
      borderTop: `1px solid ${theme.palette.divider}`,
      bgcolor: 'background.paper',
    }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
        multiline
        maxRows={4}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            bgcolor: 'background.default',
            transition: theme.transitions.create(['box-shadow', 'border-color']),
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.light,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              boxShadow: theme.shadows[2],
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small">
                <EmojiIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSendMessage}
                disabled={isMessagingLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                {isMessagingLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default ChatInput;