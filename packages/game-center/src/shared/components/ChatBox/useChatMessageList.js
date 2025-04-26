import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useTheme } from "@mui/material/styles";

const useChatMessageList = ({
  messages = [],
  currentUser,
  isLoadingHistory,
  selectedConversation,
}) => {
  const theme = useTheme();
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);
  const prevSelectedConversationId = useRef(
    selectedConversation?._id ?? selectedConversation?.friendId
  );
  const prevIsLoadingHistory = useRef(isLoadingHistory);

  const formatMessageListTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, []);

  useEffect(() => {
    const currentConversationId =
      selectedConversation?._id ?? selectedConversation?.friendId;
    // Referansları ve önceki uzunluğu güncelle
    setPrevMessagesLength(messages.length);
    prevSelectedConversationId.current = currentConversationId;
    prevIsLoadingHistory.current = isLoadingHistory;
  }, [
    messages,
    messages.length,
    prevMessagesLength,
    currentUser?.id,
    selectedConversation,
    isLoadingHistory,
  ]);

  // Mesajları işle: Gün ayırıcıları ekle
  const processedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const output = [];
    let lastDateString = null;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString(); // Dünün tarihi

    messages.forEach((msg, index) => {
      if (!msg?.timestamp) return;

      const messageDate = new Date(msg.timestamp);
      const messageDateString = messageDate.toDateString();

      if (messageDateString !== lastDateString) {
        let label;
        if (messageDateString === today) {
          label = "Today";
        } else if (messageDateString === yesterday) {
          label = "Yesterday";
        } else {
          label = messageDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        output.push({
          _id: `separator-${messageDateString}-${index}`, // Daha benzersiz ID
          type: "system", // Ayırıcı tipi
          message: label,
          timestamp: messageDate.getTime(), // Sıralama için timestamp
        });
        lastDateString = messageDateString;
      }

      // Orijinal mesajı ekle
      output.push({ ...msg, type: "message" }); // Mesaj tipi
    });

    return output;
  }, [messages]);

  return {
    theme,
    formatMessageListTimestamp,
    processedMessages,
  };
};

export default useChatMessageList;
