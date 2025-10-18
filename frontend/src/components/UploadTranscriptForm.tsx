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
        throw new Error("Connect a wallet with the document issuer role to issue documents.");
      }
      if (!address) {
        throw new Error("Wallet connection required.");
      }
      if (!file) {
        throw new Error("Select a document file to upload.");
      }
      if (!transcriptId || !transcriptId.startsWith("0x")) {
        throw new Error("Document ID must be a 0x-prefixed hex string.");
      }
      if (!student || !student.startsWith("0x")) {
        throw new Error("Recipient wallet must be a 0x-prefixed address.");
      }

      const transcriptHash = await sha256Hex(file);

      const studentAddressLower = student.toLowerCase();
      const issuerAddressLower = address.toLowerCase();
      const storedKey = await api.getEncryptionKey(studentAddressLower);
      const encryptionPublicKey = storedKey?.publicKey;

      if (!encryptionPublicKey && studentAddressLower !== issuerAddressLower) {
        throw new Error(
          "Recipient has not registered an encryption public key yet. Ask them to log in and register from their dashboard."
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
        throw new Error("Regulatory authority address is not set in environment variables.");
      }
      const ministryKeyInfo = await api.getEncryptionKey(ministryAddress.toLowerCase());
      if (!ministryKeyInfo?.publicKey) {
        throw new Error("Regulatory authority has not registered an encryption public key yet.");
      }
      console.log('[DEBUG] Regulatory authority public key used for encryption:', ministryKeyInfo.publicKey);
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
      console.log('[DEBUG] Uploading document with encryptedKeys (hex):', encryptedKeys);
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
    <div className="card" style={{ padding: "1.5rem" }}>
      <h2 style={{ 
        fontSize: "1.5rem", 
        fontWeight: 600, 
        margin: "0 0 1rem 0",
        color: "var(--text-primary)"
      }}>
        Issue Secure Document
      </h2>
      
      <p style={{ 
        color: "var(--text-secondary)", 
        fontSize: "0.9375rem", 
        marginBottom: "1.5rem",
        lineHeight: 1.6
      }}>
        Encrypt locally, store the ciphertext off-chain, and log metadata on-chain in a single flow.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label 
            htmlFor="transcriptId"
            style={{ 
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            Document ID (bytes32)
          </label>
          <input
            id="transcriptId"
            className="wallet-address"
            onChange={(event) => setTranscriptId(event.target.value)}
            placeholder="0x..."
            value={transcriptId}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              fontSize: "0.9375rem",
              background: "var(--surface)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <div>
          <label 
            htmlFor="student"
            style={{ 
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            Recipient Wallet Address
          </label>
          <input
            id="student"
            className="wallet-address"
            onChange={(event) => setStudent(event.target.value)}
            placeholder="0x recipient address"
            value={student}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              fontSize: "0.9375rem",
              background: "var(--surface)",
              color: "var(--text-primary)"
            }}
          />
        </div>

        <div>
          <label 
            htmlFor="file"
            style={{ 
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            Document File (PDF)
            <span style={{ color: "var(--text-secondary)", fontWeight: 400, marginLeft: "0.25rem" }}>
              (will be encrypted client-side)
            </span>
          </label>
          <input 
            accept="application/pdf" 
            id="file" 
            onChange={handleFileChange} 
            type="file"
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1.5px dashed var(--border)",
              borderRadius: "0.75rem",
              background: "var(--background)",
              fontSize: "0.9375rem"
            }}
          />
        </div>

        <button 
          className="button" 
          disabled={disabled} 
          onClick={() => mutation.mutate()} 
          type="button"
          style={{ 
            padding: "0.875rem",
            fontSize: "0.9375rem",
            justifyContent: "center",
            gap: "0.75rem"
          }}
        >
          {mutation.isPending ? (
            <>
              <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
              Issuing Document...
            </>
          ) : (
            "Encrypt & Issue Document"
          )}
        </button>

        {mutation.isError && (
          <div className="status-error" style={{ 
            padding: "0.75rem", 
            borderRadius: "0.75rem",
            marginTop: "0.5rem"
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>{(mutation.error as Error).message}</p>
          </div>
        )}
        
        {mutation.isSuccess && txHash && (
          <div className="status-success" style={{ 
            padding: "0.75rem", 
            borderRadius: "0.75rem",
            marginTop: "0.5rem"
          }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              Document issued successfully. Tx hash: <code className="wallet-address">{txHash.slice(0, 18)}...</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}