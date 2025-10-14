import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { ethers } from "ethers";

import { config } from "./config.js";
import { startRegistryListener } from "./listeners/registryListener.js";
import { buildTranscriptRouter } from "./routes/transcriptRoutes.js";
import { buildFileRouter } from "./routes/fileRoutes.js";
import { buildEncryptionKeyRouter } from "./routes/encryptionKeyRoutes.js";
import { buildBreakGlassRouter } from "./routes/breakGlassRoutes.js";
import { TranscriptStore } from "./store/TranscriptStore.js";
import { FileStore } from "./store/FileStore.js";
import { BreakGlassService } from "./services/breakGlassService.js";

const app = express();
const transcriptStore = new TranscriptStore(config.dbPath);
const fileStore = new FileStore("./data/files");

// Initialize Break Glass Service
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const breakGlassService = new BreakGlassService(
  transcriptStore,
  provider,
  config.contractAddress,
  config.ministryAddress || ''
);

const stopListener = startRegistryListener(transcriptStore);

const allowAllOrigins = config.corsOrigins.includes("*");

app.use(
  cors({
    origin: allowAllOrigins ? true : config.corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200
  })
);
app.options("*", cors({ origin: allowAllOrigins ? true : config.corsOrigins, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/transcripts", buildTranscriptRouter(transcriptStore));
app.use("/files", buildFileRouter(fileStore));
app.use("/encryption-keys", buildEncryptionKeyRouter(transcriptStore));
app.use("/break-glass", buildBreakGlassRouter(breakGlassService));

// Export breakGlassService for use in transcript uploads
export { breakGlassService };

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${config.port}`);
});

const gracefulShutdown = () => {
  stopListener();
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log("API server closed");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled rejection", reason);
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught exception", error);
  gracefulShutdown();
});
