import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

export interface EncryptedFilePayload {
  transcriptId: string;
  encryptedData: string;
  iv: string;
  mimeType: string;
  uploadedAt: number;
}

export class FileStore {
  constructor(private readonly basePath: string) {
    mkdirSync(this.basePath, { recursive: true });
  }

  private filePath(transcriptId: string) {
    return join(this.basePath, `${transcriptId}.json`);
  }

  save(payload: EncryptedFilePayload): void {
    writeFileSync(this.filePath(payload.transcriptId), JSON.stringify(payload, null, 2), "utf-8");
  }

  get(transcriptId: string): EncryptedFilePayload {
    const data = readFileSync(this.filePath(transcriptId), "utf-8");
    return JSON.parse(data) as EncryptedFilePayload;
  }

  exists(transcriptId: string): boolean {
    try {
      this.get(transcriptId);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
}
