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
      <h2>Compliance Workspace</h2>
      <p>Audit issued documents and share decryption keys with authorized parties on demand.</p>
      {isLoading ? (
        <p>Loading documents...</p>
      ) : (
        <TranscriptList
          transcripts={transcripts}
          renderActions={() => null}
        />
      )}
    </div>
  );
}