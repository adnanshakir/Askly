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

  const messages = await messageModel.find({ chat: chat._id });
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
