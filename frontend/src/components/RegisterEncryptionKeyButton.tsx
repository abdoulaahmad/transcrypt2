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
    <div className="card" style={{ marginBottom: "1rem" }}>
      <h3>Encryption Key</h3>
      <p>
        Register your wallet&apos;s encryption public key so universities can encrypt transcripts for you. MetaMask will
        request permission to share it.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
  <button className="button" disabled={disabled} onClick={() => mutation.mutate(undefined)} type="button">
          {mutation.isPending ? "Registering..." : "Fetch from MetaMask"}
        </button>
        <button
          className="button"
          disabled={manualDisabled}
          onClick={() => mutation.mutate({ publicKey: manualPublicKey })}
          type="button"
        >
          {mutation.isPending ? "Registering..." : "Register pasted key"}
        </button>
      </div>
      <label htmlFor="manual-public-key" style={{ display: "block", marginTop: "0.75rem", fontWeight: 500 }}>
        Or paste your encryption public key
      </label>
      <textarea
        id="manual-public-key"
        placeholder="Base64 encryption public key from MetaMask"
        value={manualPublicKey}
        onChange={(event) => setManualPublicKey(event.target.value)}
        style={{ width: "100%", minHeight: "120px", marginTop: "0.25rem" }}
      />
      <small>
        Copy the base64 string from MetaMask under Settings → Security &amp; Privacy → Show encryption public key. It
        should look like <code>Ei...</code> rather than a hex string starting with <code>04</code>.
      </small>
      {statusMessage && <p style={{ marginTop: "0.5rem" }}>{statusMessage}</p>}
      {mutation.isError && <p style={{ color: "#dc2626" }}>{(mutation.error as Error).message}</p>}
    </div>
  );
}
