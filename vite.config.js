import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  base: "/ftcci/",
  server: {
    proxy: {
      // The FTCCI API (api/), started with `npm --prefix api run dev`, and the media library files it serves.
      "/api/": "http://127.0.0.1:8787",
      "/media/": "http://127.0.0.1:8787",
    },
  },
});
