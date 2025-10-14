import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod";

import type { TranscriptStore } from "../store/TranscriptStore.js";
import { breakGlassService } from "../index.js";

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

    try {
      // Enforce ministry key presence
      const ministryAddress = process.env.MINISTRY_ADDRESS ? process.env.MINISTRY_ADDRESS.toLowerCase() : undefined;
      if (!ministryAddress || !record.encryptedKeys[ministryAddress]) {
        return res.status(400).json({ error: 'Ministry key is required in encryptedKeys for break glass access.' });
      }

      await store.put(record);
      await breakGlassService.storeMinistryKey(record.transcriptId, record.encryptedKeys[ministryAddress]);
      console.log(`[BreakGlass] Ministry key stored for transcript ${record.transcriptId}`);
      return res.status(201).json({ status: "ok" });
    } catch (error) {
      console.error('[Transcript Upload Error]', error);
      return res.status(500).json({ error: (error as Error).message });
    }
  });

  router.post("/:id/grant", async (req: Request, res: Response) => {
    const parsed = grantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      const updated = await store.updateEncryptedKey(req.params.id, parsed.data.accessor, parsed.data.encryptedKey);
      return res.status(200).json({ status: "ok", transcriptId: updated.transcriptId, encryptedKeys: updated.encryptedKeys });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("not found")) {
        return res.status(404).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  });

  router.get("/", async (req: Request, res: Response) => {
    const owner = (req.query.owner as string | undefined)?.trim();
    const accessor = (req.query.accessor as string | undefined)?.trim();

    if ((owner && accessor) || (!owner && !accessor)) {
      return res.status(400).json({ error: "Provide either owner or accessor query param" });
    }

    try {
      if (owner) {
        const results = await store.listByOwner(owner);
        return res.json(results);
      }

      const results = await store.listByAccessor(accessor!);
      return res.json(results);
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  });

  router.get("/:id/view", async (req: Request, res: Response) => {
    try {
      const record = await store.get(req.params.id);
      return res.json(record);
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("not found")) {
        return res.status(404).json({ error: message });
      }
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
