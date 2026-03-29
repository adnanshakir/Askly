import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

export async function sendMessage(req, res) {
  try {
    const { message, chat: chatId } = req.body;
    const userId = req.user.id;

    console.log("[sendMessage] Request received", {
      userId,
      hasChatId: Boolean(chatId),
      messageLength: typeof message === "string" ? message.length : 0,
    });

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

    const messages = await messageModel.find({ chat: chat._id || chatId }).sort({ createdAt: 1 });

    let aiText = "I could not generate a response right now. Please try again.";

    try {
      const result = await generateResponse(messages);
      if (typeof result === "string" && result.trim()) {
        aiText = result;
      }
    } catch (error) {
      console.error("[sendMessage] AI generation failed, using fallback response", {
        message: error?.message,
        stack: error?.stack,
      });
    }

    console.log("[sendMessage] AI response generated", {
      responseLength: aiText.length,
    });

    const aiMessage = await messageModel.create({
      chat: chat._id,
      user: userId,
      content: aiText,
      role: "ai",
    });

    console.log("[sendMessage] Response payload ready", {
      chatId: String(chat._id),
      aiMessageId: String(aiMessage._id),
    });

    return res.status(201).json({
      message: "Message sent successfully",
      title,
      chat,
      aiMessage,
    });
  } catch (error) {
    console.error("[sendMessage] Error", {
      message: error?.message,
      stack: error?.stack,
    });

    return res.status(500).json({
      message: "Failed to process chat message",
      success: false,
      err: error?.message || "Internal server error",
    });
  }
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