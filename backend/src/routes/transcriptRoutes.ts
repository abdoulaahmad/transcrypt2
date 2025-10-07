import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod";

import type { TranscriptStore } from "../store/TranscriptStore.js";

const uploadSchema = z.object({
  transcriptId: z.string().min(1),
  student: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  cid: z.string().min(1),
  transcriptHash: z.string().min(1),
  encryptedKeys: z.record(z.string(), z.string()).default({})
});

const grantSchema = z.object({
  accessor: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  encryptedKey: z.string().min(1)
});

export function buildTranscriptRouter(store: TranscriptStore): Router {
  const router = createRouter();

  router.post("/upload", async (req: Request, res: Response) => {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const record = {
      ...parsed.data,
      issuedAt: Date.now(),
      encryptedKeys: Object.fromEntries(
        Object.entries(parsed.data.encryptedKeys).map(([address, key]) => [address.toLowerCase(), key])
      )
    };

    await store.put(record);

    return res.status(201).json({ status: "ok" });
  });

  router.post("/:id/grant", async (req: Request, res: Response) => {
    const parsed = grantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const updated = await store.updateEncryptedKey(req.params.id, parsed.data.accessor, parsed.data.encryptedKey);
    return res.status(200).json({ status: "ok", encryptedKeys: updated.encryptedKeys });
  });

  router.get("/:id/view", async (req: Request, res: Response) => {
    try {
      const record = await store.get(req.params.id);
      return res.json(record);
    } catch (error) {
      return res.status(404).json({ error: (error as Error).message });
    }
  });

  router.get("/", async (req: Request, res: Response) => {
    const owner = req.query.owner as string | undefined;
    if (!owner) {
      return res.status(400).json({ error: "owner query param is required" });
    }

    const results = await store.listByOwner(owner);
    return res.json(results);
  });

  return router;
}
