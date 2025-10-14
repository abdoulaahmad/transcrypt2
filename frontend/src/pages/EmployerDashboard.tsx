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
        <h2>Transcripts shared with your wallet</h2>
        <p>
          Students who have granted access will appear below. MetaMask will prompt you to decrypt the AES key whenever
          you open a transcript.
        </p>
        {isLoading ? (
          <p>Loading shared transcripts...</p>
        ) : transcripts.length === 0 ? (
          <p>No transcripts have been shared with this wallet yet. Ask the student to grant you access.</p>
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
