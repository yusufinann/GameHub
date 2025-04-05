import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useTheme } from '@mui/material/styles';

const useChatMessageList = ({ messages, currentUser, isLoadingHistory, selectedConversation }) => {
    const formatMessageListTimestamp = useCallback((timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        if (isToday) {
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
    }, []);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [prevMessagesLength, setPrevMessagesLength] = useState(0);
    const theme = useTheme();
    const [isAtBottom, setIsAtBottom] = useState(true);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
        setUnreadCount(0);
        setShowScrollButton(false);
    }, []);

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottomNow = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(isAtBottomNow);
        setShowScrollButton(!isAtBottomNow);
        if (isAtBottomNow) setUnreadCount(0);
    }, []);

    useEffect(() => {
        scrollToBottom('auto');
    }, [scrollToBottom]);

    useEffect(() => {
        scrollToBottom('auto');
    }, [selectedConversation, scrollToBottom]);


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
    }, [messages, prevMessagesLength, isAtBottom, currentUser?.id, scrollToBottom]);

    useEffect(() => {
        scrollToBottom('auto');
        setIsAtBottom(true);
        setUnreadCount(0);
        setPrevMessagesLength(messages.length);
    }, [selectedConversation, messages.length, scrollToBottom]);

    const getDaySeparatorText = useCallback((date, today, yesterday) => {
        if (date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()) {
            return "Today";
        } else if (date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }, []);

    const processedMessages = useMemo(() => {
        if (!messages || messages.length === 0) return [];

        let processed = [];
        let currentGroupDay = null;
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        messages.forEach((msg) => {
            const msgDate = new Date(msg.timestamp);
            const dayKey = msgDate.toDateString();
            if (dayKey !== currentGroupDay) {
                processed.push({
                    type: 'system',
                    message: getDaySeparatorText(msgDate, today, yesterday),
                    _id: `day-separator-${msgDate.toISOString()}`
                });
                currentGroupDay = dayKey;
            }
            processed.push(msg);
        });
        return processed;
    }, [messages, getDaySeparatorText]);

    return {
        formatMessageListTimestamp,
        messagesEndRef,
        messagesContainerRef,
        unreadCount,
        showScrollButton,
        isAtBottom,
        theme,
        scrollToBottom,
        handleScroll,
        processedMessages
    };
};

export default useChatMessageList;