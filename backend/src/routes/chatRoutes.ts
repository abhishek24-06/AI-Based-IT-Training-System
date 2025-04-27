import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { chatController } from '../controllers/chatController';

const router = Router();

// Message endpoint
router.post('/', authenticateToken, chatController.handleMessage);

// Chat history endpoint
router.get('/history', authenticateToken, chatController.getChatHistory);

export default router; 