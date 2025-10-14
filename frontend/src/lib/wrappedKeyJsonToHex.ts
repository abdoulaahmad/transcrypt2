// Converts a MetaMask-style wrapped key JSON to a 0x... hex string for eth_decrypt
// Input: { version, nonce, ephemPublicKey, ciphertext }
// Output: 0x... (hex string)
export function wrappedKeyJsonToHex(wrappedKey: any): string {
  const nonce = Uint8Array.from(atob(wrappedKey.nonce), c => c.charCodeAt(0));
  const ephemPublicKey = Uint8Array.from(atob(wrappedKey.ephemPublicKey), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(wrappedKey.ciphertext), c => c.charCodeAt(0));
  const combined = new Uint8Array(ephemPublicKey.length + nonce.length + ciphertext.length);
  combined.set(ephemPublicKey, 0);
  combined.set(nonce, ephemPublicKey.length);
  combined.set(ciphertext, ephemPublicKey.length + nonce.length);
  return '0x' + Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
}
