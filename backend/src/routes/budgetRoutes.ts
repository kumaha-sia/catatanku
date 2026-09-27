import { Router } from 'express';
import { getBudgets, setBudget, rolloverBudgets } from '../controllers/budgetController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/', getBudgets);
router.post('/', setBudget);
router.post('/rollover', rolloverBudgets);

export default router;
