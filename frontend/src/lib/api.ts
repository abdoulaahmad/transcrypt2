import type { TranscriptRecord } from "../types/transcript";

const backendBase = import.meta.env.VITE_BACKEND_URL ?? "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${backendBase}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  async uploadTranscript(input: {
    transcriptId: string;
    student: string;
    cid: string;
    transcriptHash: string;
    encryptedKeys?: Record<string, string>;
  }) {
    return request<{ status: string }>("/transcripts/upload", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  async uploadEncryptedFile(input: {
    transcriptId: string;
    encryptedData: string;
    iv: string;
    mimeType: string;
  }) {
    return request<{ status: string }>("/files", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  async grantAccess(transcriptId: string, input: { accessor: string; encryptedKey: string }) {
    return request<{ status: string; transcriptId: string; encryptedKeys: Record<string, string> }>(
      `/transcripts/${transcriptId}/grant`,
      {
      method: "POST",
      body: JSON.stringify(input)
      }
    );
  },

  async registerEncryptionKey(address: string, publicKey: string) {
    return request<{ status: string }>("/encryption-keys", {
      method: "POST",
      body: JSON.stringify({ address, publicKey })
    });
  },

  async getEncryptionKey(address: string) {
    const response = await fetch(`${backendBase}/encryption-keys/${address}`);
    if (response.status === 404) {
      return undefined;
    }
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error ?? `Request failed with status ${response.status}`);
    }
    return (await response.json()) as { address: string; publicKey: string };
  },

  async listTranscripts(owner: string) {
    return request<TranscriptRecord[]>(`/transcripts?owner=${owner}`);
  },

  async listAccessibleTranscripts(accessor: string) {
    return request<TranscriptRecord[]>(`/transcripts?accessor=${accessor}`);
  },

  async viewTranscript(transcriptId: string) {
    return request<TranscriptRecord>(`/transcripts/${transcriptId}/view`);
  },

  async getEncryptedFile(transcriptId: string) {
    return request<{
      transcriptId: string;
      encryptedData: string;
      iv: string;
      mimeType: string;
      uploadedAt: number;
    }>(`/files/${transcriptId}`);
  },

  // Break Glass API Methods
  async executeBreakGlass(input: {
    transcriptId: string;
    ministryAddress: string;
    reason: string;
    courtOrder?: string;
  }) {
    return request<{ 
      status: string; 
      wrappedKey: string; 
      message: string;
      timestamp: number;
    }>("/break-glass/execute", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },

  async getBreakGlassHistory(transcriptId: string) {
    return request<{ 
      status: string;
      history: Array<{
        transcriptId: string;
        accessor: string;
        reason: string;
        courtOrder?: string;
        timestamp: number;
      }>;
      count: number;
    }>(`/break-glass/history/${transcriptId}`);
  },

  async getStudentBreakGlassHistory(studentAddress: string) {
    return request<{ 
      status: string;
      history: Array<{
        transcriptId: string;
        accessor: string;
        reason: string;
        courtOrder?: string;
        timestamp: number;
      }>;
      count: number;
    }>(`/break-glass/student/${studentAddress}`);
  }
};
