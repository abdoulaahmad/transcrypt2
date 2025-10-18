import { TranscriptList } from "../components/TranscriptList";
import { UploadTranscriptForm } from "../components/UploadTranscriptForm";
import type { TranscriptRecord } from "../types/transcript";

interface UniversityDashboardProps {
  owner: string;
  transcripts: TranscriptRecord[];
  isLoading: boolean;
}

export function UniversityDashboard({ owner, transcripts, isLoading }: UniversityDashboardProps) {
  return (
    <>
      <UploadTranscriptForm />
      <div className="card">
        <h2>Issued Documents</h2>
        <p>Share decryption keys with external parties after issuing a secure document.</p>
        {isLoading ? (
          <p>Loading documents...</p>
        ) : (
          <TranscriptList
            transcripts={transcripts}
            renderActions={() => null}
          />
        )}
      </div>
    </>
  );
}