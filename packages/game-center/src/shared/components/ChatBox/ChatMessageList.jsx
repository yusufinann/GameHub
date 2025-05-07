import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Fade,
  Typography,
  Divider,
} from "@mui/material";
import { KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useChatMessageList from "./useChatMessageList";
import ChatMessageItem from "./ChatMessageItem";

const OVERSCAN = 8;
const MESSAGE_ITEM_SIZE = 100;
const SEPARATOR_ITEM_SIZE = 40;
const ESTIMATED_ITEM_SIZE = MESSAGE_ITEM_SIZE;
const SCROLL_TO_BOTTOM_THRESHOLD = MESSAGE_ITEM_SIZE * 2;

const ChatMessageList = ({
  messages,
  currentUser,
  isLoadingHistory,
  selectedConversation,
  loadMoreMessages,
  hasMore,
  isLoadingMore,
  t
}) => {
  const { formatMessageListTimestamp, processedMessages } = useChatMessageList({
    messages,
    currentUser,
    isLoadingHistory,
    selectedConversation,
  });

  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef(null);
  const listOuterRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const prevProcessedMessagesLengthRef = useRef(processedMessages.length);
  const isLoadingMoreRef = useRef(false);
  const hasUserScrolledUpRef = useRef(false);
  const conversationChangedRef = useRef(false);
  const prevConversationIdRef = useRef(
    selectedConversation?._id ?? selectedConversation?.friendId
  );
  const isNearBottomRef = useRef(true);
  const lastMessageCountRef = useRef(messages.length);

  useEffect(() => {
    const currentId =
      selectedConversation?._id ?? selectedConversation?.friendId;
    if (prevConversationIdRef.current !== currentId) {
      conversationChangedRef.current = true;
      prevConversationIdRef.current = currentId;
      setShowScrollButton(false);
      scrollOffsetRef.current = 0;
      hasUserScrolledUpRef.current = false;
      isNearBottomRef.current = true;
      lastMessageCountRef.current = messages.length;
      prevProcessedMessagesLengthRef.current = 0;
    } else {
      conversationChangedRef.current = false;
    }
  }, [selectedConversation, messages.length]);

  const handleScroll = useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }) => {
      if (scrollUpdateWasRequested) return;

      const prevScroll = scrollOffsetRef.current;
      scrollOffsetRef.current = scrollOffset;
      hasUserScrolledUpRef.current =
        scrollOffset < prevScroll && prevScroll - scrollOffset > 5;

      const listElement = listOuterRef.current;
      if (!listElement) return;

      const { scrollHeight, clientHeight } = listElement;
      const isCurrentlyNearBottom =
        scrollHeight - scrollOffset - clientHeight < SCROLL_TO_BOTTOM_THRESHOLD;
      isNearBottomRef.current = isCurrentlyNearBottom;

      setShowScrollButton(!isCurrentlyNearBottom);

      if (
        scrollOffset < ESTIMATED_ITEM_SIZE * 2 &&
        hasUserScrolledUpRef.current &&
        hasMore &&
        !isLoadingMore &&
        !isLoadingMoreRef.current
      ) {
        isLoadingMoreRef.current = true;
        loadMoreMessages();
      }
    },
    [hasMore, isLoadingMore, loadMoreMessages]
  );

  useEffect(() => {
    const historyJustLoaded =
      !isLoadingHistory &&
      prevProcessedMessagesLengthRef.current === 0 &&
      processedMessages.length > 0;
    const conversationJustChanged =
      conversationChangedRef.current && processedMessages.length > 0;

    if ((historyJustLoaded || conversationJustChanged) && !isLoadingHistory) {
      const timer = setTimeout(() => {
        if (listRef.current) {
          const targetIndex = processedMessages.length - 1;
          if (targetIndex >= 0) {
            listRef.current.scrollToItem(targetIndex, "auto");
            isNearBottomRef.current = true;
            setShowScrollButton(false);
            hasUserScrolledUpRef.current = false;
            scrollOffsetRef.current =
              (listOuterRef.current?.scrollHeight ?? 0) -
              (listOuterRef.current?.clientHeight ?? 0); // Yaklaşık offset
          }
        }
        conversationChangedRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoadingHistory, processedMessages.length]);

  useEffect(() => {
    const currentLength = processedMessages.length;
    const prevLength = prevProcessedMessagesLengthRef.current;

    if (
      currentLength > prevLength &&
      isLoadingMoreRef.current &&
      listRef.current
    ) {
      const addedItemsCount = currentLength - prevLength;
      let addedHeight = 0;
      for (let i = 0; i < addedItemsCount; i++) {
        addedHeight +=
          processedMessages[i]?.type === "system"
            ? SEPARATOR_ITEM_SIZE
            : MESSAGE_ITEM_SIZE;
      }
      const newScrollOffset = scrollOffsetRef.current + addedHeight;
      listRef.current.scrollTo(newScrollOffset);
      scrollOffsetRef.current = newScrollOffset;
      isLoadingMoreRef.current = false;
    }
  }, [processedMessages]);

  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;
    const newMessagesArrived = currentMessageCount > previousMessageCount;

    if (
      newMessagesArrived &&
      isNearBottomRef.current &&
      !isLoadingMoreRef.current &&
      listRef.current
    ) {
      const targetIndex = processedMessages.length - 1;
      if (targetIndex >= 0) {
        const timer = setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollToItem(targetIndex, "smooth");
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }

    lastMessageCountRef.current = currentMessageCount;
    prevProcessedMessagesLengthRef.current = processedMessages.length;
  }, [messages.length, processedMessages.length, messages]);

  const Row = useCallback(
    ({ index, style }) => {
      const item = processedMessages[index];
      if (item.type === "system") {
        return (
          <Box
            style={style}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 1,
            }}
          >
            <Divider sx={{ flexGrow: 1, mx: 2 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ whiteSpace: "nowrap" }}
            >
              {item.message}
            </Typography>
            <Divider sx={{ flexGrow: 1, mx: 2 }} />
          </Box>
        );
      } else if (item.type === "message") {
        return (
          <Box style={style} sx={{ px: 1, pb: 1.5 }}>
            <ChatMessageItem
              message={item}
              currentUser={currentUser}
              formatMessageListTimestamp={formatMessageListTimestamp}
            />
          </Box>
        );
      }
      return null;
    },
    [currentUser, formatMessageListTimestamp, processedMessages]
  );

  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Yükleme Göstergeleri */}
      {isLoadingMore && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          <CircularProgress size={30} />
        </Box>
      )}
      {isLoadingHistory && (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      )}
      {!isLoadingHistory &&
        (processedMessages.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography color="text.secondary">{t("noMessage")}</Typography>
          </Box>
        ) : (
          <AutoSizer>
            {({ height, width }) => {
              if (height === 0 || width === 0) return null;
              return (
                <FixedSizeList
                  ref={listRef}
                  outerRef={listOuterRef}
                  height={height}
                  width={width}
                  itemCount={processedMessages.length}
                  itemSize={ESTIMATED_ITEM_SIZE}
                  overscanCount={OVERSCAN}
                  onScroll={handleScroll}
                  itemKey={(index) =>
                    processedMessages[index]._id ||
                    `msg-${index}-${processedMessages[index].type}`
                  } // Daha da benzersiz key
                >
                  {Row}
                </FixedSizeList>
              );
            }}
          </AutoSizer>
        ))}
      <Fade in={showScrollButton} timeout={300}>
        <Box
          sx={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={() => {
              if (listRef.current) {
                const targetIndex = processedMessages.length - 1;
                if (targetIndex >= 0) {
                  listRef.current.scrollToItem(targetIndex, "smooth");
                }
              }
            }}
            size="medium"
            sx={{
              bgcolor: "background.paper",
              color: "primary.main",
              boxShadow: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              "&:hover": { bgcolor: (theme) => theme.palette.action.hover },
            }}
            aria-label="En alta kaydır"
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>
      </Fade>
    </Box>
  );
};

export default ChatMessageList;
