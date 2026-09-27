import { Router } from 'express';
import { getWallets, createWallet, updateWallet, deleteWallet } from '../controllers/walletController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getWallets)
  .post(createWallet);

router.route('/:id')
  .put(updateWallet)
  .delete(deleteWallet);

export default router;
