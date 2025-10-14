/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RPC_URL: string;
  readonly VITE_TRANSCRIPT_REGISTRY_ADDRESS: string;
  readonly VITE_BACKEND_URL: string;
  readonly VITE_GANACHE_CHAIN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
