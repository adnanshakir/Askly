import { Router } from "express";
import { sendMessage, getChats, getMessages, deleteChat} from "../controller/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = Router();

/**
 * @route POST /api/chats/message
 * @desc Send a message to the chat and receive a response from the AI
 * @access Private
 */
chatRouter.post("/message", authUser, sendMessage);

/**
 * @route GET /api/chats
 * @desc Get all chats for the current user
 * @access Private
 */
chatRouter.get("/", authUser, getChats);

/**
 * @route GET /api/chats/:chatId/messages
 * @desc Get all messages for a specific chat
 * @access Private
 */
chatRouter.get("/:chatId/messages", authUser, getMessages);

/**
 * @route DELETE /api/chats/:chatId/delete
 * @desc Delete a specific chat
 * @access Private
 */
chatRouter.delete("/:chatId/delete", authUser, deleteChat);

export default chatRouter;
