# TransCrypt Backend API

Minimal Express + RocksDB service that stores encrypted transcript metadata, mirrors on-chain events, and exposes REST endpoints consumed by the React dashboard.

## Setup

```powershell
cd backend
npm install
npm run dev
```

Create a `.env` file based on `.env.example` and set:

- `RPC_URL`: Ganache RPC endpoint (default `http://127.0.0.1:7545`).
- `TRANSCRIPT_REGISTRY_ADDRESS`: Address returned when you deploy the `TranscriptRegistry` contract.
- Optional `DB_PATH`: Custom path for the RocksDB data directory (default `./data/rocksdb`).

## Available Endpoints

- `POST /transcripts/upload` – store transcript metadata and optionally an encrypted key for the student.
- `POST /transcripts/:id/grant` – append/update an encrypted key for an accessor wallet.
- `GET /transcripts/:id/view` – fetch a specific transcript record.
- `GET /transcripts?owner=0x...` – list all transcripts owned by the supplied wallet.

The server also streams on-chain events:

- `TranscriptIssued` → insert/refresh metadata.
- `AccessGranted` & `EmergencyAccessGranted` → update encrypted key mapping.

All writes wait for RocksDB to be ready before committing, so you can start the API before the database files exist.
