import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contractsDir = resolve(__dirname, "../contracts");
const frontendDir = __dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@contracts": contractsDir
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, "")
      }
    },
    fs: {
      allow: [contractsDir, frontendDir]
    }
  },
  optimizeDeps: {
    include: ["@contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json"]
  }
});
