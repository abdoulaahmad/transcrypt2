// Converts a MetaMask-style wrapped key JSON to a 0x... hex string for eth_decrypt
// Input: {
//   version: 'x25519-xsalsa20-poly1305',
//   nonce: base64,
//   ephemPublicKey: base64,
//   ciphertext: base64
// }
// Output: 0x... (hex string)

function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  let totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  let result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export function wrappedKeyJsonToHex(wrappedKey: any): string {
  // Decode base64 fields
  const nonce = Buffer.from(wrappedKey.nonce, 'base64');
  const ephemPublicKey = Buffer.from(wrappedKey.ephemPublicKey, 'base64');
  const ciphertext = Buffer.from(wrappedKey.ciphertext, 'base64');
  // Debug logs for troubleshooting
  console.log('[wrappedKeyJsonToHex] Decoded field lengths:', {
    ephemPublicKey: ephemPublicKey.length,
    nonce: nonce.length,
    ciphertext: ciphertext.length
  });
  console.log('[wrappedKeyJsonToHex] Decoded values:', {
    ephemPublicKey: ephemPublicKey.toString('hex'),
    nonce: nonce.toString('hex'),
    ciphertext: ciphertext.toString('hex')
  });
  // Concatenate: [ephemPublicKey | nonce | ciphertext]
  const combined = concatUint8Arrays([
    ephemPublicKey,
    nonce,
    ciphertext
  ]);
  return '0x' + Buffer.from(combined).toString('hex');
}
