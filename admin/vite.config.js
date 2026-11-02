import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// FTCCI admin. Until Phase 4 adds sign-in, the admin API only answers on this computer (see api/src/routes/admin.ts).
export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  server: {
    host: "127.0.0.1",
    port: 5174,
    strictPort: true,
    // Uploaded files are served at /media (by Nginx in production).
    proxy: { "/api/": "http://127.0.0.1:8787", "/media/": "http://127.0.0.1:8787" },
    // Form labels and option lists come from ../shared.
    fs: { allow: [".", "../shared"] },
  },
});
