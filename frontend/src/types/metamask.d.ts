declare module "@metamask/eth-sig-util" {
  interface EncryptParams {
    publicKey: string;
    data: string;
    version: "x25519-xsalsa20-poly1305";
  }

  interface EncryptedData {
    version: string;
    ephemPublicKey: string;
    nonce: string;
    ciphertext: string;
  }

  export function encrypt(params: EncryptParams): EncryptedData;
}
