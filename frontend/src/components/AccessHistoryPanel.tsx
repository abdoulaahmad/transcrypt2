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
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="loading-spinner" />
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>Loading access history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="status-error">
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: "1.5rem", 
        fontSize: "1.25rem", 
        fontWeight: 600,
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem",
        color: "var(--text-primary)"
      }}>
        🔍 Emergency Access History
      </h3>

      {history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--accent)" }}>✓</div>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9375rem" }}>
            No emergency access recorded for your documents
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {history.map((access, idx) => (
            <div 
              key={idx} 
              className="card"
              style={{
                border: "1px solid var(--warning)",
                background: "rgba(245, 158, 11, 0.05)",
                borderRadius: "0.875rem",
                padding: "1.25rem",
                boxShadow: "0 2px 6px rgba(245, 158, 11, 0.1)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem" }}>🚨</span>
                  <strong style={{ fontSize: "0.9375rem", color: "var(--text-primary)", fontWeight: 600 }}>
                    Emergency Access Event
                  </strong>
                </div>
                <span className="badge badge-warning">
                  Regulatory Authority
                </span>
              </div>

              <div style={{ display: "grid", gap: "0.625rem", fontSize: "0.875rem" }}>
                <div>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Timestamp:</strong>{" "}
                  <span>{new Date(access.timestamp).toLocaleString()}</span>
                </div>
                
                <div>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Reason:</strong>{" "}
                  <span>{access.reason}</span>
                </div>

                {access.courtOrder && (
                  <div>
                    <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Legal Authorization:</strong>{" "}
                    <span>{access.courtOrder}</span>
                  </div>
                )}

                <div>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Document ID:</strong>{" "}
                  <code className="wallet-address">
                    {access.transcriptId.length > 20 
                      ? `${access.transcriptId.slice(0, 10)}...${access.transcriptId.slice(-8)}`
                      : access.transcriptId
                    }
                  </code>
                </div>

                <div>
                  <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Accessed By:</strong>{" "}
                  <code className="wallet-address">
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