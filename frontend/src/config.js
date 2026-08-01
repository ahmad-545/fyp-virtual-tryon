// src/config.js

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isLocal
  ? "http://localhost:8000/api"
  : "https://fyp-virtual-tryon.vercel.app/api";