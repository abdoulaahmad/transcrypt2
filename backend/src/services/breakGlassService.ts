import { TranscriptStore } from '../store/TranscriptStore';
import { ethers } from 'ethers';
import { wrappedKeyJsonToHex } from '../utils/wrappedKeyJsonToHex';

interface BreakGlassAccess {
  transcriptId: string;
  accessor: string;
  reason: string;
  courtOrder?: string;
  timestamp: number;
}

export class BreakGlassService {
  constructor(
    private store: TranscriptStore,
    private provider: ethers.JsonRpcProvider,
    private contractAddress: string,
    private ministryAddress: string
  ) {}

  /**
   * Store ministry key in encrypted off-chain database
   */
  async storeMinistryKey(transcriptId: string, wrappedKey: string): Promise<void> {
    const key = `breakglass:${transcriptId}`;
    // Print db path and instance identity
    // @ts-ignore
    const dbPath = this.store.path;
    // @ts-ignore
    const dbInstance = this.store.db;
    console.log('[BreakGlass][DEBUG][store] RocksDB path:', dbPath, 'db instance:', dbInstance);

    let hexWrappedKey = wrappedKey;
    try {
      if (typeof wrappedKey === 'string' && wrappedKey.trim().startsWith('{')) {
        // If it's a JSON string, parse and convert to hex
        const parsed = JSON.parse(wrappedKey);
        hexWrappedKey = wrappedKeyJsonToHex(parsed);
        console.log('[BreakGlass][DEBUG] Converted ministry wrappedKey from JSON to hex:', hexWrappedKey);
      } else if (typeof wrappedKey === 'object') {
        // If it's already an object, convert to hex
        hexWrappedKey = wrappedKeyJsonToHex(wrappedKey);
        console.log('[BreakGlass][DEBUG] Converted ministry wrappedKey object to hex:', hexWrappedKey);
      }
    } catch (e) {
      console.error('[BreakGlass][ERROR] Failed to convert ministry wrappedKey to hex:', e);
    }

    const value = JSON.stringify({
      wrappedKey: hexWrappedKey,
      createdAt: Date.now(),
      accessor: 'ministry'
    });
    await new Promise<void>((resolve, reject) => {
      // @ts-ignore: access private db for break glass storage
      this.store.db.put(key, value, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log('[BreakGlass][DEBUG] Key written:', key, value);
    console.log(`[BreakGlass] Stored ministry key for transcript ${transcriptId}`);
  }

  /**
   * Retrieve ministry key from secure storage
   */
  async getMinistryKey(transcriptId: string): Promise<string | null> {
    const key = `breakglass:${transcriptId}`;
    // Print db path and instance identity
    // @ts-ignore
    const dbPath = this.store.path;
    // @ts-ignore
    const dbInstance = this.store.db;
    console.log('[BreakGlass][DEBUG][get] RocksDB path:', dbPath, 'db instance:', dbInstance);
    console.log('[BreakGlass][DEBUG] Retrieving ministry key with:', { transcriptId, key });
    try {
      // Use getRaw to fetch the breakglass key directly
      // @ts-ignore: getRaw is private
      const data = await this.store.getRaw(key);
      if (!data) {
        console.log('[BreakGlass][DEBUG] No data found for', key);
        return null;
      }
      const parsed = JSON.parse(data);
      return parsed.wrappedKey;
    } catch (error) {
      console.error(`[BreakGlass] Failed to retrieve ministry key:`, error);
      return null;
    }
  }

  /**
   * Ministry emergency access with audit logging
   */
  async executeBreakGlass(
    transcriptId: string,
    ministryAddress: string,
    reason: string,
    courtOrder?: string
  ): Promise<string> {
    // Verify caller is authorized ministry
    if (ministryAddress.toLowerCase() !== this.ministryAddress.toLowerCase()) {
      throw new Error('Unauthorized: Only ministry can execute break glass');
    }

    // Retrieve ministry's wrapped key from secure storage
    const ministryWrappedKey = await this.getMinistryKey(transcriptId);

    if (!ministryWrappedKey) {
      throw new Error('Ministry key not found for this transcript');
    }

    // Debug: print the raw ministryWrappedKey before conversion
    console.log('[BreakGlass][DEBUG] Raw ministryWrappedKey:', ministryWrappedKey);
    // Convert JSON-wrapped key to MetaMask-compatible hex string
    let hexKey: string;
    try {
      if (typeof ministryWrappedKey === 'string' && ministryWrappedKey.startsWith('0x')) {
        hexKey = ministryWrappedKey;
        console.log('[BreakGlass][DEBUG] Using ministryWrappedKey as hex:', hexKey);
      } else {
        const parsed = typeof ministryWrappedKey === 'string' ? JSON.parse(ministryWrappedKey) : ministryWrappedKey;
        hexKey = wrappedKeyJsonToHex(parsed);
        console.log('[BreakGlass][DEBUG] Converted ministryWrappedKey from JSON to hex:', hexKey);
      }
    } catch (e) {
      console.error('[BreakGlass] Failed to convert wrapped key to hex:', e);
      throw new Error('Failed to convert wrapped key to MetaMask format');
    }

    // Log on-chain for transparency
    await this.logBreakGlassAccess(transcriptId, ministryAddress, reason, courtOrder);

    // Notify student (email/event)
    await this.notifyStudent(transcriptId, reason, courtOrder);

    console.log(`[BreakGlass] Emergency access executed for transcript ${transcriptId}`);
    return hexKey;
  }

  /**
   * Log break glass access on-chain for audit trail
   */
  private async logBreakGlassAccess(
    transcriptId: string,
    accessor: string,
    reason: string,
    courtOrder?: string
  ): Promise<void> {
    try {
      // Get the contract ABI
      const abi = [
        'event BreakGlassAccess(bytes32 indexed transcriptId, address indexed accessor, string reason, string courtOrder, uint256 timestamp)',
        'function logEmergencyAccess(bytes32 transcriptId, address accessor, string memory reason, string memory courtOrder) external'
      ];

      const contract = new ethers.Contract(this.contractAddress, abi, this.provider);
      
      // This would require a signer, for now we'll just emit a log
      console.log(`[BreakGlass] Would log on-chain:`, {
        transcriptId,
        accessor,
        reason,
        courtOrder: courtOrder || '',
        timestamp: Date.now()
      });

      // Store in local database as well for quick queries
      const logKey = `breakglass:log:${transcriptId}:${Date.now()}`;
      // @ts-ignore: access private db for break glass log
      await new Promise<void>((resolve, reject) => {
        this.store.db.put(logKey, JSON.stringify({
          transcriptId,
          accessor,
          reason,
          courtOrder: courtOrder || '',
          timestamp: Date.now()
        }), (err: any) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } catch (error) {
      console.error('[BreakGlass] Failed to log access:', error);
      throw new Error('Failed to create audit log');
    }
  }

  /**
   * Get all break glass access logs for a transcript
   */
  async getAccessHistory(transcriptId: string): Promise<BreakGlassAccess[]> {
    const logs: BreakGlassAccess[] = [];
    const prefix = `breakglass:log:${transcriptId}:`;

    if (typeof this.store.iterator !== 'function') {
      console.warn('[BreakGlass] Access history not supported: store.iterator is not implemented. Returning empty history.');
      return logs;
    }

    try {
      // Iterate through all keys with this prefix
      const iterator = this.store.iterator({
        gte: prefix,
        lte: prefix + '\xFF'
      });

      for await (const [key, value] of iterator) {
        try {
          const log = JSON.parse(value.toString());
          logs.push(log);
        } catch (e) {
          console.error('[BreakGlass] Failed to parse log:', e);
        }
      }

      // Sort by timestamp descending
      logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('[BreakGlass] Failed to get access history:', error);
    }

    return logs;
  }

  /**
   * Student can view break glass access history
   */
  async getStudentAccessHistory(studentAddress: string): Promise<BreakGlassAccess[]> {
    const allLogs: BreakGlassAccess[] = [];

    try {
      // Get all transcripts for student
      const transcripts = await this.store.listByOwner(studentAddress.toLowerCase());

      // Get access history for each transcript
      for (const transcript of transcripts) {
        const history = await this.getAccessHistory(transcript.transcriptId);
        allLogs.push(...history);
      }

      // Sort by timestamp descending
      allLogs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('[BreakGlass] Failed to get student access history:', error);
    }

    return allLogs;
  }

  /**
   * Notify student of break glass access
   */
  private async notifyStudent(transcriptId: string, reason: string, courtOrder?: string): Promise<void> {
    try {
      const transcript = await this.store.get(transcriptId);
      if (!transcript) {
        console.warn(`[BreakGlass] Transcript ${transcriptId} not found for notification`);
        return;
      }

      const data = JSON.parse(transcript);
      
      console.log(`╔════════════════════════════════════════════════════════════╗`);
      console.log(`║ 🚨 BREAK GLASS NOTIFICATION                                ║`);
      console.log(`╠════════════════════════════════════════════════════════════╣`);
      console.log(`║ Transcript ID: ${transcriptId.slice(0, 20)}...             ║`);
      console.log(`║ Student: ${data.student?.slice(0, 42) || 'Unknown'}        ║`);
      console.log(`║ Reason: ${reason.slice(0, 48).padEnd(48)} ║`);
      if (courtOrder) {
        console.log(`║ Court Order: ${courtOrder.slice(0, 45).padEnd(45)} ║`);
      }
      console.log(`║ Timestamp: ${new Date().toISOString()}                     ║`);
      console.log(`╚════════════════════════════════════════════════════════════╝`);
      
      // TODO: Integrate with email/SMS service
      // await emailService.send({
      //   to: studentEmail,
      //   subject: '🚨 Emergency Access to Your Transcript',
      //   body: `Ministry has accessed your transcript.\n\nReason: ${reason}\n${courtOrder ? `Court Order: ${courtOrder}\n` : ''}\nTimestamp: ${new Date().toISOString()}`
      // });
    } catch (error) {
      console.error('[BreakGlass] Failed to notify student:', error);
    }
  }
}
