import { Router } from 'express';
import {
  startSession,
  pauseSession,
  resumeSession,
  finishSession,
  cancelSession,
  getActiveSession,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.post('/start', startSession);
router.get('/active', getActiveSession);
router.post('/:id/pause', pauseSession);
router.post('/:id/resume', resumeSession);
router.post('/:id/finish', finishSession);
router.post('/:id/cancel', cancelSession);

export default router;
