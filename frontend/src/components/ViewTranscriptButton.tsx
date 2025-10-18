import { useState, useEffect } from "react";
import { hexToString, isHex } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { api } from "../lib/api";
import { registryAbi, registryAddress } from "../lib/contract";
import { decryptAesKey, decryptTranscript, bufferToBlob } from "../lib/crypto";

type HexBytes = `0x${string}`;

interface ViewTranscriptButtonProps {
  transcriptId: HexBytes;
}

export function ViewTranscriptButton({ transcriptId }: ViewTranscriptButtonProps) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [downloadUrl, previewUrl]);

  const handleView = async () => {
    if (!address) {
      setError("Connect a wallet to view documents.");
      return;
    }
    if (!publicClient) {
      setError("Public client unavailable.");
      return;
    }

    // Cleanup previous URLs
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDownloadUrl(null);
    setPreviewUrl(null);
    setSuccessMessage(null);

    setLoading(true);
    setError(null);

    try {
      const walletAddress = address as HexBytes;
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Fetch document record
      const record = await api.viewTranscript(transcriptId);
      if (!record) {
        throw new Error("Document not found. Request access from the document owner.");
      }

      // Get encrypted key
      const encryptedKeys = record.encryptedKeys ?? {};
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
          const accessKeyHex = await publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "getAccessKey",
            args: [transcriptId, walletAddress]
          });

          if (accessKeyHex && accessKeyHex !== "0x") {
            encryptedKeyJson = hexToString(accessKeyHex);
          }
        } catch (chainError) {
          const message = (chainError as Error).message ?? "";
          if (message.includes("TranscriptNotFound")) {
            throw new Error("Document not found on-chain. Ask the issuer to reissue it.");
          }
          if (message.includes("User denied message decryption")) {
            throw new Error("MetaMask cancelled decryption. Approve the request to continue.");
          }
          throw new Error(`Failed to read access key: ${message}`);
        }
      }

      if (!encryptedKeyJson) {
        throw new Error("No access granted. Request document access from the owner.");
      }

      // Handle hex-encoded keys
      let keyToDecrypt = encryptedKeyJson;
      if (typeof encryptedKeyJson === 'string' && isHex(encryptedKeyJson)) {
        keyToDecrypt = hexToString(encryptedKeyJson);
      }

      // Decrypt AES key
      const rawKey = await decryptAesKey(keyToDecrypt, walletAddress);

      // Fetch and decrypt document
      const encryptedFile = await api.getEncryptedFile(transcriptId);
      const decryptedBuffer = await decryptTranscript(
        encryptedFile.encryptedData,
        encryptedFile.iv,
        rawKey
      );
      const blob = bufferToBlob(decryptedBuffer, encryptedFile.mimeType);
      const url = URL.createObjectURL(blob);

      // Try to open in new tab
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      
      if (popup) {
        // Success: opened in new tab
        setSuccessMessage("Document opened in a new tab.");
        URL.revokeObjectURL(url); // Popup owns the URL
      } else {
        // Fallback: enable download + preview
        setDownloadUrl(url);
        setPreviewUrl(url);
        setSuccessMessage("Popup blocked. Use download or preview below.");
      }
    } catch (viewError) {
      setError((viewError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button 
        className="button" 
        disabled={loading} 
        onClick={handleView} 
        type="button"
        style={{ 
          padding: "0.75rem 1.25rem",
          fontSize: "0.9375rem",
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {loading ? (
          <>
            <span className="loading-spinner" style={{ width: '1rem', height: '1rem' }} />
            Decrypting Document...
          </>
        ) : (
          "View Secure Document"
        )}
      </button>

      {successMessage && (
        <div className="status-success" style={{ 
          marginTop: "0.75rem", 
          padding: "0.75rem", 
          borderRadius: "0.75rem"
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>{successMessage}</p>
        </div>
      )}

      {previewUrl && (
        <div style={{ marginTop: "1rem" }}>
          <h4 style={{ 
            fontSize: "0.875rem", 
            fontWeight: 600, 
            color: "var(--text-primary)",
            marginBottom: "0.5rem"
          }}>
            Document Preview
          </h4>
          <div style={{ 
            border: "1px solid var(--border)", 
            borderRadius: "0.75rem",
            overflow: "hidden"
          }}>
            <iframe
              src={previewUrl}
              title="Document preview"
              style={{ 
                width: "100%", 
                height: "500px",
                border: "none",
                backgroundColor: "var(--surface)"
              }}
            />
          </div>
        </div>
      )}

      {downloadUrl && (
        <a 
          href={downloadUrl} 
          download={`${transcriptId}.pdf`} 
          className="button button-secondary"
          style={{ 
            display: "inline-block", 
            marginTop: "0.75rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem"
          }}
        >
          📥 Download Document
        </a>
      )}

      {error && (
        <div className="status-error" style={{ 
          marginTop: "0.75rem", 
          padding: "0.75rem", 
          borderRadius: "0.75rem"
        }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>{error}</p>
        </div>
      )}
    </div>
  );
}