import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import adminRoute from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/oderRoutes.js";
import subscriberRouter from "./routes/subscriberRoutes.js";
import chatRouter from "./routes/chatRoutes.js";


dotenv.config();

console.log("ENV CHECK");
console.log("MONGO_URI =", process.env.MONGO_URI);

connectDB();

const app = express();

// Database
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
app.use("/api", chatRouter);

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

app.listen(PORT, () => {
  console.log(`🚀 Server Running : http://localhost:${PORT}`);
});


 