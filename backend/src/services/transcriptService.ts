import { blockchainService, config, pinataService } from "../container";

import { unpackCipherPayload } from "./cryptoService";

export interface TranscriptRetrievalInput {
  transcriptId: string;
  accessorAddress: string;
  network?: typeof config.defaultNetwork;
}

export interface TranscriptRetrievalResult {
  studentAddress: string;
  cid: string;
  transcriptHash: string;
  cipherPayload: {
    ciphertext: string;
    iv: string;
    authTag: string;
  };
  wrappedKey: string;
}

async function fetchWrappedKey(transcriptId: string, accessor: string, network = config.defaultNetwork): Promise<string> {
  const keyCiphertext = await blockchainService.getAccessKey(transcriptId, accessor, network);
  if (!keyCiphertext || keyCiphertext === "0x") {
    throw new Error("Access key not available for accessor");
  }
  return keyCiphertext;
}

export async function retrieveTranscript(input: TranscriptRetrievalInput): Promise<TranscriptRetrievalResult> {
  const { transcriptId, accessorAddress, network = config.defaultNetwork } = input;

  const meta = await blockchainService.getTranscriptMeta(transcriptId, network);
  if (!meta.cid) {
    throw new Error("Transcript metadata not found");
  }

  const pinataData = await pinataService.fetch(meta.cid);
  const packed = unpackCipherPayload(pinataData.data);
  let wrappedKey = await fetchWrappedKey(transcriptId, accessorAddress, network);
  // If the wrappedKey is a JSON string, convert to 0x-prefixed hex string for MetaMask
  try {
    if (wrappedKey && wrappedKey.startsWith('{')) {
      const parsed = JSON.parse(wrappedKey);
      const { wrappedKeyJsonToHex } = await import('../utils/wrappedKeyJsonToHex');
      wrappedKey = wrappedKeyJsonToHex(parsed);
    }
  } catch (e) {
    console.error('[retrieveTranscript] Failed to convert wrappedKey to hex:', e);
  }
  return {
    studentAddress: meta.student,
    cid: meta.cid,
    transcriptHash: meta.transcriptHash,
    cipherPayload: {
      ciphertext: packed.ciphertext.toString("base64"),
      iv: packed.iv.toString("base64"),
      authTag: packed.authTag.toString("base64")
    },
    wrappedKey
  };
}
