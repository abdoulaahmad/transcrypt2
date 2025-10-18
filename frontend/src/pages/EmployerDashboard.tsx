import { RegisterEncryptionKeyButton } from "../components/RegisterEncryptionKeyButton";
import { TranscriptList } from "../components/TranscriptList";
import { ViewTranscriptButton } from "../components/ViewTranscriptButton";
import type { TranscriptRecord } from "../types/transcript";

interface EmployerDashboardProps {
  transcripts: TranscriptRecord[];
  isLoading: boolean;
}

export function EmployerDashboard({ transcripts, isLoading }: EmployerDashboardProps) {
  return (
    <>
      <RegisterEncryptionKeyButton />
      <div className="card">
        <h2>Documents Shared With Your Wallet</h2>
        <p>
          Document owners who have granted you access will appear below. MetaMask will prompt you to decrypt the AES key whenever you open a document.
        </p>
        {isLoading ? (
          <p>Loading shared documents...</p>
        ) : transcripts.length === 0 ? (
          <p>No documents have been shared with this wallet yet. Request access from the document owner.</p>
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