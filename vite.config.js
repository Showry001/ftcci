import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: '/ftcci/',
  server: {
    // Relays ftcci.in documents same-origin in development (see src/data/files.js).
    proxy: {
      "/ftcci/ftcci-files/": {
        target: "https://www.ftcci.in",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ftcci\/ftcci-files\//, "/source/"),
      },
    },
  },
});
