import { Router } from 'express';
import { getInsights } from '../controllers/insightController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getInsights);

export default router;
