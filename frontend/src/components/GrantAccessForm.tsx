import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";

import { useTranscripts } from "../hooks/useTranscripts";
import { api } from "../lib/api";

interface GrantAccessFormProps {
  transcriptId: string;
  owner?: string;
  className?: string;
}

type FormState = {
  accessor: string;
  encryptedKey: string;
};

export function GrantAccessForm({ transcriptId, owner, className = "card" }: GrantAccessFormProps) {
  const { invalidate } = useTranscripts(owner);
  const [formState, setFormState] = useState<FormState>({ accessor: "", encryptedKey: "" });

  const mutation = useMutation({
    mutationFn: () =>
      api.grantAccess(transcriptId, {
        accessor: formState.accessor,
        encryptedKey: formState.encryptedKey
      }),
    onSuccess: () => {
      void invalidate();
      setFormState({ accessor: "", encryptedKey: "" });
    }
  });

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFormState((prev: FormState) => ({ ...prev, [field]: value }));
  };

  const disabled = mutation.isPending || !formState.accessor || !formState.encryptedKey;

  return (
    <div className={className}>
      <h3>Grant Transcript Access</h3>
      <label htmlFor={`accessor-${transcriptId}`}>Accessor Wallet</label>
      <input
        id={`accessor-${transcriptId}`}
        onChange={handleChange("accessor")}
        placeholder="Employer address"
        value={formState.accessor}
      />
      <label htmlFor={`key-${transcriptId}`}>Encrypted AES Key</label>
      <textarea
        id={`key-${transcriptId}`}
        onChange={handleChange("encryptedKey")}
        placeholder="Ciphertext"
        value={formState.encryptedKey}
      />
      <button className="button" disabled={disabled} onClick={() => mutation.mutate()} type="button">
        {mutation.isPending ? "Granting..." : "Grant access"}
      </button>
      {mutation.isSuccess && <p style={{ color: "#047857" }}>Access granted.</p>}
      {mutation.isError && <p style={{ color: "#dc2626" }}>{(mutation.error as Error).message}</p>}
    </div>
  );
}
