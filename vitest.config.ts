import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["**/node_modules/**", "**/src/**", "**/dist/**", "**/test.js"],
    setupFiles: ["./__test__/setup-test-env.ts"],
    onConsoleLog(log, type) {
        console.log(log, type);
    },
  },
});