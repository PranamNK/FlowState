import { Router } from 'express';
import { getDaily, getWeekly, getMonthly } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/daily', getDaily);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);

export default router;
