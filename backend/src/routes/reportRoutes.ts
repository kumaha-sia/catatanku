import { Router } from 'express';
import { getSummary, exportCSV, exportPDF } from '../controllers/reportController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/summary', getSummary);
router.get('/export', exportCSV);
router.get('/export-pdf', exportPDF);

export default router;
