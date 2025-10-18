import { TranscriptList } from "../components/TranscriptList";
import { BreakGlassPanel } from "../components/BreakGlassPanel";
import { RegisterEncryptionKeyButton } from "../components/RegisterEncryptionKeyButton";
import type { TranscriptRecord } from "../types/transcript";

interface MinistryDashboardProps {
  transcripts: TranscriptRecord[];
  isLoading: boolean;
}

export function MinistryDashboard({ transcripts, isLoading }: MinistryDashboardProps) {
  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <RegisterEncryptionKeyButton />
      </div>
      <BreakGlassPanel />
      <div className="card">
        <h2>Regulatory Oversight</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Review sensitive documents and execute emergency decryption when legally authorized. All break-glass actions are immutably logged on-chain for audit and transparency.
        </p>
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="loading-spinner" />
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>Loading documents...</p>
          </div>
        ) : (
          <TranscriptList transcripts={transcripts} />
        )}
      </div>
    </>
  );
}