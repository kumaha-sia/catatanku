import { Router } from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, scanReceipt } from '../controllers/transactionController';
import { authenticate } from '../middlewares/authMiddleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authenticate);
router.post('/scan', upload.single('receipt'), scanReceipt);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
