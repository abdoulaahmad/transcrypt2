# TransCrypt Frontend

React + Vite dashboard that connects via MetaMask (Wagmi), discovers the caller's roles, and surfaces transcript issuance and access workflows.

## Setup

```powershell
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` and set:

- `VITE_RPC_URL`: Ganache RPC endpoint (default `http://127.0.0.1:7545`).
- `VITE_GANACHE_CHAIN_ID`: Chain ID reported by Ganache (default `5777`).
- `VITE_TRANSCRIPT_REGISTRY_ADDRESS`: Contract address from your latest deployment.
- `VITE_BACKEND_URL`: HTTP origin for the backend API (default `http://localhost:4000`).

Vite proxies `/api` calls to `http://localhost:4000` during development, so you can omit the backend URL if you stick with defaults.

## Features

- Wallet connect/disconnect using MetaMask.
- Automatic role discovery (`UNIVERSITY`, `REGISTRAR`, `MINISTRY`, `ADMIN`).
- University dashboard: upload transcript metadata and seed wrapped keys.
- Student view: list transcripts and grant employer access (off-chain key wrapping stored in RocksDB).
- Event-driven refresh: transcript list re-fetches when `TranscriptIssued`, `AccessGranted`, or `EmergencyAccessGranted` fire on-chain.

The UI is purposely lightweight so you can focus on smart contract and backend flows; add styling frameworks (Tailwind, Chakra, etc.) as you iterate.
