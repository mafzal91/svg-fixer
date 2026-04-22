import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Use svgo's prebuilt browser bundle to avoid pulling in node-only deps
      svgo: "svgo/dist/svgo.browser.js",
    },
  },
});
