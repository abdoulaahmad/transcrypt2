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
    <div className={className} style={{ padding: "1.5rem" }}>
      <h3 style={{ 
        fontSize: "1.25rem", 
        fontWeight: 600, 
        margin: "0 0 1.25rem 0",
        color: "var(--text-primary)"
      }}>
        Grant Document Access
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label 
            htmlFor={`accessor-${transcriptId}`} 
            style={{ 
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            Recipient Wallet Address
          </label>
          <input
            id={`accessor-${transcriptId}`}
            className="wallet-address"
            onChange={handleChange("accessor")}
            placeholder="0x..."
            value={formState.accessor}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              fontSize: "0.9375rem",
              background: "var(--surface)",
              color: "var(--text-primary)"
            }}
          />
        </div>
        
        <div>
          <label 
            htmlFor={`key-${transcriptId}`} 
            style={{ 
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "0.5rem"
            }}
          >
            Encrypted Document Key
          </label>
          <textarea
            id={`key-${transcriptId}`}
            onChange={handleChange("encryptedKey")}
            placeholder="Paste the encrypted AES key..."
            value={formState.encryptedKey}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1.5px solid var(--border)",
              fontSize: "0.875rem",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontFamily: "'IBM Plex Mono', monospace",
              resize: "vertical"
            }}
          />
        </div>
        
        <button 
          className="button" 
          disabled={disabled} 
          onClick={() => mutation.mutate()} 
          type="button"
          style={{ 
            padding: "0.75rem",
            fontSize: "0.9375rem",
            justifyContent: "center"
          }}
        >
          {mutation.isPending ? (
            <>
              <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
              <span style={{ marginLeft: '0.5rem' }}>Granting Access...</span>
            </>
          ) : (
            "Grant Secure Access"
          )}
        </button>
        
        {mutation.isSuccess && (
          <div className="status-success" style={{ padding: "0.75rem", borderRadius: "0.75rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>✓ Access granted successfully.</p>
          </div>
        )}
        
        {mutation.isError && (
          <div className="status-error" style={{ padding: "0.75rem", borderRadius: "0.75rem" }}>
            <p style={{ margin: 0, fontSize: "0.875rem" }}>
              {(mutation.error as Error).message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}