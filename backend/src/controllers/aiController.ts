import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { generateRoast } from '../services/aiInsightService';

export const getAiRoast = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const persona = (req.query.persona as string) || 'savage';

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authorized' });
      return;
    }

    const insightText = await generateRoast(userId, persona);

    res.status(200).json({
      status: 'success',
      data: {
        insight: insightText
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
};
