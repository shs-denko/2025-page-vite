import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    solidPlugin(),
  ],
  server: {
    port: 3000,
    host: true, // すべてのホストからのアクセスを許可
    allowedHosts: ["denko.takos.jp"]
  },
  build: {
    target: "esnext",
  },
});