import { Router } from 'express';
import { z } from 'zod';
import { BreakGlassService } from '../services/breakGlassService';

const executeBreakGlassSchema = z.object({
  transcriptId: z.string().min(1),
  ministryAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  courtOrder: z.string().optional()
});

export function buildBreakGlassRouter(breakGlassService: BreakGlassService): Router {
  const router = Router();

  /**
   * POST /break-glass/execute
   * Ministry executes emergency access
   */
  router.post('/execute', async (req, res) => {
    try {
      const parsed = executeBreakGlassSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: 'Invalid request',
          details: parsed.error.errors
        });
      }

      const { transcriptId, ministryAddress, reason, courtOrder } = parsed.data;

      const wrappedKey = await breakGlassService.executeBreakGlass(
        transcriptId,
        ministryAddress,
        reason,
        courtOrder
      );

      res.json({ 
        status: 'success',
        wrappedKey,
        message: 'Emergency access granted. Student has been notified.',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('[BreakGlass] Execute error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to execute break glass'
      });
    }
  });

  /**
   * GET /break-glass/history/:transcriptId
   * Get audit log for a transcript
   */
  router.get('/history/:transcriptId', async (req, res) => {
    try {
      const { transcriptId } = req.params;

      if (!transcriptId) {
        return res.status(400).json({ error: 'Transcript ID is required' });
      }

      const history = await breakGlassService.getAccessHistory(transcriptId);

      res.json({ 
        status: 'success',
        history,
        count: history.length
      });
    } catch (error) {
      console.error('[BreakGlass] History error:', error);
      res.status(500).json({ error: 'Failed to fetch access history' });
    }
  });

  /**
   * GET /break-glass/student/:address
   * Student views all break glass access to their transcripts
   */
  router.get('/student/:address', async (req, res) => {
    try {
      const { address } = req.params;

      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
      }

      const history = await breakGlassService.getStudentAccessHistory(address);

      res.json({ 
        status: 'success',
        history,
        count: history.length
      });
    } catch (error) {
      console.error('[BreakGlass] Student history error:', error);
      res.status(500).json({ error: 'Failed to fetch student access history' });
    }
  });

  return router;
}
