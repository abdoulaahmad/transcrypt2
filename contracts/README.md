# TransCrypt Smart Contracts

Solidity smart contracts for the academic transcript verification MVP. The `TranscriptRegistry` contract tracks encrypted transcript metadata, manages access grants, and orchestrates emergency (break-glass) approvals.

## Prerequisites
- Node.js 18+
- pnpm, npm, or yarn (examples below use npm)

## Quickstart: Ganache
1. Launch Ganache (GUI or CLI) on `http://127.0.0.1:7545`.
2. Copy a funded account's private key into the `.env` values shown below.
3. Deploy the contracts against the Ganache network.

```powershell
cd contracts
npm install
npx hardhat run scripts/deploy.ts --network ganache
```

After deployment, note the `TranscriptRegistry` address for backend/frontend integration. You can reuse the same signer to run `scripts/grantRoles.ts` and distribute the required roles.

## Setup
```powershell
cd contracts
npm install
```

Create a `.env` file (optional) if you plan to deploy to a testnet:
```dotenv
FANTOM_RPC_URL=https://...
AVALANCHE_FUJI_RPC_URL=https://...
BLOCKDAG_RPC_URL=https://rpc.blockdag.network
BLOCKDAG_CHAIN_ID=12345
BLOCKDAG_GAS_PRICE=25000000000
GANACHE_RPC_URL=http://127.0.0.1:7545
GANACHE_PRIVATE_KEY=0x...
DEPLOYER_PRIVATE_KEY=0x...
```

## Useful Commands
```powershell
# Compile the contracts
npm run build

# Run the test suite
npm test

# Deploy locally (uses Hardhat network)
npx hardhat run scripts/deploy.ts

# Deploy to Ganache (current primary workflow)
npx hardhat run scripts/deploy.ts --network ganache

# Deploy to BlockDAG (uses values from .env)
npx hardhat run scripts/deploy.ts --network blockdag
```

## Ganache Local Development
- Launch Ganache on `http://127.0.0.1:8545` (default) and copy a funded account's private key into `GANACHE_PRIVATE_KEY`.
- Update `GANACHE_RPC_URL` if you're using a custom host/port.
- Run the deploy command above with `--network ganache`; the script will use the Ganache account and RPC.

## Deploying to BlockDAG
- Ensure your deployment wallet (matching `DEPLOYER_PRIVATE_KEY`) has sufficient BlockDAG testnet funds.
- Set `BLOCKDAG_RPC_URL` to the network endpoint provided by blockdag.network (HTTP or HTTPS).
- Optional: override `BLOCKDAG_CHAIN_ID` and `BLOCKDAG_GAS_PRICE` in `.env` if the defaults differ from Hardhat's auto-detection or you need a custom gas price.
- Run the deploy command above; the script will log the deployed `TranscriptRegistry` address for your frontend/backend configuration.

## TranscriptRegistry Highlights
- Role-based control via OpenZeppelin `AccessControl`:
  - `UNIVERSITY_ROLE`: Issue transcripts.
  - `REGISTRAR_ROLE` and `MINISTRY_ROLE`: Approve break-glass requests and release emergency keys.
- On-chain events capture the complete audit trail for issuance, access grants, requests, approvals, and emergency releases.
- Transcript metadata (`cid`, `transcriptHash`, owner) stored on-chain; wrapped AES keys stored per accessor.
- Break-glass workflow enforces dual approval before releasing emergency keys.

## Next Steps
- Integrate deployment scripts for target testnets.
- Wire backend services to listen for events and supply off-chain wrapped key material.
- Expand test coverage for failure modes (revoked approvals, repeated requests, etc.).
