import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface BreakGlassAccess {
  transcriptId: string;
  accessor: string;
  reason: string;
  courtOrder?: string;
  timestamp: number;
}

interface AccessHistoryPanelProps {
  studentAddress: string;
}

export function AccessHistoryPanel({ studentAddress }: AccessHistoryPanelProps) {
  const [history, setHistory] = useState<BreakGlassAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentAddress) {
      loadHistory();
    }
  }, [studentAddress]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStudentBreakGlassHistory(studentAddress);
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load access history:", err);
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="loading-spinner" />
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>Loading access history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: "2rem" }}>
        <div className="status-message status-error">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        🔍 Emergency Access History
      </h3>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            No emergency access recorded for your transcripts
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {history.map((access, idx) => (
            <div 
              key={idx} 
              style={{
                border: "2px solid var(--warning)",
                background: "rgba(245, 158, 11, 0.05)",
                borderRadius: "0.75rem",
                padding: "1.25rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>🚨</span>
                  <strong style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    Emergency Access Event
                  </strong>
                </div>
                <span 
                  className="badge badge-warning"
                  style={{ fontSize: "0.75rem" }}
                >
                  Ministry
                </span>
              </div>

              <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}>
                <div>
                  <strong style={{ color: "var(--text-secondary)" }}>Timestamp:</strong>{" "}
                  <span>{new Date(access.timestamp).toLocaleString()}</span>
                </div>
                
                <div>
                  <strong style={{ color: "var(--text-secondary)" }}>Reason:</strong>{" "}
                  <span>{access.reason}</span>
                </div>

                {access.courtOrder && (
                  <div>
                    <strong style={{ color: "var(--text-secondary)" }}>Court Order:</strong>{" "}
                    <span>{access.courtOrder}</span>
                  </div>
                )}

                <div>
                  <strong style={{ color: "var(--text-secondary)" }}>Transcript ID:</strong>{" "}
                  <code 
                    className="wallet-address" 
                    style={{ 
                      fontSize: "0.75rem", 
                      padding: "0.25rem 0.5rem",
                      display: "inline-block"
                    }}
                  >
                    {access.transcriptId.length > 20 
                      ? `${access.transcriptId.slice(0, 10)}...${access.transcriptId.slice(-8)}`
                      : access.transcriptId
                    }
                  </code>
                </div>

                <div>
                  <strong style={{ color: "var(--text-secondary)" }}>Accessed By:</strong>{" "}
                  <code 
                    className="wallet-address" 
                    style={{ 
                      fontSize: "0.75rem", 
                      padding: "0.25rem 0.5rem",
                      display: "inline-block"
                    }}
                  >
                    {access.accessor}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
