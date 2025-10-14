import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "../lib/api";
import type { TranscriptRecord } from "../types/transcript";

interface StudentGrantAccessFormProps {
  transcript: TranscriptRecord;
  owner?: string;
}

export function StudentGrantAccessForm({ transcript, owner }: StudentGrantAccessFormProps) {
  const queryClient = useQueryClient();
  const [accessorAddress, setAccessorAddress] = useState<string>("");
  const [encryptedKey, setEncryptedKey] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const grantMutation = useMutation({
    mutationFn: async () => {
      setSuccessMessage(null);

      const trimmedAccessor = accessorAddress.trim();
      const trimmedKey = encryptedKey.trim();

      if (!trimmedAccessor) {
        throw new Error("Please provide the employer's wallet address.");
      }

      if (!/^0x[a-f0-9]{40}$/i.test(trimmedAccessor)) {
        throw new Error("Please enter a valid Ethereum address (0x...).");
      }

      if (!trimmedKey) {
        throw new Error("Please provide the encrypted AES key ciphertext.");
      }

      const response = await api.grantAccess(transcript.transcriptId, {
        accessor: trimmedAccessor,
        encryptedKey: trimmedKey
      });

      if (owner) {
        await queryClient.invalidateQueries({ queryKey: ["transcripts", owner.toLowerCase()] });
      }

      setAccessorAddress("");
      setEncryptedKey("");
      setSuccessMessage(`✓ Access granted successfully to ${trimmedAccessor.slice(0, 6)}...${trimmedAccessor.slice(-4)}`);
      return response;
    }
  });

  const disabled = grantMutation.isPending || !accessorAddress.trim() || !encryptedKey.trim();

  return (
    <div className="grant-form">
      <h3>Grant Transcript Access</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
        Grant access to an employer so they can verify your transcript securely using their MetaMask wallet.
      </p>
      
      <label htmlFor={`accessor-${transcript.transcriptId}`}>
        Accessor Wallet
        <span style={{ color: "var(--text-secondary)", fontWeight: 400, marginLeft: "0.25rem" }}>
          (Employer address)
        </span>
      </label>
      <input
        id={`accessor-${transcript.transcriptId}`}
        value={accessorAddress}
        onChange={(event) => setAccessorAddress(event.target.value)}
        placeholder="0x..."
        className="wallet-address"
      />
      
      <label htmlFor={`key-${transcript.transcriptId}`}>
        Encrypted AES Key
        <span style={{ color: "var(--text-secondary)", fontWeight: 400, marginLeft: "0.25rem" }}>
          (Ciphertext)
        </span>
      </label>
      <textarea
        id={`key-${transcript.transcriptId}`}
        value={encryptedKey}
        onChange={(event) => setEncryptedKey(event.target.value)}
        placeholder="Paste the encrypted key JSON here..."
        style={{ minHeight: "110px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8125rem" }}
      />
      
      <button
        className="button button-success"
        type="button"
        disabled={disabled}
        onClick={() => grantMutation.mutate()}
      >
        {grantMutation.isPending ? (
          <>
            <span className="loading-spinner" />
            Granting access...
          </>
        ) : (
          "Grant access"
        )}
      </button>
      
      {successMessage && (
        <div className="status-message status-success fade-in">
          {successMessage}
        </div>
      )}
      
      {grantMutation.isError && (
        <div className="status-message status-error fade-in">
          {(grantMutation.error as Error).message}
        </div>
      )}
    </div>
  );
}
