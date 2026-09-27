import { Router } from 'express';
import { getAiRoast } from '../controllers/aiController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/roast', getAiRoast);

export default router;
