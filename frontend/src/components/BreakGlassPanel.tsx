import { useState } from "react";
import { useAccount } from "wagmi";
import { api } from "../lib/api";
import { decryptAesKey } from "../lib/crypto";

interface BreakGlassFormProps {
  onSuccess?: () => void;
}

export function BreakGlassPanel({ onSuccess }: BreakGlassFormProps) {
  const { address } = useAccount();
  const [transcriptId, setTranscriptId] = useState("");
  const [reason, setReason] = useState("");
  const [courtOrder, setCourtOrder] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<{ wrappedKey: string; message: string } | null>(null);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecuteBreakGlass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError("Please connect your wallet");
      return;
    }
    if (reason.length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }
    setIsExecuting(true);
    setError(null);
    setResult(null);
    setDecryptedKey(null);
    try {
      const res = await api.executeBreakGlass({
        transcriptId,
        ministryAddress: address,
        reason,
        courtOrder: courtOrder || undefined
      });
      setResult(res);
      setCopied(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || "Failed to execute break glass");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDecryptKey = async () => {
    if (!result?.wrappedKey) return;
    try {
      const key = await decryptAesKey(result.wrappedKey, address);
      setDecryptedKey(key);
      setCopied(false);
    } catch (err: any) {
      setError("Failed to decrypt key with MetaMask: " + (err?.message || err));
    }
  };

  return (
    <div className="card" style={{ padding: "2rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <span style={{ fontSize: "2rem" }}>🚨</span>
        <h2 style={{ margin: 0, color: "var(--danger)", fontSize: "1.5rem", fontWeight: 600 }}>
          Break Glass - Emergency Access
        </h2>
      </div>
      <div className="status-warning" style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: "0.75rem" }}>
        <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.6 }}>
          ⚠️ <strong>Warning:</strong> This action will be immutably logged on-chain and the document owner will be notified immediately.<br />
          Use only for legal investigations, court orders, or fraud prevention.
        </p>
      </div>
      <form onSubmit={handleExecuteBreakGlass} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label htmlFor="transcriptId" style={{ 
            display: "block", 
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)"
          }}>
            Document ID
          </label>
          <input
            id="transcriptId"
            type="text"
            value={transcriptId}
            onChange={e => setTranscriptId(e.target.value)}
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
            required
          />
        </div>
        <div>
          <label htmlFor="reason" style={{ 
            display: "block", 
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)"
          }}>
            Reason for Access
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Legal investigation, court order, fraud detection..."
            required
            style={{ 
              width: "100%", 
              minHeight: "100px",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              fontSize: "0.9375rem",
              background: "var(--surface)",
              color: "var(--text-primary)",
              resize: "vertical"
            }}
          />
          <small style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
            Minimum 10 characters. This will be permanently recorded on-chain.
          </small>
        </div>
        <div>
          <label htmlFor="courtOrder" style={{ 
            display: "block", 
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-primary)"
          }}>
            Legal Authorization Reference <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(Optional)</span>
          </label>
          <input
            id="courtOrder"
            type="text"
            value={courtOrder}
            onChange={e => setCourtOrder(e.target.value)}
            placeholder="Case #12345..."
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
        {error && (
          <div className="status-error" style={{ padding: "1rem", borderRadius: "0.75rem" }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}
        {result && (
          <div className="status-success" style={{ padding: "1.25rem", borderRadius: "0.75rem" }}>
            <p style={{ marginBottom: "0.75rem" }}>✓ {result.message}</p>
            <div style={{ marginTop: "1rem" }}>
              <strong style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Encrypted Key Retrieved:
              </strong>
              <code
                className="wallet-address"
                style={{
                  display: "block",
                  marginTop: "0.75rem",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  maxHeight: "80px",
                  overflow: "auto",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  background: "var(--background)",
                  border: "1px solid var(--border)"
                }}
              >
                {result.wrappedKey.substring(0, 200)}...
              </code>
              <button
                type="button"
                className="button-ghost"
                style={{ 
                  marginTop: "0.75rem", 
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem"
                }}
                onClick={() => {
                  navigator.clipboard.writeText(result.wrappedKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "✓ Copied!" : "Copy Encrypted Key"}
              </button>
              <p style={{ fontSize: "0.8125rem", marginTop: "0.75rem", marginBottom: 0, color: "var(--text-secondary)" }}>
                Use this key with your MetaMask wallet to decrypt the document.
              </p>
              <button
                type="button"
                className="button button-secondary"
                style={{ 
                  marginTop: "1rem", 
                  fontSize: "0.875rem",
                  padding: "0.5rem 1rem",
                  width: "100%"
                }}
                onClick={handleDecryptKey}
                disabled={!!decryptedKey}
              >
                {decryptedKey ? "✓ Decrypted" : "Decrypt with MetaMask"}
              </button>
              {decryptedKey && (
                <div style={{ marginTop: "1.25rem" }}>
                  <strong style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Decrypted AES Key:
                  </strong>
                  <code
                    style={{
                      display: "block",
                      marginTop: "0.75rem",
                      fontSize: "0.75rem",
                      wordBreak: "break-all",
                      maxHeight: "80px",
                      overflow: "auto",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      fontFamily: "'IBM Plex Mono', monospace"
                    }}
                  >
                    {decryptedKey}
                  </code>
                  <button
                    type="button"
                    className="button-ghost"
                    style={{ 
                      marginTop: "0.75rem", 
                      fontSize: "0.875rem",
                      padding: "0.5rem 1rem"
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(decryptedKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? "✓ Copied!" : "Copy Key"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={isExecuting || !address}
          className="button button-danger"
          style={{ 
            padding: "0.875rem 1.5rem", 
            fontSize: "0.9375rem",
            justifyContent: "center",
            gap: "0.75rem"
          }}
        >
          {isExecuting ? (
            <>
              <span className="loading-spinner" style={{ width: '1.125rem', height: '1.125rem' }} />
              Executing Break Glass...
            </>
          ) : (
            "🚨 Execute Emergency Access"
          )}
        </button>
        {!address && (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
            Please connect your wallet to execute break glass
          </p>
        )}
      </form>
    </div>
  );
}