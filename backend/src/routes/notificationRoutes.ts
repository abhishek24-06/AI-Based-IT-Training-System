import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

// Get user notifications
router.get('/', authenticate, notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:id/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Get unread count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Create system notification (admin only)
router.post('/system', authenticate, (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}, notificationController.createSystemNotification);

export default router; 