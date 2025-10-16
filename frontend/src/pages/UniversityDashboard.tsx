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
        <h2>Issued transcripts</h2>
        <p>Share AES keys with employers and regulators after issuing a transcript.</p>
        {isLoading ? (
          <p>Loading transcripts...</p>
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
