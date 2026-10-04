import { Router, Response } from 'express';
import { db } from '../db.js';

const router = Router();

// Demo reset endpoint for quick testing
router.post('/reset-demo', (_req, res: Response) => {
  db.resetToDefault();
  res.json({ message: 'Demo database has been reset to default state successfully.' });
});

// Health check
router.get('/health', (_req, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
