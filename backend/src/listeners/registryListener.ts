import { ethers } from "ethers";

import abi from "../../../contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json" with { type: "json" };
import { config } from "../config.js";
import type { TranscriptStore } from "../store/TranscriptStore.js";

const logListenerError = (context: string, error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`[registryListener] ${context}`, error);
};

const wrapHandler = <T extends unknown[]>(name: string, handler: (...args: T) => Promise<void> | void) =>
  async (...args: T) => {
    try {
      // eslint-disable-next-line no-console
      console.log(`[registryListener] ${name} event`, ...args);
      await handler(...args);
    } catch (error) {
      logListenerError(`${name} handler failed`, error);
    }
  };

export function startRegistryListener(store: TranscriptStore) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(config.registryAddress, abi.abi, provider);

  provider.on("error", (error) => {
    logListenerError("provider error", error);
  });

  const handleTranscriptIssued = async (
    transcriptId: string,
    student: string,
    cid: string,
    transcriptHash: string,
    studentKeyCiphertext: string
  ) => {
    await store.put({
      transcriptId,
      student,
      cid,
      transcriptHash,
      issuedAt: Date.now(),
      encryptedKeys: studentKeyCiphertext
        ? { [student.toLowerCase()]: studentKeyCiphertext }
        : {}
    });
  };

  const handleAccessGranted = async (transcriptId: string, accessor: string, keyCiphertext: string) => {
    await store.updateEncryptedKey(transcriptId, accessor, keyCiphertext);
  };

  contract.on("TranscriptIssued", wrapHandler("TranscriptIssued", handleTranscriptIssued));
  contract.on("AccessGranted", wrapHandler("AccessGranted", handleAccessGranted));
  contract.on("EmergencyAccessGranted", wrapHandler("EmergencyAccessGranted", handleAccessGranted));

  return () => {
    contract.removeAllListeners();
    provider.destroy();
  };
}
