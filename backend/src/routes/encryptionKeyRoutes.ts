import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";
import { z } from "zod";

import type { TranscriptStore } from "../store/TranscriptStore.js";

const base64KeySchema = z
  .string()
  .trim()
  .refine((value) => value.length > 0, { message: "Encryption public key is required." })
  .refine((value) => /^[A-Za-z0-9+/=]+$/.test(value), {
    message: "Encryption public key must be base64 encoded."
  })
  .refine((value) => {
    try {
      return Buffer.from(value, "base64").length === 32;
    } catch {
      return false;
    }
  }, {
    message: "Encryption public key must decode to 32 bytes. Copy it from MetaMask's 'Show encryption public key' screen."
  });

const registerSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  publicKey: base64KeySchema
});

export function buildEncryptionKeyRouter(store: TranscriptStore): Router {
  const router = createRouter();

  router.post("/", async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

  await store.setEncryptionPublicKey(parsed.data.address, parsed.data.publicKey.trim());
    return res.status(201).json({ status: "ok" });
  });

  router.get("/:address", async (req: Request, res: Response) => {
    const address = req.params.address;
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const publicKey = await store.getEncryptionPublicKey(address);
    if (!publicKey) {
      return res.status(404).json({ error: "Encryption key not found" });
    }

    return res.json({ address: address.toLowerCase(), publicKey });
  });

  return router;
}
