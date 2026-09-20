import { Router } from 'express';
import { getLogs } from '../controllers/requestLog.controller.js';

const router = Router();

router.get('/:date', getLogs);

export default router;