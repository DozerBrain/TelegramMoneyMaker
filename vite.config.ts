import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Telegram Mini App + Vercel optimized config
export default defineConfig({
  plugins: [react()],
  base: "./", // Ensures assets load correctly inside Telegram or any subpath
  server: {
    port: 5173,
    host: true, // allows access on mobile/local network
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
});
