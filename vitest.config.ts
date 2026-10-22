import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/shared/**/*.test.ts", "src/extension/**/*.test.ts"],
          exclude: ["**/*.integration.test.ts"],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "webview",
          environment: "jsdom",
          include: ["src/webview/**/*.test.ts", "src/webview/**/*.test.tsx"],
          setupFiles: ["src/webview/setup-tests.ts"],
        },
      },
    ],
  },
});
