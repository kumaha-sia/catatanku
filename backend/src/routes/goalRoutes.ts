import { Router } from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
