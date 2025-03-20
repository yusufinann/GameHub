// ChatMessageList.js
import React, { useRef, useEffect, useState } from "react";
import {
Box,
Typography,
List,
ListItem,
Avatar,
Paper,
CircularProgress,
Badge,
Fab,
Zoom,
} from "@mui/material";
import {
ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { useTheme } from '@mui/material/styles';

const ChatMessageList = ({ messages, formatTimestamp, currentUser, isLoadingHistory, selectedConversation }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const theme = useTheme();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageStyles = {
    currentUser: {
      bgcolor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      borderRadius: '20px 20px 4px 20px',
    },
    otherUser: {
      bgcolor: theme.palette.grey[100],
      color: theme.palette.text.primary,
      borderRadius: '4px 20px 20px 20px',
    },
    systemMessage: {
      bgcolor: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
      borderRadius: '12px',
    },
  };

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setUnreadCount(0);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isAtBottomNow);
    setShowScrollButton(!isAtBottomNow);
    if (isAtBottomNow) setUnreadCount(0);
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [selectedConversation]);

  useEffect(() => {
    if (messages.length === prevMessagesLength) return;

    const newMessages = messages.slice(prevMessagesLength);
    const lastMessage = newMessages[newMessages.length - 1];
    const isCurrentUserMessage = lastMessage?.senderId === currentUser?.id ||
      lastMessage?.senderId?._id === currentUser?.id;

    if (isCurrentUserMessage) {
      scrollToBottom('smooth');
    } else {
      if (isAtBottom) {
        scrollToBottom('smooth');
      } else {
        const newOthersMessages = newMessages.filter(msg => {
          const msgSenderId = msg.senderId?._id || msg.senderId;
          return msgSenderId !== currentUser?.id;
        }).length;
        setUnreadCount(prev => prev + newOthersMessages);
      }
    }
    setPrevMessagesLength(messages.length);
  }, [messages, prevMessagesLength, isAtBottom, currentUser?.id]);

  useEffect(() => {
    scrollToBottom('auto');
    setIsAtBottom(true);
    setUnreadCount(0);
    setPrevMessagesLength(messages.length);
  }, [selectedConversation,messages.length]);


  const renderMessageItem = (message, index) => {
    const isCurrentUser = currentUser &&
      (message.senderId === currentUser.id || message.senderId?._id === currentUser.id);
    const isSystemMessage = message.type === 'system';

    return (
      <ListItem
        key={message._id || index}
        sx={{
          alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
          maxWidth: { xs: '90%', md: '70%' },
          p: 0,
          ...(isSystemMessage && {
            alignSelf: 'center',
            maxWidth: '100%'
          }),
        }}
      >
        <Box sx={{
          display: 'flex',
          gap: 1,
          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
          width: '100%',
        }}>
          {!isCurrentUser && !isSystemMessage && message.senderId && ( 
            <Avatar
              src={message.senderId.avatar}
              sx={{ width: 32, height: 32, mt: 0.5 }}
            />
          )}

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            maxWidth: '100%',
          }}>
            {!isCurrentUser && !isSystemMessage && message.senderId && ( 
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, ml: 1 }}>
                <Typography variant="caption" sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                }}>
                  {message.senderId.name}
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'text.disabled',
                  fontSize: '0.7rem',
                }}>
                  @{message.senderId.username}
                </Typography>
              </Box>
            )}

            <Paper sx={{
              p: 1.5,
              px: 2,
              boxShadow: theme.shadows[1],
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[3],
              },
              ...(isCurrentUser
                ? messageStyles.currentUser
                : isSystemMessage
                  ? messageStyles.systemMessage
                  : messageStyles.otherUser
              ),
            }}>
              <Typography sx={{
                fontSize: '0.9rem',
                lineHeight: 1.4,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {message.message}
              </Typography>
            </Paper>

            <Typography variant="caption" sx={{
              color: 'text.secondary',
              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
              px: 1,
              fontSize: '0.75rem',
            }}>
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Box>
        </Box>
      </ListItem>
    );
  };


  return (
    <Box ref={messagesContainerRef} onScroll={handleScroll} sx={{
      flex: 1,
      overflowY: 'auto',
      p: 2,
      bgcolor: 'background.default',
      '&::-webkit-scrollbar': { width: '8px' },
      '&::-webkit-scrollbar-track': { bgcolor: 'action.hover' },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'text.disabled',
        borderRadius: 4,
      },
    }}>
      {isLoadingHistory ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}>
          {messages.map(renderMessageItem)}
          <div ref={messagesEndRef} />
        </List>
      )}

      <Zoom in={showScrollButton}>
        <Fab
          color="primary"
          size="small"
          onClick={() => scrollToBottom()}
          sx={{
            position: 'absolute',
            bottom: 100,
            right: 20,
            zIndex: 999,
            boxShadow: theme.shadows[6],
            '&:hover': { transform: 'scale(1.1)' },
            transition: theme.transitions.create('transform', {
              duration: theme.transitions.duration.short,
            }),
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <ArrowDownwardIcon fontSize="small" />
          </Badge>
        </Fab>
      </Zoom>
    </Box>
  );
};

export default ChatMessageList;