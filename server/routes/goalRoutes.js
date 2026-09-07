import { Router } from 'express';
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/')
  .post(createGoal)
  .get(getGoals);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
