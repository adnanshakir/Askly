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

      const normalizedChats = rawChats.map((chat, index) =>
        normalizeChat(chat, index),
      );
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
            messages: rawMessages.map((message) =>
              normalizeMessage(message, "assistant"),
            ),
          }),
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
          messages: rawMessages.map((message) =>
            normalizeMessage(message, "assistant"),
          ),
        }),
      );
    } catch (error) {
      dispatch(setError(error?.message ?? "Unable to load messages"));
    }
  }

  async function sendCurrentMessage(messageText) {
    const cleanMessage = messageText?.trim();
    if (!cleanMessage) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const data = await sendMessage({
        chatId: currentChatId || null,
        message: cleanMessage,
      });

      const serverChat = data.chat;
      const serverChatId = serverChat._id;

      // create chat if new
      if (!currentChatId) {
        dispatch(
          createChat({
            id: serverChatId,
            title: serverChat.title,
          }),
        );
      }

      // always set active chat
      dispatch(setCurrentChat(serverChatId));

      // reload messages fresh from backend (NO manual add)
      const messageData = await getMessages(serverChatId);

      dispatch(
        setChatMessages({
          chatId: serverChatId,
          messages: messageData.messages.map((m) => ({
            id: m._id,
            content: m.content,
            sender: m.role === "user" ? "user" : "assistant",
          })),
        }),
      );
    } catch (error) {
      console.error(error);
      dispatch(setError("Failed to send message"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  function startNewChat() {
    dispatch(setCurrentChat(null));
  }

  return {
    chats,
    currentChatId,
    initializeSocketConnection,
    loadChats,
    selectChat,
    startNewChat,
    sendMessage: sendCurrentMessage,
  };
};
