import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/', getCategories);
router.post('/', createCategory);

export default router;
