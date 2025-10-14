"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";

import { apiClient } from "@/lib/apiClient";
import { TranscriptRetrieveCard } from "@/components/transcripts/transcript-retrieve-card";
import { RoleMismatchCard, WalletRequiredCard } from "@/components/dashboard/role-gate-card";
import { useUserRoles } from "@/hooks/useUserRoles";
import { createSignaturePayload, hashUtf8 } from "@/lib/signing";
import { getEncryptionPublicKey } from "@/lib/encryptionClient";

interface IssueGrantResponse {
  transactionHash: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export default function StudentDashboard() {
  const { address, hasRole } = useUserRoles();
  const { signMessageAsync } = useSignMessage();
  const [grantForm, setGrantForm] = useState({
    transcriptId: "",
    accessorAddress: "",
    accessorEncryptionPublicKey: ""
  });

  const canActAsStudent = !!address && hasRole("student");

  const grantMutation = useMutation<IssueGrantResponse, Error, typeof grantForm>({
    mutationFn: async (payload) => {
      if (!address) {
        throw new Error("Connect your wallet before granting access.");
      }
      if (!hasRole("student")) {
        throw new Error("Only the student wallet can grant access.");
      }
      const accessorEncryptionKey = payload.accessorEncryptionPublicKey.trim();
      if (!accessorEncryptionKey) {
        throw new Error("Provide the accessor's MetaMask encryption public key before granting access.");
      }
      // 1. Retrieve transcript meta to get wrappedKey for student
      const transcriptResp = await apiClient.post<any>(
        `/transcripts/${payload.transcriptId}/retrieve`,
        { accessorAddress: address }
      );
      const wrappedKeyHex = transcriptResp.data.wrappedKey;
      // 2. Decrypt AES key with MetaMask
      const { decryptWrappedKey } = await import("@/lib/encryptionClient");
      const aesKeyBytes = await decryptWrappedKey(wrappedKeyHex, address);
      // 3. Wrap AES key for employer
      const { wrapAesKeyForPublicKey } = await import("@/lib/crypto");
      const wrappedForEmployer = wrapAesKeyForPublicKey(aesKeyBytes.buffer, accessorEncryptionKey);
      // 4. Hex-encode JSON string
      const hexWrapped =
        '0x' + Array.from(new TextEncoder().encode(wrappedForEmployer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // Debug logging
      console.log('[GRANT_ACCESS] Employer public key:', accessorEncryptionKey);
      console.log('[GRANT_ACCESS] Wrapped AES key (JSON):', wrappedForEmployer);
      console.log('[GRANT_ACCESS] Hex-encoded wrapped key:', hexWrapped);

      // 5. Sign and send to backend
      const { message, nonce } = createSignaturePayload({
        action: "GRANT_ACCESS",
        actorAddress: address,
        transcriptId: payload.transcriptId,
        targetAddress: payload.accessorAddress,
        extraHash: hashUtf8(accessorEncryptionKey)
      });
      const signature = await signMessageAsync({ message });
      const response = await apiClient.post<IssueGrantResponse>(
        `/transcripts/${payload.transcriptId}/grant`,
        {
          accessorAddress: payload.accessorAddress,
          encryptedKey: hexWrapped,
          walletAddress: address,
          signature,
          nonce
        }
      );
      return response.data;
    }
  });

  const encryptionKeyMutation = useMutation<string, Error, void>({
    mutationFn: async () => {
      if (!address) {
        throw new Error("Connect your wallet to request an encryption public key.");
      }

      return getEncryptionPublicKey(address);
    }
  });

  if (!address) {
    return <WalletRequiredCard title="Student Workspace" />;
  }

  if (!hasRole("student")) {
    return <RoleMismatchCard title="Student Workspace" expectedRole="student" />;
  }

  const handleGrant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    grantMutation.mutate(grantForm);
  };

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Student Workspace</h1>
        <p className="mt-2 text-sm text-slate-600">
          Retrieve your transcript or grant secure access to an employer by wrapping the AES key with MetaMask
          encryption keys so only wallets you approve can decrypt it.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Share your encryption public key</h2>
        <p className="mt-1 text-sm text-slate-600">
          Employers or universities need this value to encrypt AES keys to your wallet. MetaMask will prompt you once
          to expose it.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            onClick={() => encryptionKeyMutation.mutate()}
            disabled={!canActAsStudent || encryptionKeyMutation.isPending}
          >
            {encryptionKeyMutation.isPending ? "Requesting…" : "Request public key"}
          </button>

          {!canActAsStudent ? (
            <p className="text-xs text-slate-500">Connect your student wallet to expose the encryption key.</p>
          ) : null}
        </div>

        {encryptionKeyMutation.data ? (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-slate-700">Encryption public key</label>
            <textarea readOnly className={`${inputClass} min-h-[160px] font-mono`} value={encryptionKeyMutation.data} />
            <p className="text-xs text-slate-500">
              Share this exact string with the registrar or employer so they can encrypt transcript keys to your
              wallet.
            </p>
          </div>
        ) : null}

        {encryptionKeyMutation.error ? (
          <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
            {encryptionKeyMutation.error.message}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Grant Transcript Access</h2>
        <p className="mt-1 text-sm text-slate-600">
          Provide the transcript identifier and the accessor&apos;s wallet address. Paste the MetaMask encryption public key
          they shared with you so the AES key can be wrapped client-side.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleGrant}>
          <div>
            <label className="text-sm font-medium text-slate-700">Transcript ID</label>
            <input
              required
              className={inputClass}
              value={grantForm.transcriptId}
              onChange={(event) => setGrantForm((prev) => ({ ...prev, transcriptId: event.target.value }))}
              placeholder="0x…"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Accessor wallet address</label>
            <input
              required
              className={inputClass}
              value={grantForm.accessorAddress}
              onChange={(event) => setGrantForm((prev) => ({ ...prev, accessorAddress: event.target.value }))}
              placeholder="0x…"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Accessor encryption public key</label>
            <textarea
              required
              className={`${inputClass} min-h-[120px] font-mono`}
              value={grantForm.accessorEncryptionPublicKey}
              onChange={(event) =>
                setGrantForm((prev) => ({ ...prev, accessorEncryptionPublicKey: event.target.value }))
              }
              placeholder="Paste the accessor's MetaMask encryption public key"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={!canActAsStudent || grantMutation.isPending}
          >
            {grantMutation.isPending ? "Granting…" : canActAsStudent ? "Grant access" : "Connect wallet to grant"}
          </button>
          {!canActAsStudent ? (
            <p className="text-xs text-slate-500">Connect your wallet to authorize this transaction.</p>
          ) : null}
        </form>

        {grantMutation.data && (
          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            Access granted! Transaction hash: <span className="font-mono">{grantMutation.data.transactionHash}</span>
          </div>
        )}
        {grantMutation.error && (
          <div className="mt-4 rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
            {grantMutation.error.message}
          </div>
        )}
      </section>

      <TranscriptRetrieveCard
        heading="Retrieve Transcript"
        description="Provide your wallet address to unwrap the AES key with MetaMask and decrypt the transcript directly in your browser."
        ctaLabel="Decrypt with wallet"
        defaultAccessorAddress={address ?? ""}
        isSubmitEnabled={canActAsStudent}
        disabledMessage="Connect your wallet to decrypt your transcript."
      />
    </div>
  );
}
