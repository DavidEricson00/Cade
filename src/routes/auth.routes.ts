import { Router } from 'express';
import {
  register,
  login,
  verifyTwoFactor,
  resendTwoFactor,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/2fa/verify', verifyTwoFactor);
router.post('/2fa/resend', resendTwoFactor);

export default router;