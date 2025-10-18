import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useEncryptionKey } from "../hooks/useEncryptionKey";
import { api } from "../lib/api";
import { requestWalletEncryptionPublicKey } from "../lib/crypto";

function validateManualPublicKey(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Paste the encryption public key copied from MetaMask.");
  }
  try {
    const decoded = atob(trimmed);
    if (decoded.length !== 32) {
      throw new Error();
    }
  } catch {
    throw new Error(
      "Encryption public key must be a base64 string from MetaMask's 'Show encryption public key' screen."
    );
  }
  return trimmed;
}

export interface RegisterEncryptionKeyButtonProps {
  autoRequestOnConnect?: boolean;
}

export function RegisterEncryptionKeyButton({ autoRequestOnConnect = true }: RegisterEncryptionKeyButtonProps) {
  const { address } = useAccount();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [manualPublicKey, setManualPublicKey] = useState<string>("");
  const [autoRequested, setAutoRequested] = useState(false);
  const query = useEncryptionKey();

  const mutation = useMutation<string, Error, { publicKey?: string } | undefined>({
    mutationFn: async ({ publicKey: providedPublicKey }: { publicKey?: string } = {}) => {
      if (!address) {
        throw new Error("Connect a wallet to register your encryption key.");
      }
      const publicKey = providedPublicKey?.trim().length
        ? validateManualPublicKey(providedPublicKey)
        : await requestWalletEncryptionPublicKey(address as `0x${string}`);
      console.log('[DEBUG] Registering encryption public key for', address, ':', publicKey);
      await api.registerEncryptionKey(address.toLowerCase(), publicKey);
      return publicKey;
    },
    onSuccess: (_, variables) => {
      setStatusMessage(
        variables?.publicKey
          ? "Encryption key registered from manual entry."
          : "Encryption key registered successfully via MetaMask."
      );
      setManualPublicKey("");
      setAutoRequested(true);
      void query.refetch();
    },
    onError: (error) => {
      setStatusMessage((error as Error).message);
      setAutoRequested(true);
    }
  });

  useEffect(() => {
    if (query.data) {
      setStatusMessage("Encryption key already registered for this wallet.");
    } else {
      setStatusMessage(null);
    }
  }, [query.data]);

  useEffect(() => {
    if (!autoRequestOnConnect) {
      return;
    }
    if (!address) {
      setAutoRequested(false);
      return;
    }
    if (autoRequested) {
      return;
    }
    if (query.isLoading || query.isFetching) {
      return;
    }
    if (query.data) {
      return;
    }
    if (mutation.isPending) {
      return;
    }

    setAutoRequested(true);
    mutation.mutate(undefined);
  }, [autoRequestOnConnect, address, autoRequested, query.isLoading, query.isFetching, query.data, mutation]);

  const disabled = mutation.isPending || !address;
  const manualDisabled = disabled || manualPublicKey.trim().length === 0;

  return (
    <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ 
        fontSize: "1.25rem", 
        fontWeight: 600, 
        margin: "0 0 1rem 0",
        color: "var(--text-primary)"
      }}>
        Encryption Key Registration
      </h3>
      
      <p style={{ 
        fontSize: "0.9375rem", 
        color: "var(--text-secondary)",
        lineHeight: 1.6,
        marginBottom: "1.25rem"
      }}>
        Register your wallet's encryption public key so document issuers can securely encrypt sensitive files for you. 
        MetaMask will request permission to share your key.
      </p>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <button 
          className="button" 
          disabled={disabled} 
          onClick={() => mutation.mutate(undefined)} 
          type="button"
          style={{ 
            padding: "0.75rem 1.25rem",
            fontSize: "0.9375rem",
            justifyContent: "center",
            gap: "0.5rem"
          }}
        >
          {mutation.isPending ? (
            <>
              <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
              Registering...
            </>
          ) : (
            "Fetch from MetaMask"
          )}
        </button>
        
        <button
          className="button button-secondary"
          disabled={manualDisabled}
          onClick={() => mutation.mutate({ publicKey: manualPublicKey })}
          type="button"
          style={{ 
            padding: "0.75rem 1.25rem",
            fontSize: "0.9375rem",
            justifyContent: "center"
          }}
        >
          {mutation.isPending ? "Registering..." : "Register Pasted Key"}
        </button>
      </div>
      
      <div>
        <label 
          htmlFor="manual-public-key" 
          style={{ 
            display: "block", 
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)",
            marginBottom: "0.5rem"
          }}
        >
          Or paste your encryption public key
        </label>
        <textarea
          id="manual-public-key"
          placeholder="Base64 encryption public key from MetaMask"
          value={manualPublicKey}
          onChange={(event) => setManualPublicKey(event.target.value)}
          style={{
            width: "100%",
            minHeight: "120px",
            marginTop: "0.25rem",
            padding: "0.75rem 1rem",
            borderRadius: "0.75rem",
            border: "1.5px solid var(--border)",
            fontSize: "0.875rem",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontFamily: "'IBM Plex Mono', monospace",
            resize: "vertical"
          }}
        />
        <small style={{ 
          display: "block", 
          marginTop: "0.5rem",
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          lineHeight: 1.5
        }}>
          Copy the base64 string from MetaMask under <strong>Settings → Security & Privacy → Show encryption public key</strong>. 
          It should look like <code className="wallet-address" style={{ padding: "0.125rem 0.25rem" }}>Ei...</code> 
          rather than a hex string starting with <code className="wallet-address" style={{ padding: "0.125rem 0.25rem" }}>04</code>.
        </small>
      </div>
      
      {statusMessage && (
        <div className="status-success" style={{ 
          marginTop: "1rem", 
          padding: "0.75rem", 
          borderRadius: "0.75rem"
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>{statusMessage}</p>
        </div>
      )}
      
      {mutation.isError && (
        <div className="status-error" style={{ 
          marginTop: "1rem", 
          padding: "0.75rem", 
          borderRadius: "0.75rem"
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>{(mutation.error as Error).message}</p>
        </div>
      )}
    </div>
  );
}