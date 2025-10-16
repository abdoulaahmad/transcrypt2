import { RegisterEncryptionKeyButton } from "../components/RegisterEncryptionKeyButton";
import { TranscriptList } from "../components/TranscriptList";
import { ViewTranscriptButton } from "../components/ViewTranscriptButton";
import { StudentGrantAccessForm } from "../components/StudentGrantAccessForm";
import { AccessHistoryPanel } from "../components/AccessHistoryPanel";
import { useAccount } from "wagmi";
import type { TranscriptRecord } from "../types/transcript";

interface StudentDashboardProps {
  transcripts: TranscriptRecord[];
  isLoading: boolean;
}

export function StudentDashboard({ transcripts, isLoading }: StudentDashboardProps) {
  const { address } = useAccount();

  return (
    <>
      <RegisterEncryptionKeyButton />
      {address && <AccessHistoryPanel studentAddress={address} />}
      <div className="card">
        <h2>Your Transcripts</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Decrypt and view transcripts that have been shared with your wallet.
        </p>
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="loading-spinner" />
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>Loading transcripts...</p>
          </div>
        ) : (
          <TranscriptList
            transcripts={transcripts}
            renderActions={(record) => (
              <ViewTranscriptButton transcriptId={record.transcriptId as `0x${string}`} />
            )}
          />
        )}
      </div>
    </>
  );
}
