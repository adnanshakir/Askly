import { initializeSocketConnection } from "../services/chat.socket";
import { sendMessage, getChats } from "../services/chat.api";
import {
  addMessage,
  createChat,
  setChats,
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

      dispatch(setChats(rawChats.map((chat, index) => normalizeChat(chat, index))));
    } catch (error) {
      dispatch(setError(error?.message ?? "Unable to load chats"));
      dispatch(setChats([]));
    } finally {
      dispatch(setLoading(false));
    }
  }

  function selectChat(chatId) {
    dispatch(setCurrentChat(chatId));
  }

  async function sendCurrentMessage(messageText) {
    const cleanMessage = messageText?.trim();
    if (!cleanMessage) return;

    dispatch(setError(null));

    let chatId = currentChatId;

    if (!chatId) {
      chatId = `chat-${Date.now()}`;
      dispatch(
        createChat({
          id: chatId,
          title: cleanMessage.slice(0, 24) || "New Chat",
        })
      );
    }

    dispatch(
      addMessage({
        chatId,
        message: {
          id: `user-${Date.now()}`,
          content: cleanMessage,
          sender: "user",
        },
      })
    );

    dispatch(setLoading(true));
    try {
      const data = await sendMessage({ chatId, message: cleanMessage });

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
