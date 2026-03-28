import { createSlice } from "@reduxjs/toolkit";

const buildMessage = (message) => ({
  id: message?.id ?? message?._id ?? `${Date.now()}-${Math.random()}`,
  content: message?.content ?? "",
  sender: message?.sender ?? message?.role ?? "assistant",
});

const sortPinnedChatsFirst = (chats) => {
  const safeChats = Array.isArray(chats) ? chats : [];
  const byRecent = (a, b) =>
    Number(b?.lastUpdated ?? 0) - Number(a?.lastUpdated ?? 0);

  const pinned = safeChats
    .filter((chat) => Boolean(chat?.pinned))
    .sort(byRecent);
  const unpinned = safeChats
    .filter((chat) => !chat?.pinned)
    .sort(byRecent);
  return [...pinned, ...unpinned];
};

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
      state.chats = sortPinnedChatsFirst(action.payload);
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
        pinned: Boolean(action.payload?.pinned),
        lastUpdated: Number(action.payload?.lastUpdated ?? Date.now()),
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
          pinned: false,
          lastUpdated: Date.now(),
          messages: [buildMessage(message)],
        });
        state.currentChatId = targetChatId;
        state.chats = sortPinnedChatsFirst(state.chats);
        return;
      }

      if (!Array.isArray(existingChat.messages)) {
        existingChat.messages = [];
      }

      existingChat.messages.push(buildMessage(message));
      existingChat.lastUpdated = Date.now();
      state.chats = sortPinnedChatsFirst(state.chats);
    },
    setChatMessages(state, action) {
      const { chatId, messages } = action.payload ?? {};
      if (!chatId) return;

      const existingChat = state.chats.find((chat) => chat.id === chatId);
      if (!existingChat) return;

      const previousCount = Array.isArray(existingChat.messages)
        ? existingChat.messages.length
        : 0;
      const nextMessages = Array.isArray(messages)
        ? messages.map((message) => buildMessage(message))
        : [];

      existingChat.messages = nextMessages;

      if (nextMessages.length > previousCount) {
        existingChat.lastUpdated = Date.now();
      } else if (!existingChat.lastUpdated) {
        existingChat.lastUpdated = Date.now();
      }

      state.chats = sortPinnedChatsFirst(state.chats);
    },
    setLoading(state, action) {
      state.isLoading = Boolean(action.payload);
    },
    setError(state, action) {
      state.error = action.payload ?? null;
    },
    removeChat(state, action) {
      const chatId = action.payload;
      if (!chatId) return;

      state.chats = state.chats.filter((chat) => chat.id !== chatId);

      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
    togglePinChat(state, action) {
      const chatId = action.payload;
      if (!chatId) return;

      const targetChat = state.chats.find((chat) => chat.id === chatId);
      if (!targetChat) return;

      targetChat.pinned = !Boolean(targetChat.pinned);
      state.chats = sortPinnedChatsFirst(state.chats);
    },
    resetChatState(state) {
      state.chats = [];
      state.currentChatId = null;
      state.isLoading = false;
      state.error = null;
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
  removeChat,
  togglePinChat,
  resetChatState,
} = chatSlice.actions;

export const setCurrentChatId = setCurrentChat;
export default chatSlice.reducer;