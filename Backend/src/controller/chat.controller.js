import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

export async function sendMessage(req, res) {
  const { message, chat: chatId } = req.body;
  const userId = req.user.id;

  let chat = null;
  let title = null;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!chatId) {
    title = await generateChatTitle(message);
    chat = await chatModel.create({ user: userId, title });
  } else {
    chat = await chatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    title = chat.title;
  }

  await messageModel.create({
    chat: chat._id,
    user: userId,
    content: message,
    role: "user",
  });

  const messages = await messageModel.find({ chat: chat._id || chatId});
  // .sort({ createdAt: 1 });

  const result = await generateResponse(messages);

  const aiMessage = await messageModel.create({
    chat: chat._id,
    user: userId,
    content: result,
    role: "ai",
  });

  return res.status(201).json({ title, chat, aiMessage });
}

export async function getChats(req, res) {
  const userId = req.user.id;
  const chats = await chatModel.find({ user: userId });

  return res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  const chat = await chatModel.findOne({ _id: chatId, user: userId });

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  const messages = await messageModel.find({ chat: chatId });

  return res.status(200).json({
    message: "Messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res){
  const { chatId } = req.params;
  const userId = req.user.id;

  const chat = await chatModel.findOneAndDelete({ _id: chatId, user: userId });

  await messageModel.deleteMany({ chat: chatId });

  if (!chat) {
    return res.status(404).json({ error: "Chat not found" });
  }

  return res.status(200).json({
    message: "Chat deleted successfully",
  });

}