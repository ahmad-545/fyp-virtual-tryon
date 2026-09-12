import { io } from "socket.io-client";

// Automatic URL detection - local ya production
const SERVER_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000"
    : "https://fyp-virtual-tryon.vercel.app";

// Singleton socket instance - ek hi connection puri app mein
const socket = io(SERVER_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ Socket Connection Error:", err.message);
});

export default socket;
