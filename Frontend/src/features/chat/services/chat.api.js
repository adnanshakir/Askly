import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/chats",
  withCredentials: true,
});

export const sendMessage = async ({ chatId, message }) => {
  const payload = chatId ? { chat: chatId, message } : { message };

  const response = await api.post("/message", payload);
  return response.data;
};

export const getChats = async () => {
  try {
    const response = await api.get("/");
    return response.data;
  } catch (error) {
    console.error("getChats failed", error);
    return [];
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await api.get(`/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error("getMessages failed", error);
    return [];
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await api.delete(`/${chatId}/delete`);
    return response.data;
  } catch (error) {
    console.error("deleteChat failed", error);
    return null;
  }
};
