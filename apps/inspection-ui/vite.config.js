import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cloudflare from "@hono/vite-cloudflare-pages";

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  plugins: [
    react(),
    cloudflare({
      entry: "src/index.tsx",
    }),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "./index.html",
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
