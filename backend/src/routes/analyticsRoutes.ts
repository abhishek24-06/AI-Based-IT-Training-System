import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

// Quiz analytics routes
router.get('/quiz/:quizId', authenticate, analyticsController.getQuizAnalytics);

// User analytics routes
router.get('/user/:userId', authenticate, analyticsController.getUserAnalytics);

// System analytics routes (admin only)
router.get('/system', authenticate, (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, analyticsController.getSystemAnalytics);

export default router; 