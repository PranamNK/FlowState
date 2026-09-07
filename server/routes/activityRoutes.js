import { Router } from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect); // All activity routes are protected

router.route('/')
  .post(createActivity)
  .get(getActivities);

router.route('/:id')
  .get(getActivityById)
  .put(updateActivity)
  .delete(deleteActivity);

export default router;
