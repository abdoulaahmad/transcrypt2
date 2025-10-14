export interface TranscriptRecord {
  transcriptId: string;
  student: string;
  cid: string;
  transcriptHash: string;
  issuedAt: number;
  encryptedKeys: Record<string, string>;
}
