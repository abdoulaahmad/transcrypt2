import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: "../backend/.env" });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function addressFromPrivateKey(privateKey: string): string {
  try {
    return new ethers.Wallet(privateKey).address;
  } catch (error) {
    throw new Error(`Failed to derive address from ${privateKey.slice(0, 10)}...: ${String(error)}`);
  }
}

async function grantRoleIfNeeded(contract: any, roleName: "UNIVERSITY_ROLE" | "REGISTRAR_ROLE" | "MINISTRY_ROLE", account: string) {
  const role = await contract[roleName]();
  const alreadyHasRole = await contract.hasRole(role, account);

  if (alreadyHasRole) {
    console.log(`${account} already has ${roleName}`);
    return;
  }

  const tx = await contract.grantRole(role, account);
  await tx.wait();
  console.log(`Granted ${roleName} to ${account}`);
}

async function main() {
  const contractAddress = requireEnv("TRANSCRIPT_REGISTRY_ADDRESS");

  const [admin] = await ethers.getSigners();
  console.log(`Using admin signer ${await admin.getAddress()}`);

  const registry = await ethers.getContractAt("TranscriptRegistry", contractAddress, admin);

  const universityAddress = addressFromPrivateKey(requireEnv("UNIVERSITY_PRIVATE_KEY"));
  const registrarAddress = addressFromPrivateKey(requireEnv("REGISTRAR_PRIVATE_KEY"));
  const ministryAddress = addressFromPrivateKey(requireEnv("MINISTRY_PRIVATE_KEY"));

  await grantRoleIfNeeded(registry, "UNIVERSITY_ROLE", universityAddress);
  await grantRoleIfNeeded(registry, "REGISTRAR_ROLE", registrarAddress);
  await grantRoleIfNeeded(registry, "MINISTRY_ROLE", ministryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});