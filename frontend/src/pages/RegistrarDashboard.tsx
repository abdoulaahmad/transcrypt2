import { GrantAccessForm } from "../components/GrantAccessForm";
import { TranscriptList } from "../components/TranscriptList";
import type { TranscriptRecord } from "../types/transcript";

interface RegistrarDashboardProps {
  owner: string;
  transcripts: TranscriptRecord[];
  isLoading: boolean;
}

export function RegistrarDashboard({ owner, transcripts, isLoading }: RegistrarDashboardProps) {
  return (
    <div className="card">
      <h2>Registrar workspace</h2>
      <p>Audit issued transcripts and share keys with external reviewers on demand.</p>
      {isLoading ? (
        <p>Loading transcripts...</p>
      ) : (
        <TranscriptList
          transcripts={transcripts}
          renderActions={(record) => (
            <GrantAccessForm className="grant-form" owner={owner} transcriptId={record.transcriptId} />
          )}
        />
      )}
    </div>
  );
}
