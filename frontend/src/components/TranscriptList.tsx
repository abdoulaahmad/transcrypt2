import type { ReactNode } from "react";
import { useState } from "react";

import type { TranscriptRecord } from "../types/transcript";

interface TranscriptListProps {
  transcripts: TranscriptRecord[];
  renderActions?: (record: TranscriptRecord) => ReactNode;
}

export function TranscriptList({ transcripts, renderActions }: TranscriptListProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = async (text: string, address: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(address);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!transcripts.length) {
    return <p style={{ color: "var(--text-secondary)" }}>No transcripts found for this wallet.</p>;
  }

  return (
    <div className="transcript-list">
      {transcripts.map((record) => (
        <div className="transcript-item" key={record.transcriptId}>
          <div className="transcript-header">
            <div>
              <h3 className="transcript-title">{record.transcriptId}</h3>
              <p className="transcript-meta">Issued {new Date(record.issuedAt).toLocaleString()}</p>
            </div>
            <span className="tag">📄 Transcript</span>
          </div>
          
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>CID:</strong>
              <p style={{ margin: "0.25rem 0 0", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8125rem" }}>
                {record.cid}
              </p>
            </div>
            
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Transcript Hash:</strong>
              <p style={{ margin: "0.25rem 0 0", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.8125rem" }}>
                {record.transcriptHash}
              </p>
            </div>
            
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Student:</strong>
              <code className="wallet-address" style={{ display: "inline-block", marginTop: "0.25rem", padding: "0.25rem 0.5rem" }}>
                {record.student}
              </code>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong style={{ fontSize: "0.875rem", marginBottom: "0.5rem", display: "block" }}>Encrypted Keys:</strong>
            {Object.keys(record.encryptedKeys).length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", margin: 0 }}>
                No access grants recorded yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {Object.entries(record.encryptedKeys).map(([address, key]) => (
                  <div 
                    key={address}
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: "0.5rem" }}>
                          <code className="wallet-address" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                            {address}
                          </code>
                        </div>
                        <div style={{ 
                          fontFamily: "'IBM Plex Mono', monospace", 
                          fontSize: "0.6875rem",
                          color: "var(--text-secondary)",
                          wordBreak: "break-all",
                          maxWidth: "400px",
                          lineHeight: 1.4
                        }}>
                          {key.length > 100 ? `${key.substring(0, 100)}...` : key}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(key, address)}
                        className="button button-ghost"
                        style={{ 
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.75rem",
                          minWidth: "auto",
                          flexShrink: 0
                        }}
                        title="Copy encrypted key"
                      >
                        {copiedKey === address ? "✓ Copied" : "📋 Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {renderActions && (
            <div className="transcript-actions">
              {renderActions(record)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
