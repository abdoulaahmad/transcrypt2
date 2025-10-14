import { randomBytes } from "node:crypto";
import "dotenv/config";
import { ethers } from "ethers";
import type { InterfaceAbi } from "ethers";

import transcriptArtifact from "../artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json";

interface CliArgs {
  student: string;
  cid: string;
  transcriptHash?: string;
  ciphertext?: string;
  id?: string;
}

function parseArgs(): CliArgs {
  const entries = process.argv.slice(2).map((arg) => {
    const [key, value] = arg.split("=");
    return [key.replace(/^--/, ""), value] as const;
  });

  const args = Object.fromEntries(entries) as Partial<CliArgs>;

  if (!args.student) {
    throw new Error("Missing required --student=0x... argument");
  }
  if (!args.cid) {
    throw new Error("Missing required --cid=... argument");
  }

  return args as CliArgs;
}

function ensureAddress(address: string): `0x${string}` {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address as `0x${string}`;
}

function toBytes32(source: string): `0x${string}` {
  if (source.startsWith("0x")) {
    const padded = ethers.zeroPadValue(source as `0x${string}`, 32);
    return padded as `0x${string}`;
  }
  return ethers.id(source) as `0x${string}`;
}

async function main() {
  const {
    TRANSCRIPT_REGISTRY_ADDRESS,
    UNIVERSITY_PRIVATE_KEY,
    RPC_URL,
    GANACHE_RPC_URL,
    CONTRACTS_RPC_URL
  } = process.env;

  if (!TRANSCRIPT_REGISTRY_ADDRESS) {
    throw new Error("TRANSCRIPT_REGISTRY_ADDRESS env var is required");
  }
  if (!UNIVERSITY_PRIVATE_KEY) {
    throw new Error("UNIVERSITY_PRIVATE_KEY env var is required");
  }

  const rpcUrl = RPC_URL || GANACHE_RPC_URL || CONTRACTS_RPC_URL || "http://127.0.0.1:7545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(UNIVERSITY_PRIVATE_KEY, provider);

  const args = parseArgs();
  const student = ensureAddress(args.student);
  const cid = args.cid;
  const transcriptId = toBytes32(args.id ?? ethers.hexlify(randomBytes(32)));
  const transcriptHash = toBytes32(args.transcriptHash ?? cid);
  const ciphertext = args.ciphertext ?? "0x";

  const artifact = transcriptArtifact as { abi: InterfaceAbi };

  const contract = new ethers.Contract(TRANSCRIPT_REGISTRY_ADDRESS, artifact.abi, signer);

  // eslint-disable-next-line no-console
  console.log("Issuing transcript with params:", {
    transcriptId,
    student,
    cid,
    transcriptHash,
    ciphertext: ciphertext === "0x" ? "<empty>" : ciphertext
  });

  const tx = await contract.issueTranscript(transcriptId, student, cid, transcriptHash, ciphertext);
  // eslint-disable-next-line no-console
  console.log(`Submitted tx ${tx.hash}, waiting for confirmation...`);
  const receipt = await tx.wait();
  // eslint-disable-next-line no-console
  console.log(`Transcript issued in block ${receipt.blockNumber}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to issue transcript", error);
  process.exitCode = 1;
});
