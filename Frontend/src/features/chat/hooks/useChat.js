import { initializeSocketConnection } from "../services/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat as deleteChatRequest,
} from "../services/chat.api";
import {
  createChat,
  setChats,
  setChatMessages,
  setCurrentChat,
  setLoading,
  setError,
  removeChat,
  togglePinChat,
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
    pinned: Boolean(chat?.pinned),
    lastUpdated: Number(
      chat?.lastUpdated ??
        (chat?.updatedAt ? new Date(chat.updatedAt).getTime() : 0) ??
        Date.now(),
    ),
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

  async function deleteChat(chatId) {
    if (!chatId) return;

    dispatch(setError(null));

    try {
      const result = await deleteChatRequest(chatId);
      if (!result) {
        throw new Error("Unable to delete chat");
      }

      dispatch(removeChat(chatId));

      if (currentChatId === chatId) {
        dispatch(setCurrentChat(null));
      }
    } catch (error) {
      dispatch(setError(error?.message ?? "Unable to delete chat"));
    }
  }

  function pinChat(chatId) {
    if (!chatId) return;
    dispatch(togglePinChat(chatId));
  }

  return {
    chats,
    currentChatId,
    initializeSocketConnection,
    loadChats,
    selectChat,
    startNewChat,
    sendMessage: sendCurrentMessage,
    deleteChat,
    pinChat,
  };
};
