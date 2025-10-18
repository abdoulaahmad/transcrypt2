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
    return <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem" }}>No documents found for this wallet.</p>;
  }

  return (
    <div className="transcript-list">
      {transcripts.map((record) => (
        <div className="transcript-item" key={record.transcriptId}>
          <div className="transcript-header">
            <div>
              <h3 className="transcript-title" style={{ 
                fontSize: "1.125rem", 
                fontWeight: 600, 
                color: "var(--text-primary)",
                margin: "0 0 0.25rem 0"
              }}>
                {record.transcriptId}
              </h3>
              <p className="transcript-meta">
                Issued {new Date(record.issuedAt).toLocaleString()}
              </p>
            </div>
            <span className="tag">📄 Secure Document</span>
          </div>
          
          <div style={{ display: "grid", gap: "0.875rem", marginBottom: "1.25rem" }}>
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>CID:</strong>
              <p style={{ 
                margin: "0.25rem 0 0", 
                fontFamily: "'IBM Plex Mono', monospace", 
                fontSize: "0.8125rem",
                color: "var(--text-primary)"
              }}>
                {record.cid}
              </p>
            </div>
            
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>Document Hash:</strong>
              <p style={{ 
                margin: "0.25rem 0 0", 
                fontFamily: "'IBM Plex Mono', monospace", 
                fontSize: "0.8125rem",
                color: "var(--text-primary)"
              }}>
                {record.transcriptHash}
              </p>
            </div>
            
            <div>
              <strong style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 500 }}>Document Owner:</strong>
              <code className="wallet-address" style={{ 
                display: "inline-block", 
                marginTop: "0.25rem",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem"
              }}>
                {record.student}
              </code>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <strong style={{ 
              fontSize: "0.9375rem", 
              fontWeight: 600, 
              color: "var(--text-primary)",
              marginBottom: "0.75rem", 
              display: "block" 
            }}>
              Authorized Access Keys
            </strong>
            {Object.keys(record.encryptedKeys).length === 0 ? (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9375rem", margin: 0 }}>
                No access grants recorded yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {Object.entries(record.encryptedKeys).map(([address, key]) => (
                  <div 
                    key={address}
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.875rem",
                      padding: "1rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ marginBottom: "0.75rem" }}>
                          <code className="wallet-address" style={{ 
                            fontSize: "0.8125rem", 
                            padding: "0.375rem 0.75rem",
                            fontWeight: 500
                          }}>
                            {address}
                          </code>
                        </div>
                        <div style={{ 
                          fontFamily: "'IBM Plex Mono', monospace", 
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          wordBreak: "break-all",
                          lineHeight: 1.5,
                          opacity: 0.9
                        }}>
                          {key.length > 120 ? `${key.substring(0, 120)}...` : key}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(key, address)}
                        className="button-ghost"
                        style={{ 
                          padding: "0.5rem 0.875rem",
                          fontSize: "0.8125rem",
                          minWidth: "auto",
                          flexShrink: 0,
                          height: "fit-content"
                        }}
                        title="Copy encrypted key"
                      >
                        {copiedKey === address ? (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <span>✓</span> Copied
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <span>📋</span> Copy Key
                          </span>
                        )}
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