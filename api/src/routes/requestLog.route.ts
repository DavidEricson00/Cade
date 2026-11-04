import { Router } from 'express';
import { getLogs } from '../controllers/requestLog.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/:date', authenticate, getLogs);

export default router;