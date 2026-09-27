import { Router } from 'express';
import { getDebts, createDebt, updateDebt, deleteDebt, payDebt } from '../controllers/debtController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getDebts)
  .post(createDebt);

router.post('/:id/pay', payDebt);

router.route('/:id')
  .put(updateDebt)
  .delete(deleteDebt);

export default router;
