import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { bytesToHex, stringToHex } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { api } from "../lib/api";
import { registryAbi, registryAddress } from "../lib/contract";
import { encryptTranscriptFile } from "../lib/crypto";

type HexAddress = `0x${string}`;

async function sha256Hex(file: File): Promise<`0x${string}`> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

export function UploadTranscriptForm() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();

  const [transcriptId, setTranscriptId] = useState("");
  const [student, setStudent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      setTxHash(null);
      if (!walletClient || !publicClient) {
        throw new Error("Connect a wallet with the university role to issue transcripts.");
      }
      if (!address) {
        throw new Error("Wallet connection required.");
      }
      if (!file) {
        throw new Error("Select an encrypted transcript file to upload.");
      }
      if (!transcriptId || !transcriptId.startsWith("0x")) {
        throw new Error("Transcript ID must be a 0x-prefixed hex string.");
      }
      if (!student || !student.startsWith("0x")) {
        throw new Error("Student wallet must be a 0x-prefixed address.");
      }


      const transcriptHash = await sha256Hex(file);

      const studentAddressLower = student.toLowerCase();
      const issuerAddressLower = address.toLowerCase();
      const storedKey = await api.getEncryptionKey(studentAddressLower);
      const encryptionPublicKey = storedKey?.publicKey;

      if (!encryptionPublicKey && studentAddressLower !== issuerAddressLower) {
        throw new Error(
          "Student has not registered an encryption public key yet. Ask them to log in and register from their dashboard."
        );
      }

      // Encrypt for student
      const { package: encryptedPackage, exportedKey } = await encryptTranscriptFile(
        file,
        student as HexAddress,
        encryptionPublicKey ? { publicKey: encryptionPublicKey } : undefined
      );

      // Encrypt AES key for ministry (break glass)
  const ministryAddress = import.meta.env.VITE_MINISTRY_ADDRESS;
      if (!ministryAddress) {
        throw new Error("Ministry address is not set in environment variables.");
      }
      const ministryKeyInfo = await api.getEncryptionKey(ministryAddress.toLowerCase());
      if (!ministryKeyInfo?.publicKey) {
        throw new Error("Ministry has not registered an encryption public key yet.");
      }
      console.log('[DEBUG] Ministry public key used for encryption:', ministryKeyInfo.publicKey);
      // Use wrapAesKeyForPublicKey from crypto
      // Import at top: import { wrapAesKeyForPublicKey } from "../lib/crypto";
      const { wrapAesKeyForPublicKey } = await import("../lib/crypto");
      const ministryWrappedKey = wrapAesKeyForPublicKey(
        Uint8Array.from(atob(exportedKey), c => c.charCodeAt(0)).buffer,
        ministryKeyInfo.publicKey
      );

      await api.uploadEncryptedFile({
        transcriptId,
        encryptedData: encryptedPackage.ciphertext,
        iv: encryptedPackage.iv,
        mimeType: encryptedPackage.mimeType
      });

      const encryptedKeys = {
        [student.toLowerCase()]:
          // If the key is a JSON string, hex-encode it (0x + hex of utf8 bytes)
          typeof encryptedPackage.aesKey === 'string' && encryptedPackage.aesKey.startsWith('{')
            ? '0x' + Array.from(new TextEncoder().encode(encryptedPackage.aesKey)).map(b => b.toString(16).padStart(2, '0')).join('')
            : encryptedPackage.aesKey,
        [ministryAddress.toLowerCase()]: ministryWrappedKey
      };
      // Only ministryWrappedKey may need conversion if it's a JSON string (for future compatibility)
      // (Currently, ministryWrappedKey is already in the correct format from wrapAesKeyForPublicKey)
      console.log('[DEBUG] Uploading transcript with encryptedKeys (hex):', encryptedKeys);
      await api.uploadTranscript({
        transcriptId,
        student,
        cid: `local://${transcriptId}`,
        transcriptHash,
        encryptedKeys
      });

      const receipt = await walletClient.writeContract({
        address: registryAddress,
        abi: registryAbi,
        functionName: "issueTranscript",
        args: [
          transcriptId as `0x${string}`,
          student as HexAddress,
          `local://${transcriptId}`,
          transcriptHash,
          stringToHex(encryptedPackage.aesKey) as `0x${string}`
        ]
      });

      setTxHash(receipt);
      await publicClient.waitForTransactionReceipt({ hash: receipt });

      return receipt;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["transcripts"] });
  setTranscriptId("");
      setStudent("");
      setFile(null);
    }
  });

  const disabled = mutation.isPending || !transcriptId || !student || !file;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
  };

  return (
    <div className="card">
      <h2>Issue Transcript</h2>
      <p>Encrypt locally, store the ciphertext off-chain, and log metadata on-chain in a single flow.</p>

      <label htmlFor="transcriptId">Transcript ID (bytes32)</label>
      <input
        id="transcriptId"
        onChange={(event) => setTranscriptId(event.target.value)}
        placeholder="0x..."
        value={transcriptId}
      />

      <label htmlFor="student">Student Wallet</label>
      <input
        id="student"
        onChange={(event) => setStudent(event.target.value)}
        placeholder="0x student address"
        value={student}
      />

      <label htmlFor="file">Transcript PDF (will be encrypted client-side)</label>
      <input accept="application/pdf" id="file" onChange={handleFileChange} type="file" />

      <button className="button" disabled={disabled} onClick={() => mutation.mutate()} type="button">
        {mutation.isPending ? "Issuing..." : "Encrypt & Issue"}
      </button>

      {mutation.isError && <p style={{ color: "#dc2626" }}>{(mutation.error as Error).message}</p>}
      {mutation.isSuccess && txHash && (
        <p style={{ color: "#047857" }}>Transcript issued. Tx hash: {txHash.slice(0, 18)}...</p>
      )}
    </div>
  );
}
