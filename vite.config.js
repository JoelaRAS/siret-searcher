import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "lib"),
      },
    ],
  },
  server: {
    proxy: {
      '/api/insee': {
        target: 'https://api.insee.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/insee/, '')
      }
    }
  }
});