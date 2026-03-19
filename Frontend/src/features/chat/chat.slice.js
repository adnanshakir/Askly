import { createSlice } from "@reduxjs/toolkit";

const buildMessage = (message) => ({
  id: message?.id ?? message?._id ?? `${Date.now()}-${Math.random()}`,
  content: message?.content ?? "",
  sender: message?.sender ?? message?.role ?? "assistant",
});

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setChats(state, action) {
      state.chats = Array.isArray(action.payload) ? action.payload : [];

      if (!state.currentChatId && state.chats.length > 0) {
        state.currentChatId = state.chats[0].id;
      }
    },
    setCurrentChat(state, action) {
      state.currentChatId = action.payload ?? null;
    },
    createChat(state, action) {
      const id = action.payload?.id ?? `chat-${Date.now()}`;
      const title = action.payload?.title ?? "New Chat";
      const newChat = {
        id,
        title,
        messages: [],
      };

      state.chats.unshift(newChat);
      state.currentChatId = id;
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload ?? {};
      if (!message) return;

      const targetChatId = chatId ?? state.currentChatId;
      if (!targetChatId) return;

      const existingChat = state.chats.find((chat) => chat.id === targetChatId);

      if (!existingChat) {
        state.chats.unshift({
          id: targetChatId,
          title: "New Chat",
          messages: [buildMessage(message)],
        });
        state.currentChatId = targetChatId;
        return;
      }

      if (!Array.isArray(existingChat.messages)) {
        existingChat.messages = [];
      }

      existingChat.messages.push(buildMessage(message));
    },
    setChatMessages(state, action) {
      const { chatId, messages } = action.payload ?? {};
      if (!chatId) return;

      const existingChat = state.chats.find((chat) => chat.id === chatId);
      if (!existingChat) return;

      existingChat.messages = Array.isArray(messages)
        ? messages.map((message) => buildMessage(message))
        : [];
    },
    setLoading(state, action) {
      state.isLoading = Boolean(action.payload);
    },
    setError(state, action) {
      state.error = action.payload ?? null;
    },
  },
});

export const {
  setChats,
  setCurrentChat,
  createChat,
  addMessage,
  setChatMessages,
  setLoading,
  setError,
} = chatSlice.actions;

export const setCurrentChatId = setCurrentChat;
export default chatSlice.reducer;