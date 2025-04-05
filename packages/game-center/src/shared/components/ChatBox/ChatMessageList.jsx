// ChatMessageList.js
import React from "react";
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
import useChatMessageList from "./useChatMessageList";

const ChatMessageList = ({ messages, currentUser, isLoadingHistory, selectedConversation }) => {
    const {
        formatMessageListTimestamp,
        messagesEndRef,
        messagesContainerRef,
        unreadCount,
        showScrollButton,
        theme,
        scrollToBottom,
        handleScroll,
        processedMessages
    } = useChatMessageList({ messages, currentUser, isLoadingHistory, selectedConversation }); 
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
            textAlign: 'center',
        },
    };

    const renderMessageItem = (message, index) => {
        if (message.type === 'system') {
            return (
                <ListItem
                    key={message._id || index}
                    sx={{
                        alignSelf: 'center',
                        maxWidth: '100%',
                        p: 1,
                        justifyContent: "center"
                    }}
                >
                    <Paper sx={{ ...messageStyles.systemMessage, p: 1, px: 2 }}>
                        <Typography variant="body2">
                            {message.message}
                        </Typography>
                    </Paper>
                </ListItem>
            );
        }

        const isCurrentUser = currentUser &&
            (message.senderId === currentUser.id || message.senderId?._id === currentUser.id);

        return (
            <ListItem
                key={message._id || index}
                sx={{
                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    maxWidth: { xs: '90%', md: '70%' },
                    p: 0,
                }}
            >
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                    width: '100%',
                }}>
                    {!isCurrentUser && message.senderId && (
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
                        {!isCurrentUser && message.senderId && (
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
                            {formatMessageListTimestamp(message.timestamp)}
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
                    {processedMessages.map(renderMessageItem)}
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