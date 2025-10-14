import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { hexToString } from "viem";
import { api } from "../lib/api";
import { registryAbi, registryAddress } from "../lib/contract";
import { decryptAesKey, decryptTranscript, bufferToBlob } from "../lib/crypto";
export function ViewTranscriptButton({ transcriptId }) {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => () => {
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
        }
    }, [downloadUrl]);
    const handleView = async() => {
        if (!address) {
            setError("Connect a wallet to view transcripts.");
            return;
        }
        if (!publicClient) {
            setError("Public client unavailable.");
            return;
        }
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const walletAddress = address;
            const normalizedAddress = walletAddress.toLowerCase();
            const record = await api.viewTranscript(transcriptId);
            const encryptedKeys = (record == null ? void 0 : record.encryptedKeys) ?? {};
            let encryptedKeyJson = encryptedKeys[normalizedAddress];
            if (!encryptedKeyJson) {
                for (const [key, value] of Object.entries(encryptedKeys)) {
                    if (key.toLowerCase() === normalizedAddress) {
                        encryptedKeyJson = value;
                        break;
                    }
                }
            }
            if (!encryptedKeyJson) {
                try {
                    const accessKeyHex = (await publicClient.readContract({
                        address: registryAddress,
                        abi: registryAbi,
                        functionName: "getAccessKey",
                        args: [transcriptId, walletAddress]
                    }));
                    if (accessKeyHex && accessKeyHex !== "0x") {
                        encryptedKeyJson = hexToString(accessKeyHex);
                    }
                } catch (chainError) {
                    const message = (chainError == null ? void 0 : chainError.message) ?? "";
                    if (message.includes("TranscriptNotFound")) {
                        throw new Error("Transcript not found on-chain. Ask the issuer to reissue it and try again.");
                    }
                    if (message.includes("User denied message decryption")) {
                        throw new Error("MetaMask cancelled decryption. Reopen the prompt and approve to continue.");
                    }
                    throw new Error(`Failed to read on-chain access key: ${message}`);
                }
            }
            if (!encryptedKeyJson) {
                throw new Error("No encrypted AES key found for this wallet. Request access from the student.");
            }
            let rawKey;
            try {
                rawKey = await decryptAesKey(encryptedKeyJson, walletAddress);
            } catch (decryptError) {
                const decryptMessage = (decryptError == null ? void 0 : decryptError.message) ?? "";
                if (decryptMessage.includes("User denied message decryption")) {
                    throw new Error("MetaMask cancelled decryption. Approve the request, or reset permissions in Settings → Advanced → Manage Encryption Keys.");
                }
                throw decryptError;
            }
            const encryptedFile = await api.getEncryptedFile(transcriptId);
            const decryptedBuffer = await decryptTranscript(encryptedFile.encryptedData, encryptedFile.iv, rawKey);
            const blob = bufferToBlob(decryptedBuffer, encryptedFile.mimeType);
            const url = URL.createObjectURL(blob);
            const popup = window.open(url, "_blank", "noopener,noreferrer");
            if (!popup) {
                setDownloadUrl(url);
                setSuccessMessage("Transcript decrypted. Your browser blocked the popup, but you can download it below.");
            } else {
                setSuccessMessage("Transcript decrypted in a new tab.");
                URL.revokeObjectURL(url);
            }
        } catch (viewError) {
            setError(viewError.message);
        } finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", {
        style: { marginTop: "1rem" },
        children: [
            _jsx("button", { className: "button", disabled: loading, onClick: handleView, type: "button", children: loading ? "Decrypting..." : "View transcript" }),
            successMessage && _jsx("p", { style: { color: "#047857", marginTop: "0.5rem" }, children: successMessage }),
            downloadUrl && _jsx("a", { href: downloadUrl, download: `${transcriptId}.pdf`, style: { display: "inline-block", marginTop: "0.5rem" }, children: "Download transcript" }),
            error && _jsx("p", { style: { color: "#dc2626", marginTop: "0.5rem" }, children: error })
        ]
    }));
}