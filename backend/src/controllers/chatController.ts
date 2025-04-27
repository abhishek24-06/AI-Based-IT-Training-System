import { Request, Response } from "express";
import { ChatService } from "../services/chatService";

const chatService = new ChatService();

export const chatController = {
  handleMessage: async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      const userId = req.user?.id;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const chat = await chatService.processMessage(userId, message);
      res.json(chat);
    } catch (error) {
      console.error("Error handling chat message:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  },

  getChatHistory: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const chatHistory = await chatService.getChatHistory(userId, page, limit);
      res.json(chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  },
};
