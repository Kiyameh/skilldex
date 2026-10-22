import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const webviewRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: webviewRoot,
  base: "./",
  build: {
    outDir: resolve(webviewRoot, "../../dist/webview"),
    emptyOutDir: true,
    sourcemap: true,
  },
});
