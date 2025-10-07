import dotenv from "dotenv";

dotenv.config();

const requiredEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  rpcUrl: requiredEnv("RPC_URL", "http://127.0.0.1:7545"),
  registryAddress: requiredEnv("TRANSCRIPT_REGISTRY_ADDRESS"),
  dbPath: process.env.DB_PATH ?? "./data/rocksdb",
  corsOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
};
