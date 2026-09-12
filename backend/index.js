import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import adminRoute from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/oderRoutes.js";
import subscriberRouter from "./routes/subscriberRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import tryOnRouter from "./routes/tryOnRoutes.js";

dotenv.config();

console.log("ENV CHECK");
console.log("MONGO_URI =", process.env.MONGO_URI);

const app = express();

// ============================================
// HTTP SERVER + SOCKET.IO SETUP
// ============================================
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://trylo.store",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Socket Disconnected: ${socket.id}`);
  });
});

// Database Connection
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://trylo.store",
    ],
    credentials: true,
  })
);

app.use("/api/admin", adminRoute);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriber", subscriberRouter);
app.use("/api/subscribers", subscriberRouter);
app.use("/api", chatRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/ai", tryOnRouter);
app.use("/api/tryon", tryOnRouter);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend Running Successfully",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

const PORT = process.env.PORT || 8000;

// Use httpServer instead of app.listen (for Socket.io)
httpServer.listen(PORT, () => {
  console.log(`🚀 Server Running : http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO Ready on port ${PORT}`);
});