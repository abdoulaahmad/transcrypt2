import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { api } from "../lib/api";
import type { TranscriptRecord } from "../types/transcript";

export function useTranscripts(owner?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<TranscriptRecord[]>({
    queryKey: ["transcripts", owner?.toLowerCase()],
    queryFn: () => api.listTranscripts(owner!),
    enabled: Boolean(owner)
  });

  const invalidate = useCallback(() => {
    if (!owner) return;
    void queryClient.invalidateQueries({ queryKey: ["transcripts", owner.toLowerCase()] });
  }, [owner, queryClient]);

  return { ...query, transcripts: query.data ?? [], invalidate };
}

export function useAccessibleTranscripts(accessor?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<TranscriptRecord[]>({
    queryKey: ["transcripts", "accessor", accessor?.toLowerCase()],
    queryFn: () => api.listAccessibleTranscripts(accessor!),
    enabled: Boolean(accessor)
  });

  const invalidate = useCallback(() => {
    if (!accessor) return;
    void queryClient.invalidateQueries({ queryKey: ["transcripts", "accessor", accessor.toLowerCase()] });
  }, [accessor, queryClient]);

  return { ...query, transcripts: query.data ?? [], invalidate };
}
