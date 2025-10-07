import { mkdirSync } from "fs";
import { dirname } from "path";

import RocksDB from "rocksdb";

export interface TranscriptRecord {
  transcriptId: string;
  student: string;
  cid: string;
  transcriptHash: string;
  issuedAt: number;
  encryptedKeys: Record<string, string>;
}

export class TranscriptStore {
  private db: RocksDB;

  constructor(private readonly path: string) {
    mkdirSync(dirname(this.path), { recursive: true });
    this.db = new RocksDB(this.path);
    this.db.open({ createIfMissing: true }, (error: Error | undefined | null) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to open RocksDB", error);
        throw error;
      }
    });
  }

  private transcriptKey(transcriptId: string) {
    return `transcript:${transcriptId}`;
  }

  private ownerIndexKey(owner: string, transcriptId: string) {
    return `owner:${owner.toLowerCase()}:${transcriptId}`;
  }

  private publicKeyKey(address: string) {
    return `pubkey:${address.toLowerCase()}`;
  }

  async put(record: TranscriptRecord): Promise<void> {
    await this.batch([
      { type: "put", key: this.transcriptKey(record.transcriptId), value: JSON.stringify(record) },
      { type: "put", key: this.ownerIndexKey(record.student, record.transcriptId), value: record.transcriptId }
    ]);
  }

  async updateEncryptedKey(transcriptId: string, accessor: string, encryptedKey: string): Promise<TranscriptRecord> {
    const existing = await this.get(transcriptId);
    const updated: TranscriptRecord = {
      ...existing,
      encryptedKeys: {
        ...existing.encryptedKeys,
        [accessor.toLowerCase()]: encryptedKey
      }
    };
    await this.put(updated);
    return updated;
  }

  async setEncryptionPublicKey(address: string, publicKey: string): Promise<void> {
    await this.batch([{ type: "put", key: this.publicKeyKey(address), value: publicKey }]);
  }

  async getEncryptionPublicKey(address: string): Promise<string | undefined> {
    return this.getRaw(this.publicKeyKey(address));
  }

  async get(transcriptId: string): Promise<TranscriptRecord> {
    const value = await this.getRaw(this.transcriptKey(transcriptId));
    if (!value) {
      throw new Error(`Transcript ${transcriptId} not found`);
    }
    return JSON.parse(value) as TranscriptRecord;
  }

  async listByOwner(owner: string): Promise<TranscriptRecord[]> {
    const records: TranscriptRecord[] = [];
    const prefix = this.ownerIndexKey(owner, "");

    await this.iterate(prefix, async (key) => {
      const transcriptId = key.split(":").pop();
      if (!transcriptId) return;
      const record = await this.get(transcriptId);
      records.push(record);
    });

    return records;
  }

  private getRaw(key: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(key, (error: Error | undefined | null, value?: Buffer) => {
        if (error) {
          if ((error as { notFound?: boolean }).notFound) {
            resolve(undefined);
            return;
          }
          reject(error);
          return;
        }
        resolve(value?.toString());
      });
    });
  }

  private batch(operations: { type: "put" | "del"; key: string; value?: string }[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.batch(operations, (error: Error | undefined | null) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  private iterate(prefix: string, onKey: (key: string) => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const iterator = this.db.iterator({
        gte: prefix,
        keys: true,
        values: false
      });

      const endIterator = (error?: unknown) => {
        iterator.end((endError?: Error | null) => {
          if (endError) {
            reject(endError);
            return;
          }
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      };

      const next = () => {
        iterator.next((error: Error | null, key?: Buffer) => {
          if (error) {
            endIterator(error);
            return;
          }

          if (!key) {
            endIterator();
            return;
          }

          const keyString = key.toString();
          if (!keyString.startsWith(prefix)) {
            endIterator();
            return;
          }

          Promise.resolve(onKey(keyString))
            .then(() => {
              next();
            })
            .catch((handlerError) => {
              endIterator(handlerError);
            });
        });
      };

      next();
    });
  }
}
