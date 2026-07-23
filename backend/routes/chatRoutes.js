import express from "express";
import { handleBotChat } from "../controllers/ChatController.js";

const chatRouter = express.Router();

// Endpoint: POST http://localhost:8030/api/chat
chatRouter.post("/chat", handleBotChat);

export default chatRouter;