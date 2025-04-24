import React from "react";
import {
    Box,
    List,
    CircularProgress,
    Badge,
    IconButton,
    Fade,
} from "@mui/material";
import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import useChatMessageList from "./useChatMessageList";
import ChatMessageItem from "./ChatMessageItem";

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
                    {processedMessages.map((message, index) => (
                        <ChatMessageItem
                            key={message._id || index} 
                            message={message}
                            currentUser={currentUser}
                            formatMessageListTimestamp={formatMessageListTimestamp}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </List>
            )}

            {/* Scroll to bottom button remains the same */}
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