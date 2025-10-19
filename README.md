# SafeDag

A secure, blockchain-powered platform for issuing, sharing, and verifying sensitive documents (such as NDAs, transcripts, and agreements) with fine-grained access control and emergency (break-glass) workflows, powered by blockchain.

---

## Project Structure

```
safedag/
├── backend/        # Node.js/TypeScript backend API, encryption, key management
├── contracts/      # Solidity smart contracts and deployment scripts
├── frontend/       # React (Vite) frontend for all user roles
```

---

## How It Works

### 1. Smart Contract (`contracts/contracts/TranscriptRegistry.sol`)
- **Purpose:** On-chain registry for document metadata, access control, and emergency access.
- **Roles:** University/Company (issuer), Registrar, Ministry (emergency), Employer, Recipient.
- **Key Functions:**
  - `issueTranscript`: University/company issues a document for a recipient.
  - `grantAccess` / `revokeAccess`: Recipient manages who can access their document.
  - `requestBreakGlass` / `releaseEmergencyAccess`: Emergency access flow with ministry approval.
  - `getTranscriptMeta`, `getAccessKey`, `getBreakGlassStatus`: Read functions for UI/backend.

### 2. Backend (`backend/`)
- **Purpose:** Handles file encryption, key wrapping, API endpoints, and contract interactions.
- **Key Features:**
  - Encrypts uploaded documents with AES.
  - Wraps AES keys for each recipient using their public keys.
  - Stores wrapped keys and metadata in a local database (RocksDB).
  - Provides REST API for frontend to upload, access, and manage documents.
  - Calls smart contract functions for on-chain actions.

### 3. Frontend (`frontend/`)
- **Purpose:** User interface for universities, companies, recipients, employers, and ministries.
- **Key Features:**
  - Connects to MetaMask or other wallets.
  - Role-based dashboards (University/Company, Recipient, Employer, Ministry).
  - Document upload, access management, and break-glass flows.
  - Uses smart contract for on-chain actions and backend API for off-chain logic.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MetaMask (for blockchain interactions)
- Access to a BlockDAG-compatible EVM RPC endpoint

### 1. Clone the Repository
```sh
git clone <repo-url>
cd safedag
```

### 2. Install Dependencies
```sh
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment Variables

- **contracts/.env** and **backend/.env**:  
  Set your RPC URL, contract address, and private keys.
- **frontend/.env**:  
  Set your contract address and RPC URL (with `VITE_` prefix).

### 4. Deploy the Smart Contract

```sh
cd contracts
npx hardhat run scripts/deploy.ts --network blockdag
```
Copy the deployed contract address to your `.env` files.

### 5. Grant Roles

```sh
npx hardhat run scripts/grantRoles.ts --network blockdag
```

### 6. Start Backend

```sh
cd backend
npm run dev
```

### 7. Start Frontend

```sh
cd frontend
npm run dev
```

---

## Usage

- **University/Company:** Issue documents, manage issued records.
- **Recipient:** View and share documents, grant/revoke access.
- **Employer:** Request and view documents with permission.
- **Ministry:** Handle emergency (break-glass) access and audit logs.

---

## Troubleshooting

- **MetaMask not popping up:** Ensure wallet is connected and on the correct network.
- **Transaction timeouts:** Check RPC node status and increase gas price if needed.
- **"filter not found" errors:** These are non-critical and relate to event polling; see backend logs for details.
- **Decryption issues:** Only `eth_decrypt` is supported in MetaMask; ensure the correct wallet is connected.

---

## License

MIT

---

## Authors

- [Your Name or Organization]

---

## Acknowledgements

- OpenZeppelin for AccessControl
- BlockDAG EVM community
- All contributors
