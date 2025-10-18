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
        throw new Error("Please provide the recipient's wallet address.");
      }

      if (!/^0x[a-f0-9]{40}$/i.test(trimmedAccessor)) {
        throw new Error("Please enter a valid Ethereum address (0x...).");
      }

      if (!trimmedKey) {
        throw new Error("Please provide the encrypted document key.");
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
      <h3 style={{ 
        fontSize: "1.25rem", 
        fontWeight: 600, 
        margin: "0 0 1rem 0",
        color: "var(--text-primary)"
      }}>
        Grant Document Access
      </h3>
      
      <p style={{ 
        color: "var(--text-secondary)", 
        fontSize: "0.875rem", 
        marginBottom: "1.25rem",
        lineHeight: 1.6
      }}>
        Securely share this document with an authorized party. They will use their wallet to decrypt and verify its contents.
      </p>
      
      <div style={{ marginBottom: "1rem" }}>
        <label 
          htmlFor={`accessor-${transcript.transcriptId}`}
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
          id={`accessor-${transcript.transcriptId}`}
          value={accessorAddress}
          onChange={(event) => setAccessorAddress(event.target.value)}
          placeholder="0x..."
          className="wallet-address"
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
          htmlFor={`key-${transcript.transcriptId}`}
          style={{ 
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: "0.5rem"
          }}
        >
          Encrypted Document Key
        </label>
        <textarea
          id={`key-${transcript.transcriptId}`}
          value={encryptedKey}
          onChange={(event) => setEncryptedKey(event.target.value)}
          placeholder="Paste the encrypted key JSON here..."
          style={{
            width: "100%",
            minHeight: "110px",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1.5px solid var(--border)",
            fontSize: "0.8125rem",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontFamily: "'IBM Plex Mono', monospace",
            resize: "vertical"
          }}
        />
      </div>
      
      <button
        className="button button-success"
        type="button"
        disabled={disabled}
        onClick={() => grantMutation.mutate()}
        style={{ 
          padding: "0.75rem",
          fontSize: "0.9375rem",
          justifyContent: "center",
          gap: "0.75rem"
        }}
      >
        {grantMutation.isPending ? (
          <>
            <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
            Granting Access...
          </>
        ) : (
          "Grant Secure Access"
        )}
      </button>
      
      {successMessage && (
        <div className="status-success fade-in" style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          borderRadius: "0.75rem"
        }}>
          {successMessage}
        </div>
      )}
      
      {grantMutation.isError && (
        <div className="status-error fade-in" style={{ 
          marginTop: "1rem", 
          padding: "1rem", 
          borderRadius: "0.75rem"
        }}>
          {(grantMutation.error as Error).message}
        </div>
      )}
    </div>
  );
}