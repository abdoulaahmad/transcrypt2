import { encrypt } from "@metamask/eth-sig-util";

function isMethodNotSupported(error) {
    if (!error || typeof error !== "object")
        return false;
    const { code, message } = error;
    if (code === -32601 || code === -32603) {
        return true;
    }
    const normalizedMessage = (message ?? "").toLowerCase();
    return normalizedMessage.includes("method not found") ||
        normalizedMessage.includes("does not support") ||
        normalizedMessage.includes("does not exist") ||
        normalizedMessage.includes("is not available");
}
async function requestWalletEncryptionPublicKey(address) {
    try {
        return await window.ethereum.request({
            method: "eth_getEncryptionPublicKey",
            params: [address]
        });
    } catch (error) {
        if (isMethodNotSupported(error)) {
            return window.ethereum.request({
                method: "wallet_getEncryptionPublicKey",
                params: [address]
            });
        }
        throw error;
    }
}
async function walletDecrypt(encryptedData, walletAddress) {
    try {
        return await window.ethereum.request({
            method: "eth_decrypt",
            params: [encryptedData, walletAddress]
        });
    } catch (error) {
        if (isMethodNotSupported(error)) {
            return window.ethereum.request({
                method: "wallet_decrypt",
                params: [encryptedData, walletAddress]
            });
        }
        throw error;
    }
}
async function exportKey(key) {
    const buffer = await crypto.subtle.exportKey("raw", key);
    return buffer;
}

function toBase64(data) {
    const array = data instanceof Uint8Array ? data : new Uint8Array(data);
    let binary = "";
    array.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

function fromBase64(base64) {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        array[i] = binary.charCodeAt(i);
    }
    return array;
}
export async function generateAesKey() {
    return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}
export async function encryptTranscriptFile(file, walletAddress, options = {}) {
    const aesKey = await generateAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, fileBuffer);
    const exportedKey = await exportKey(aesKey);
    const publicKey = options.publicKey ?? (await requestWalletEncryptionPublicKey(walletAddress));
    const encryptedKey = encrypt({
        publicKey,
        data: toBase64(exportedKey),
        version: "x25519-xsalsa20-poly1305"
    });
    return {
        package: {
            aesKey: JSON.stringify(encryptedKey),
            iv: toBase64(iv),
            ciphertext: toBase64(encrypted),
            mimeType: file.type || "application/pdf"
        },
        exportedKey: toBase64(exportedKey)
    };
}
export async function decryptAesKey(encryptedData, walletAddress) {
    const decrypted = await walletDecrypt(encryptedData, walletAddress);
    const raw = fromBase64(decrypted);
    const normalized = Uint8Array.from(raw);
    return normalized.buffer;
}
export async function decryptTranscript(ciphertextBase64, ivBase64, rawKey) {
    const key = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
    const ciphertextBytes = Uint8Array.from(fromBase64(ciphertextBase64));
    const ivBytes = Uint8Array.from(fromBase64(ivBase64));
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, ciphertextBytes);
}
export function wrapAesKeyForPublicKey(rawKey, publicKey) {
    const encryptedKey = encrypt({
        publicKey,
        data: toBase64(rawKey),
        version: "x25519-xsalsa20-poly1305"
    });
    return JSON.stringify(encryptedKey);
}
export function bufferToBlob(buffer, mimeType) {
    return new Blob([buffer], { type: mimeType });
}
export { requestWalletEncryptionPublicKey };