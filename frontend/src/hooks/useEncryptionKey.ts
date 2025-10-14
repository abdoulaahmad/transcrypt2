import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

import { api } from "../lib/api";

interface EncryptionKeyRecord {
  address: string;
  publicKey: string;
}

export function useEncryptionKey() {
  const { address } = useAccount();
  const normalized = address?.toLowerCase();

  const query = useQuery<EncryptionKeyRecord | undefined>({
    queryKey: ["encryption-key", normalized],
    queryFn: () => api.getEncryptionKey(normalized!),
    enabled: Boolean(normalized),
    staleTime: 5 * 60 * 1000
  });

  return {
    ...query,
    address: normalized,
    hasEncryptionKey: Boolean(query.data?.publicKey)
  };
}
