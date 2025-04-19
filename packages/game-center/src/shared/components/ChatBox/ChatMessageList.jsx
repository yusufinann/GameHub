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
    IconButton,
    Fade,
} from "@mui/material";
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
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
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '20px 20px 4px 20px',
        },
        otherUser: {
            bgcolor: theme.palette.mode === 'light' 
                ? theme.palette.grey[100] 
                : theme.palette.background.paper,
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
                    <Paper sx={{ 
                        ...messageStyles.systemMessage, 
                        p: 1, 
                        px: 2,
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>
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
                            sx={{ 
                                width: 32, 
                                height: 32, 
                                mt: 0.5,
                                border: `2px solid ${theme.palette.primary.light}`
                            }}
                        />
                    )}

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        maxWidth: '100%',
                    }}>
                        {!isCurrentUser && message.senderId && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'baseline', 
                                gap: 1, 
                                ml: 1 
                            }}>
                                <Typography variant="caption" sx={{
                                    fontWeight: 500,
                                    color: theme.palette.text.secondary,
                                    fontFamily: theme.typography.fontFamily
                                }}>
                                    {message.senderId.name}
                                </Typography>
                                <Typography variant="caption" sx={{
                                    color: theme.palette.text.disabled,
                                    fontSize: '0.7rem',
                                    fontFamily: theme.typography.fontFamily
                                }}>
                                    @{message.senderId.username}
                                </Typography>
                            </Box>
                        )}

                        <Paper sx={{
                            p: 1.5,
                            px: 2,
                            boxShadow: theme.shadows[1],
                            transition: theme.transitions.create(['transform', 'box-shadow'], {
                                duration: theme.transitions.duration.short,
                            }),
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
                                fontFamily: theme.typography.fontFamily
                            }}>
                                {message.message}
                            </Typography>
                        </Paper>

                        <Typography variant="caption" sx={{
                            color: theme.palette.text.secondary,
                            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                            px: 1,
                            fontSize: '0.75rem',
                            fontFamily: theme.typography.fontFamily
                        }}>
                            {formatMessageListTimestamp(message.timestamp)}
                        </Typography>
                    </Box>
                </Box>
            </ListItem>
        );
    };

    return (
        <Box 
            ref={messagesContainerRef} 
            onScroll={handleScroll} 
            sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                position: 'relative',
                bgcolor: theme.palette.background.default,
                '&::-webkit-scrollbar': { 
                    width: '6px',
                    backgroundColor: 'transparent'
                },
                '&::-webkit-scrollbar-track': { 
                    bgcolor: 'transparent',
                    borderRadius: '3px'
                },
                '&::-webkit-scrollbar-thumb': {
                    bgcolor: theme.palette.mode === 'light' 
                        ? theme.palette.grey[300] 
                        : theme.palette.grey[700],
                    borderRadius: '3px',
                    '&:hover': {
                        bgcolor: theme.palette.mode === 'light' 
                            ? theme.palette.grey[400] 
                            : theme.palette.grey[600]
                    }
                },
            }}
        >
            {isLoadingHistory ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                }}>
                    <CircularProgress color="secondary" size={24} thickness={4} />
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

            <Fade in={showScrollButton}>
                <Box 
                    sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 2
                    }}
                >
                    <Badge 
                        badgeContent={unreadCount} 
                        color="error" 
                        max={99}
                        sx={{
                            '& .MuiBadge-badge': { 
                                fontSize: '0.7rem',
                                minWidth: '16px',
                                height: '16px',
                                padding: '0 4px'
                            }
                        }}
                    >
                        <IconButton
                            onClick={scrollToBottom}
                            size="small"
                            sx={{
                                bgcolor: theme.palette.background.paper,
                                boxShadow: theme.shadows[2],
                                border: `1px solid ${theme.palette.divider}`,
                                color: theme.palette.text.secondary,
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'light' 
                                        ? theme.palette.grey[100] 
                                        : theme.palette.grey[800],
                                    color: theme.palette.text.primary
                                },
                                padding: '6px'
                            }}
                        >
                            <KeyboardArrowDownIcon fontSize="small" />
                        </IconButton>
                    </Badge>
                </Box>
            </Fade>
        </Box>
    );
};

export default ChatMessageList;