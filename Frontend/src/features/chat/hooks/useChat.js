import { initializeSocketConnection } from "../services/chat.socket";
import { sendMessage, getChats, getMessages } from "../services/chat.api";
import {
  addMessage,
  createChat,
  setChats,
  setChatMessages,
  setCurrentChat,
  setLoading,
  setError,
} from "../chat.slice";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  const normalizeMessage = (message, fallbackSender = "assistant") => ({
    id: message?.id ?? message?._id ?? `${Date.now()}-${Math.random()}`,
    content: message?.content ?? message?.text ?? "",
    sender: message?.sender ?? message?.role ?? fallbackSender,
  });

  const normalizeChat = (chat, index) => ({
    id: chat?.id ?? chat?._id ?? `chat-${Date.now()}-${index}`,
    title: chat?.title ?? `Chat ${index + 1}`,
    messages: Array.isArray(chat?.messages)
      ? chat.messages.map((msg) => normalizeMessage(msg))
      : [],
  });

  async function loadChats() {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await getChats();
      const rawChats = Array.isArray(data)
        ? data
        : Array.isArray(data?.chats)
        ? data.chats
        : [];

      const normalizedChats = rawChats.map((chat, index) => normalizeChat(chat, index));
      dispatch(setChats(normalizedChats));

      if (normalizedChats.length > 0) {
        const firstChatId = normalizedChats[0].id;
        const messageData = await getMessages(firstChatId);
        const rawMessages = Array.isArray(messageData)
          ? messageData
          : Array.isArray(messageData?.messages)
          ? messageData.messages
          : [];

        dispatch(
          setChatMessages({
            chatId: firstChatId,
            messages: rawMessages.map((message) => normalizeMessage(message, "assistant")),
          })
        );
      }
    } catch (error) {
      dispatch(setError(error?.message ?? "Unable to load chats"));
      dispatch(setChats([]));
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function selectChat(chatId) {
    if (!chatId) return;

    dispatch(setCurrentChat(chatId));

    try {
      const data = await getMessages(chatId);
      const rawMessages = Array.isArray(data)
        ? data
        : Array.isArray(data?.messages)
        ? data.messages
        : [];

      dispatch(
        setChatMessages({
          chatId,
          messages: rawMessages.map((message) => normalizeMessage(message, "assistant")),
        })
      );
    } catch (error) {
      dispatch(setError(error?.message ?? "Unable to load messages"));
    }
  }

  async function sendCurrentMessage(messageText) {
    const cleanMessage = messageText?.trim();
    if (!cleanMessage) return;

    dispatch(setError(null));

    let chatId = currentChatId;
    const userMessage = {
      id: `user-${Date.now()}`,
      content: cleanMessage,
      sender: "user",
    };

    if (chatId) {
      dispatch(
        addMessage({
          chatId,
          message: userMessage,
        })
      );
    }

    dispatch(setLoading(true));
    try {
      const data = await sendMessage({ chatId, message: cleanMessage });

      const serverChat = data?.chat ?? null;
      const serverChatId = serverChat?._id ?? serverChat?.id ?? chatId;

      if (!chatId && serverChatId) {
        dispatch(
          createChat({
            id: serverChatId,
            title: serverChat?.title ?? (cleanMessage.slice(0, 24) || "New Chat"),
          })
        );

        dispatch(
          addMessage({
            chatId: serverChatId,
            message: userMessage,
          })
        );
      }

      chatId = serverChatId;

      const aiCandidate =
        data?.aiMessage ??
        data?.message ??
        data?.data?.aiMessage ??
        null;

      const aiReply = aiCandidate
        ? normalizeMessage(aiCandidate, "assistant")
        : {
            id: `ai-${Date.now()}`,
            content: "I could not generate a response right now.",
            sender: "assistant",
          };

      dispatch(
        addMessage({
          chatId,
          message: aiReply,
        })
      );
    } catch (error) {
      dispatch(setError(error?.message ?? "Failed to send message"));
      dispatch(
        addMessage({
          chatId,
          message: {
            id: `ai-${Date.now()}`,
            content: "Something went wrong while contacting the server.",
            sender: "assistant",
          },
        })
      );
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    chats,
    currentChatId,
    initializeSocketConnection,
    loadChats,
    selectChat,
    sendMessage: sendCurrentMessage,
  }
};
