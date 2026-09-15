import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    // Inline assets smaller than 4kb as base64 (reduces requests)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into separate chunks
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-swiper": ["swiper"],
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
  },
});
