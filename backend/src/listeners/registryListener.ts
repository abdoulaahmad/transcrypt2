import { ethers } from "ethers";

import abi from "../../../contracts/artifacts/contracts/TranscriptRegistry.sol/TranscriptRegistry.json" with { type: "json" };
import { config } from "../config.js";
import type { TranscriptStore } from "../store/TranscriptStore.js";

export function startRegistryListener(store: TranscriptStore) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const contract = new ethers.Contract(config.registryAddress, abi.abi, provider);

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

  contract.on("TranscriptIssued", handleTranscriptIssued);
  contract.on("AccessGranted", handleAccessGranted);
  contract.on("EmergencyAccessGranted", handleAccessGranted);

  return () => {
    contract.removeAllListeners();
    provider.destroy();
  };
}
