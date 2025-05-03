import React from "react";
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    ListItem,
    Avatar,
    Paper,
} from "@mui/material";
import { useTheme } from '@mui/material/styles'; // Import useTheme

const ChatMessageItem = ({ message, currentUser, formatMessageListTimestamp }) => {
    const theme = useTheme(); // Get the theme object

    // Define message styles within the component as they depend on the theme
    const messageStyles = {
        currentUser: {
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '20px 20px 4px 20px',
        },
        otherUser: {
            bgcolor: theme.palette.background.paper,
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

    // --- System Message Rendering ---
    if (message.type === 'system') {
        return (
            <ListItem
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

    // --- Regular User Message Rendering ---
    const isCurrentUser = currentUser &&
        (message.senderId === currentUser.id || message.senderId?._id === currentUser.id);

    return (
        <ListItem
            sx={{
                alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                maxWidth: { xs: '90%', md: '100%' },
                p: 1,
            }}
        >
            <Box sx={{
                display: 'flex',
                gap: 1,
                flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                width: '100%',
            }}>
                {/* Avatar for other users */}
                {!isCurrentUser && message.senderId && (
                    <Avatar
                        src={message.senderId.avatar}
                        alt={message.senderId.name || message.senderId.username}
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
                    maxWidth: '100%', // Ensure content box doesn't overflow
                }}>
                    {/* Sender info for other users */}
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

                    {/* Message Bubble */}
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

                    {/* Timestamp */}
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

// Add PropTypes for better component definition and error checking
ChatMessageItem.propTypes = {
    message: PropTypes.shape({
        _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        type: PropTypes.string, // 'system' or assumed user message
        message: PropTypes.string.isRequired,
        timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        senderId: PropTypes.oneOfType([
            PropTypes.string, // Could be just an ID string
            PropTypes.shape({ // Or a populated object
                _id: PropTypes.string.isRequired,
                id: PropTypes.string, // Allow both _id and id for flexibility
                avatar: PropTypes.string,
                name: PropTypes.string,
                username: PropTypes.string,
            }),
        ]),
    }).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.string.isRequired,
        // Add other relevant currentUser fields if needed for comparison later
    }), // Can be null/undefined if no user is logged in
    formatMessageListTimestamp: PropTypes.func.isRequired,
};

export default ChatMessageItem;