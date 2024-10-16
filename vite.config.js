import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  server: {
    host: "localhost", // Change to "::" if you specifically need IPv6
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://api.insee.fr/entreprises/sirene/V3.11', // INSEE API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove "/api" prefix
      }
    }
  },
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
});
