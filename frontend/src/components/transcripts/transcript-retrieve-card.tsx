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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

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
        throw new Error("Transcript ID is required to retrieve the encrypted payload.");
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
    const norm = payload.replace(/\s+/g, "");
    // Debug: print first 40 chars of base64
    if (norm) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] Decrypted base64 (first 40):', norm.slice(0, 40));
    }
    return norm;
  }, [mutation.data?.decryptedBase64]);

  const isPdfPayload = useMemo(() => {
    const isPdf = normalizedPlaintext.startsWith("JVBERi0");
    // Debug: print PDF detection
    // eslint-disable-next-line no-console
    console.debug('[DEBUG] isPdfPayload:', isPdf, '| base64 head:', normalizedPlaintext.slice(0, 12));
    return isPdf;
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
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] Not a PDF or no plaintext, skipping preview.');
      return;
    }

    try {
      const bytes = base64ToUint8Array(normalizedPlaintext);
      const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      // eslint-disable-next-line no-console
      console.debug('[DEBUG] PDF preview URL created:', objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } catch (error) {
      console.error("Failed to prepare PDF preview", error);
      setPdfUrl(null);
    }
  }, [isPdfPayload, normalizedPlaintext]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `transcript-${mutation.data?.transcriptId ?? "document"}.pdf`;
    link.click();
  }, [mutation.data?.transcriptId, pdfUrl]);

  const showBinaryWarning = Boolean(normalizedPlaintext) && !decodedTranscript && !isPdfPayload;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(formState);
  };

  const submitDisabled = mutation.isPending || !isSubmitEnabled;
  const submitLabel = mutation.isPending ? "Decrypting…" : ctaLabel;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700">Transcript ID</label>
          <input
            required
            className={inputClass}
            value={formState.transcriptId}
            onChange={(event) => setFormState((prev) => ({ ...prev, transcriptId: event.target.value }))}
            placeholder="0x…"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Accessor wallet address</label>
          <input
            required
            className={inputClass}
            value={formState.accessorAddress}
            onChange={(event) => setFormState((prev) => ({ ...prev, accessorAddress: event.target.value }))}
            placeholder="0x…"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={submitDisabled}
        >
          {submitLabel}
        </button>
      </form>

      {!isSubmitEnabled && disabledMessage ? (
        <div className="mt-3 text-xs text-slate-500">{disabledMessage}</div>
      ) : null}

      {mutation.data && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold">CID:</span> {mutation.data.cid}
            </p>
            <p>
              <span className="font-semibold">Student address:</span> {mutation.data.studentAddress}
            </p>
            <p className="font-mono text-xs text-slate-500">Hash: {mutation.data.transcriptHash}</p>
          </div>

          {decodedTranscript ? (
            <div>
              <label className="text-sm font-medium text-slate-700">Decrypted content</label>
              <textarea readOnly className={`${inputClass} min-h-[200px] font-mono`} value={decodedTranscript} />
            </div>
          ) : null}

          {isPdfPayload ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <label className="text-sm font-medium text-slate-700">Decrypted PDF (view only)</label>
              </div>
              {pdfUrl ? (
                <iframe
                  title="Decrypted transcript preview"
                  src={pdfUrl}
                  className="h-[500px] w-full rounded-lg border border-slate-200"
                />
              ) : (
                <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
                  Unable to generate a PDF preview. You can still use the download button to export the file.
                </div>
              )}
            </div>
          ) : null}

          {showBinaryWarning ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
              The transcript payload appears to be binary. Download and decode the base64 data to view it locally.
            </div>
          ) : null}

          <div>
            <label className="text-sm font-medium text-slate-700">Decrypted payload (base64)</label>
            <textarea
              readOnly
              className={`${inputClass} min-h-[180px] font-mono`}
              value={mutation.data.decryptedBase64}
            />
          </div>
        </div>
      )}

      {mutation.error && (
        <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{mutation.error.message}</div>
      )}
    </section>
  );
}
