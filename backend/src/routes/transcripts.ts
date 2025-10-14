import { randomBytes } from "node:crypto";

import { ethers } from "ethers";
import { Router, type Request, type Response } from "express";

import { blockchainService, config, pinataService, keyVault } from "../container";
import { encryptKeyWithEncryptionPublicKey, encryptWithAesGcm, packCipherPayload } from "../services/cryptoService";
import { hashUtf8, verifyActionSignature } from "../services/signatureService";
import { retrieveTranscript } from "../services/transcriptService";

const router = Router();

function normaliseTranscriptId(proposedId?: string): string {
  if (!proposedId) {
    return ethers.hexlify(randomBytes(32));
  }

  if (ethers.isHexString(proposedId, 32)) {
    return proposedId;
  }

  return ethers.keccak256(ethers.toUtf8Bytes(proposedId));
}

router.post("/", async (req: Request, res: Response) => {
  const file = req.file;
  const { studentAddress, studentEncryptionPublicKey, transcriptId, walletAddress, signature, nonce } = req.body as {
    studentAddress?: string;
    studentEncryptionPublicKey?: string;
    transcriptId?: string;
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!file) {
    return res.status(400).json({ error: "File upload required" });
  }

  if (!studentAddress) {
    return res.status(400).json({ error: "studentAddress is required" });
  }

  if (!walletAddress || !signature || !nonce || !studentEncryptionPublicKey) {
    return res.status(400).json({ error: "walletAddress, signature, nonce, and studentEncryptionPublicKey are required" });
  }

  let normalizedWallet: string;
  let normalizedStudent: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
    normalizedStudent = ethers.getAddress(studentAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid address provided" });
  }

  if (normalizedWallet !== config.roleAddresses.university) {
    return res.status(403).json({ error: "Wallet is not authorized to issue transcripts" });
  }

  try {
    verifyActionSignature({
      action: "ISSUE_TRANSCRIPT",
      actorAddress: normalizedWallet,
      transcriptId: transcriptId ?? null,
      targetAddress: normalizedStudent,
      extraHash: hashUtf8(studentEncryptionPublicKey),
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const transcriptIdentifier = normaliseTranscriptId(transcriptId);

  const encryption = encryptWithAesGcm(file.buffer);
  const studentWrappedKey = encryptKeyWithEncryptionPublicKey(encryption.aesKey, studentEncryptionPublicKey);
  // Debug: log the student public key and wrapped key
  console.log('[ISSUE_TRANSCRIPT] studentEncryptionPublicKey:', studentEncryptionPublicKey);
  console.log('[ISSUE_TRANSCRIPT] studentWrappedKey:', studentWrappedKey);

  keyVault.set(transcriptIdentifier, encryption.aesKey);

  const payloadBuffer = packCipherPayload({ ciphertext: encryption.ciphertext, iv: encryption.iv, authTag: encryption.authTag });
  const pinResult = await pinataService.pinBuffer(payloadBuffer, `${transcriptIdentifier}-cipher`);
  const cid = pinResult.cid;

  const receipt = await blockchainService.issueTranscript({
    transcriptId: transcriptIdentifier,
    studentAddress: normalizedStudent,
    cid,
    transcriptHash: encryption.transcriptHashHex,
    studentKeyCiphertext: studentWrappedKey
  });

  res.status(201).json({
    transcriptId: transcriptIdentifier,
    cid,
    transactionHash: receipt?.hash ?? receipt?.transactionHash,
    debug: {
      studentEncryptionPublicKey,
      studentWrappedKey
    }
  });
});

router.post("/:transcriptId/grant", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { accessorAddress, accessorEncryptionPublicKey, encryptedKey, walletAddress, signature, nonce } = req.body as {
    accessorAddress?: string;
    accessorEncryptionPublicKey?: string;
    encryptedKey?: string;
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!accessorAddress) {
    return res.status(400).json({ error: "accessorAddress is required" });
  }

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: "walletAddress, signature, and nonce are required" });
  }

  let normalizedWallet: string;
  let normalizedAccessor: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
    normalizedAccessor = ethers.getAddress(accessorAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid address provided" });
  }

  if (normalizedWallet !== config.roleAddresses.student) {
    return res.status(403).json({ error: "Wallet is not authorized to grant access" });
  }

  try {
    verifyActionSignature({
      action: "GRANT_ACCESS",
      actorAddress: normalizedWallet,
      transcriptId,
      targetAddress: normalizedAccessor,
      extraHash: hashUtf8(accessorEncryptionPublicKey ?? encryptedKey ?? null),
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let wrappedKey: string | undefined;
  if (encryptedKey) {
    wrappedKey = encryptedKey;
  } else {
    const aesKey = keyVault.get(transcriptId);
    if (!aesKey) {
      return res.status(404).json({ error: "AES key not found in vault; issue transcript first" });
    }
    if (!accessorEncryptionPublicKey) {
      return res.status(400).json({ error: "accessorEncryptionPublicKey is required if encryptedKey is not provided" });
    }
    wrappedKey = encryptKeyWithEncryptionPublicKey(aesKey, accessorEncryptionPublicKey);
  }

  const receipt = await blockchainService.grantAccess(
    {
      transcriptId,
      accessor: normalizedAccessor,
      keyCiphertext: wrappedKey
    }
  );

  res.json({ transactionHash: receipt?.hash ?? receipt?.transactionHash });
});

router.post("/:transcriptId/revoke", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { accessorAddress, walletAddress, signature, nonce } = req.body as {
    accessorAddress?: string;
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!accessorAddress) {
    return res.status(400).json({ error: "accessorAddress is required" });
  }

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: "walletAddress, signature, and nonce are required" });
  }

  let normalizedWallet: string;
  let normalizedAccessor: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
    normalizedAccessor = ethers.getAddress(accessorAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid address provided" });
  }

  if (normalizedWallet !== config.roleAddresses.student) {
    return res.status(403).json({ error: "Wallet is not authorized to revoke access" });
  }

  try {
    verifyActionSignature({
      action: "REVOKE_ACCESS",
      actorAddress: normalizedWallet,
      transcriptId,
      targetAddress: normalizedAccessor,
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const receipt = await blockchainService.revokeAccess(transcriptId, normalizedAccessor);

  res.json({ transactionHash: receipt?.hash ?? receipt?.transactionHash });
});

router.post("/:transcriptId/request-break-glass", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { walletAddress, signature, nonce } = req.body as {
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: "walletAddress, signature, and nonce are required" });
  }

  let normalizedWallet: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid wallet address" });
  }

  if (normalizedWallet !== config.roleAddresses.employer) {
    return res.status(403).json({ error: "Wallet is not authorized to request break-glass" });
  }

  try {
    verifyActionSignature({
      action: "REQUEST_BREAK_GLASS",
      actorAddress: normalizedWallet,
      transcriptId,
      targetAddress: normalizedWallet,
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const receipt = await blockchainService.requestBreakGlass(transcriptId);

  res.json({ transactionHash: receipt?.hash ?? receipt?.transactionHash });
});

router.post("/:transcriptId/approve-break-glass", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { employerAddress, approverRole, walletAddress, signature, nonce } = req.body as {
    employerAddress?: string;
    approverRole?: "registrar" | "ministry";
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!employerAddress || !approverRole) {
    return res.status(400).json({ error: "employerAddress and approverRole are required" });
  }

  if (!["registrar", "ministry"].includes(approverRole)) {
    return res.status(400).json({ error: "approverRole must be registrar or ministry" });
  }

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: "walletAddress, signature, and nonce are required" });
  }

  let normalizedWallet: string;
  let normalizedEmployer: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
    normalizedEmployer = ethers.getAddress(employerAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid address provided" });
  }

  const expectedAddress = approverRole === "registrar" ? config.roleAddresses.registrar : config.roleAddresses.ministry;
  if (normalizedWallet !== expectedAddress) {
    return res.status(403).json({ error: "Wallet is not authorized to approve break-glass" });
  }

  try {
    verifyActionSignature({
      action: "APPROVE_BREAK_GLASS",
      actorAddress: normalizedWallet,
      transcriptId,
      targetAddress: normalizedEmployer,
      extraHash: hashUtf8(approverRole),
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const receipt = await blockchainService.approveBreakGlass(transcriptId, normalizedEmployer, approverRole);

  res.json({ transactionHash: receipt?.hash ?? receipt?.transactionHash });
});

router.post("/:transcriptId/release-emergency", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { employerAddress, employerEncryptionPublicKey, walletAddress, signature, nonce } = req.body as {
    employerAddress?: string;
    employerEncryptionPublicKey?: string;
    walletAddress?: string;
    signature?: string;
    nonce?: string;
  };

  if (!employerAddress) {
    return res.status(400).json({ error: "employerAddress is required" });
  }

  if (!walletAddress || !signature || !nonce) {
    return res.status(400).json({ error: "walletAddress, signature, and nonce are required" });
  }

  let normalizedWallet: string;
  let normalizedEmployer: string;
  try {
    normalizedWallet = ethers.getAddress(walletAddress);
    normalizedEmployer = ethers.getAddress(employerAddress);
  } catch (error) {
    return res.status(400).json({ error: "Invalid address provided" });
  }

  if (normalizedWallet !== config.roleAddresses.registrar) {
    return res.status(403).json({ error: "Wallet is not authorized to release emergency access" });
  }

  try {
    verifyActionSignature({
      action: "RELEASE_EMERGENCY_ACCESS",
      actorAddress: normalizedWallet,
      transcriptId,
      targetAddress: normalizedEmployer,
      extraHash: hashUtf8(employerEncryptionPublicKey ?? null),
      nonce,
      walletAddress: normalizedWallet,
      signature
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const aesKey = keyVault.get(transcriptId);
  if (!aesKey) {
    return res.status(404).json({ error: "AES key not found in vault; cannot release emergency access" });
  }

  if (!employerEncryptionPublicKey) {
    return res.status(400).json({ error: "employerEncryptionPublicKey is required" });
  }

  const wrappedKey = encryptKeyWithEncryptionPublicKey(aesKey, employerEncryptionPublicKey);

  const receipt = await blockchainService.releaseEmergencyAccess(
    transcriptId,
    normalizedEmployer,
    wrappedKey
  );

  res.json({ transactionHash: receipt?.hash ?? receipt?.transactionHash });
});

router.get("/:transcriptId/meta", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const meta = await blockchainService.getTranscriptMeta(transcriptId);
  res.json(meta);
});

router.get("/:transcriptId/break-glass/:employer", async (req: Request, res: Response) => {
  const { transcriptId, employer } = req.params;
  const status = await blockchainService.getBreakGlassStatus(transcriptId, ethers.getAddress(employer));
  res.json(status);
});

router.get("/:transcriptId/access-key/:accessor", async (req: Request, res: Response) => {
  const { transcriptId, accessor } = req.params;
  const keyCiphertext: string = await blockchainService.getAccessKey(transcriptId, ethers.getAddress(accessor));
  res.json({ keyCiphertext });
});

router.post("/:transcriptId/retrieve", async (req: Request, res: Response) => {
  const { transcriptId } = req.params;
  const { accessorAddress, network } = req.body as { accessorAddress?: string; network?: typeof config.defaultNetwork };

  if (!accessorAddress) {
    return res.status(400).json({ error: "accessorAddress is required" });
  }

  const result = await retrieveTranscript({
    transcriptId,
    accessorAddress: ethers.getAddress(accessorAddress),
    network
  });

  res.json({
    transcriptId,
    cid: result.cid,
    studentAddress: result.studentAddress,
    transcriptHash: result.transcriptHash,
    cipherPayload: result.cipherPayload,
    wrappedKey: result.wrappedKey
  });
});

export default router;
