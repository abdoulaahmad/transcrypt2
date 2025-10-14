import { useState } from "react";
import { hexToString } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { api } from "../lib/api";
import { registryAbi, registryAddress } from "../lib/contract";
import { decryptAesKey, decryptTranscript, bufferToBlob } from "../lib/crypto";

type HexBytes = `0x${string}`;

interface ViewTranscriptButtonProps {
  transcriptId: HexBytes;
}

export function ViewTranscriptButton({ transcriptId }: ViewTranscriptButtonProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleView = async () => {
    if (!address) {
      setError("Connect a wallet to view transcripts.");
      return;
    }
    if (!publicClient) {
      setError("Public client unavailable.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletAddress = address as HexBytes;
      const normalizedAddress = walletAddress.toLowerCase();
      const record = await api.viewTranscript(transcriptId);

      const encryptedKeys = record.encryptedKeys ?? {};
      let encryptedKeyJson = encryptedKeys[normalizedAddress];

      if (!encryptedKeyJson) {
        for (const [key, value] of Object.entries(encryptedKeys)) {
          if (key.toLowerCase() === normalizedAddress) {
            encryptedKeyJson = value;
            break;
          }
        }
      }

      if (!encryptedKeyJson) {
        try {
          const accessKeyHex = (await publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "getAccessKey",
            args: [transcriptId, walletAddress]
          })) as HexBytes;

          if (accessKeyHex && accessKeyHex !== "0x") {
            encryptedKeyJson = hexToString(accessKeyHex);
          }
        } catch (chainError) {
          const message = (chainError as Error).message ?? "";
          if (message.includes("TranscriptNotFound")) {
            throw new Error("Transcript not found on-chain. Ask the issuer to reissue it and try again.");
          }
          if (message.includes("User denied message decryption")) {
            throw new Error("MetaMask cancelled decryption. Reopen the prompt and approve to continue.");
          }
          throw new Error(`Failed to read on-chain access key: ${message}`);
        }
      }

      if (!encryptedKeyJson) {
        throw new Error("No encrypted AES key found for this wallet. Request access from the student.");
      }

      // Debug logging
      console.log('[EMPLOYER_DECRYPT] EncryptedKeyJson (raw):', encryptedKeyJson);
      // If the key is hex-encoded, decode it to a JSON string
      let decodedKeyJson = encryptedKeyJson;
      if (typeof encryptedKeyJson === 'string' && encryptedKeyJson.startsWith('0x')) {
        const hex = encryptedKeyJson.slice(2);
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        decodedKeyJson = new TextDecoder().decode(bytes);
        console.log('[EMPLOYER_DECRYPT] DecodedKeyJson:', decodedKeyJson);
      }
      let rawKey: ArrayBuffer;
      try {
        rawKey = await decryptAesKey(decodedKeyJson, walletAddress);
        console.log('[EMPLOYER_DECRYPT] Decrypted AES key:', rawKey);
      } catch (decryptError) {
        const decryptMessage = (decryptError as Error).message ?? "";
        if (decryptMessage.includes("User denied message decryption")) {
          throw new Error(
            "MetaMask cancelled decryption. Approve the request, or reset permissions in Settings → Advanced → Manage Encryption Keys."
          );
        }
        throw decryptError;
      }

      const encryptedFile = await api.getEncryptedFile(transcriptId);
      const decryptedBuffer = await decryptTranscript(encryptedFile.encryptedData, encryptedFile.iv, rawKey);
      const blob = bufferToBlob(decryptedBuffer, encryptedFile.mimeType);

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (viewError) {
      setError((viewError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button className="button" disabled={loading} onClick={handleView} type="button">
        {loading ? "Decrypting..." : "View transcript"}
      </button>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}
