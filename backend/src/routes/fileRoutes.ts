import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod";

import type { FileStore } from "../store/FileStore.js";

const uploadSchema = z.object({
  transcriptId: z.string().min(1),
  encryptedData: z.string().min(1),
  iv: z.string().min(1),
  mimeType: z.string().min(1)
});

export function buildFileRouter(store: FileStore): Router {
  const router = createRouter();

  router.post("/", (req: Request, res: Response) => {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const payload = {
      ...parsed.data,
      uploadedAt: Date.now()
    };

    store.save(payload);
    return res.status(201).json({ status: "ok" });
  });

  router.get("/:transcriptId", (req: Request, res: Response) => {
    try {
      const payload = store.get(req.params.transcriptId);
      return res.json(payload);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return res.status(404).json({ error: "File not found" });
      }
      return res.status(500).json({ error: (error as Error).message });
    }
  });

  return router;
}
