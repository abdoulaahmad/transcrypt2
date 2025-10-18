"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";
import {
  base64ToUint8Array,
  decryptCipherPayload,
  decryptWrappedKey,
  uint8ArrayToBase64
} from "@/lib/encryptionClient";

interface RetrieveApiResponse {
  transcriptId: string;
  cid: string;
  studentAddress: string;
  transcriptHash: string;
  cipherPayload: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  wrappedKey: string;
}

interface RetrieveResponse {
  transcriptId: string;
  cid: string;
  studentAddress: string;
  transcriptHash: string;
  decryptedBase64: string;
}

interface TranscriptRetrieveCardProps {
  heading: string;
  description: string;
  ctaLabel?: string;
  defaultAccessorAddress?: string;
  defaultTranscriptId?: string;
  isSubmitEnabled?: boolean;
  disabledMessage?: string;
}

export function TranscriptRetrieveCard({
  heading,
  description,
  ctaLabel = "Decrypt with wallet",
  defaultAccessorAddress,
  defaultTranscriptId,
  isSubmitEnabled = true,
  disabledMessage
}: TranscriptRetrieveCardProps) {
  const [formState, setFormState] = useState({
    transcriptId: "",
    accessorAddress: ""
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (defaultAccessorAddress) {
      setFormState((prev) => (prev.accessorAddress ? prev : { ...prev, accessorAddress: defaultAccessorAddress }));
    }
  }, [defaultAccessorAddress]);

  useEffect(() => {
    if (defaultTranscriptId) {
      setFormState((prev) => (prev.transcriptId ? prev : { ...prev, transcriptId: defaultTranscriptId }));
    }
  }, [defaultTranscriptId]);

  const mutation = useMutation<RetrieveResponse, Error, typeof formState>({
    mutationFn: async (payload) => {
      const transcriptId = payload.transcriptId.trim();
      if (!transcriptId) {
        throw new Error("Document ID is required to retrieve the encrypted payload.");
      }

      const accessorAddress = payload.accessorAddress.trim();
      if (!accessorAddress) {
        throw new Error("Provide an accessor wallet address before decrypting.");
      }

      const response = await apiClient.post<RetrieveApiResponse>(
        `/transcripts/${transcriptId}/retrieve`,
        {
          accessorAddress
        }
      );

      const apiResult = response.data;

      const aesKeyBytes = await decryptWrappedKey(apiResult.wrappedKey, accessorAddress);
      const decryptedBytes = await decryptCipherPayload(apiResult.cipherPayload, aesKeyBytes);
      const decryptedBase64 = uint8ArrayToBase64(decryptedBytes);

      return {
        transcriptId: apiResult.transcriptId,
        cid: apiResult.cid,
        studentAddress: apiResult.studentAddress,
        transcriptHash: apiResult.transcriptHash,
        decryptedBase64
      };
    }
  });

  const normalizedPlaintext = useMemo(() => {
    const payload = mutation.data?.decryptedBase64;
    if (!payload) return "";
    return payload.replace(/\s+/g, "");
  }, [mutation.data?.decryptedBase64]);

  const isPdfPayload = useMemo(() => {
    return normalizedPlaintext.startsWith("JVBERi0");
  }, [normalizedPlaintext]);

  const decodedTranscript = useMemo(() => {
    if (!normalizedPlaintext || isPdfPayload) return null;
    try {
      const bytes = base64ToUint8Array(normalizedPlaintext);
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [normalizedPlaintext, isPdfPayload]);

  useEffect(() => {
    if (!isPdfPayload || !normalizedPlaintext) {
      setPdfUrl(null);
      return;
    }

    try {
      const bytes = base64ToUint8Array(normalizedPlaintext);
      const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to prepare PDF preview", error);
      setPdfUrl(null);
    }
  }, [isPdfPayload, normalizedPlaintext]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `document-${mutation.data?.transcriptId ?? "secure"}.pdf`;
    link.click();
  }, [mutation.data?.transcriptId, pdfUrl]);

  const showBinaryWarning = Boolean(normalizedPlaintext) && !decodedTranscript && !isPdfPayload;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(formState);
  };

  const submitDisabled = mutation.isPending || !isSubmitEnabled;
  const submitLabel = mutation.isPending ? (
    <>
      <span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
      <span style={{ marginLeft: '0.5rem' }}>Decrypting…</span>
    </>
  ) : (
    ctaLabel
  );

  return (
    <div className="card" style={{ padding: '1.5rem', borderRadius: '1.25rem' }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)',
        marginBottom: '0.5rem'
      }}>
        {heading}
      </h2>
      <p style={{ 
        fontSize: '0.875rem', 
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem'
      }}>
        {description}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Document ID
          </label>
          <input
            required
            value={formState.transcriptId}
            onChange={(e) => setFormState(prev => ({ ...prev, transcriptId: e.target.value }))}
            placeholder="0x…"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1.5px solid var(--border)',
              fontSize: '0.9375rem',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            Accessor wallet address
          </label>
          <input
            required
            value={formState.accessorAddress}
            onChange={(e) => setFormState(prev => ({ ...prev, accessorAddress: e.target.value }))}
            placeholder="0x…"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1.5px solid var(--border)',
              fontSize: '0.9375rem',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <button
          type="submit"
          className="button"
          disabled={submitDisabled}
          style={{ 
            padding: '0.75rem 1.5rem',
            justifyContent: 'center',
            opacity: submitDisabled ? 0.8 : 1
          }}
        >
          {submitLabel}
        </button>
      </form>

      {!isSubmitEnabled && disabledMessage && (
        <p style={{ 
          fontSize: '0.8125rem', 
          color: 'var(--text-secondary)',
          marginTop: '0.75rem'
        }}>
          {disabledMessage}
        </p>
      )}

      {mutation.data && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ 
            padding: '1rem',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '0.75rem'
          }}>
            <p><span style={{ fontWeight: 600 }}>CID:</span> {mutation.data.cid}</p>
            <p><span style={{ fontWeight: 600 }}>Document owner:</span> {mutation.data.studentAddress}</p>
            <p className="font-mono" style={{ 
              fontSize: '0.8125rem', 
              color: 'var(--text-secondary)',
              marginTop: '0.25rem'
            }}>
              Hash: {mutation.data.transcriptHash}
            </p>
          </div>

          {decodedTranscript && (
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                Decrypted content
              </label>
              <textarea
                readOnly
                value={decodedTranscript}
                className="font-mono"
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.875rem',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontFamily: "'IBM Plex Mono', monospace"
                }}
              />
            </div>
          )}

          {isPdfPayload && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                Decrypted PDF (view only)
              </label>
              {pdfUrl ? (
                <iframe
                  title="Decrypted document preview"
                  src={pdfUrl}
                  style={{
                    height: '500px',
                    width: '100%',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)'
                  }}
                />
              ) : (
                <div className="status-warning" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
                  Unable to generate a PDF preview. You can still use the download button to export the file.
                </div>
              )}
            </div>
          )}

          {showBinaryWarning && (
            <div className="status-warning" style={{ padding: '1rem', borderRadius: '0.75rem' }}>
              The document payload appears to be binary. Download and decode the base64 data to view it locally.
            </div>
          )}

          <div>
            <label style={{ 
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Decrypted payload (base64)
            </label>
            <textarea
              readOnly
              value={mutation.data.decryptedBase64}
              className="font-mono"
              style={{
                width: '100%',
                minHeight: '180px',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1.5px solid var(--border)',
                fontSize: '0.875rem',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontFamily: "'IBM Plex Mono', monospace"
              }}
            />
          </div>
        </div>
      )}

      {mutation.error && (
        <div className="status-error" style={{ 
          marginTop: '1rem',
          padding: '1rem',
          borderRadius: '0.75rem'
        }}>
          {mutation.error.message}
        </div>
      )}
    </div>
  );
}