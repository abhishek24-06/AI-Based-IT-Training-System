import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { validateRequest } from '../middleware/validateRequest';
import { query, param, body } from 'express-validator';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Get user notifications
   */
  getUserNotifications = [
    validateRequest([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
    ]),
    async (req: Request, res: Response) => {
      try {
        const { page = 1, limit = 10 } = req.query;
        const result = await this.notificationService.getUserNotifications(
          req.user!.id,
          Number(page),
          Number(limit)
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
      }
    }
  ];

  /**
   * Mark a notification as read
   */
  markAsRead = [
    validateRequest([param('id').isMongoId()]),
    async (req: Request, res: Response) => {
      try {
        const notification = await this.notificationService.markAsRead(req.params.id);
        if (!notification) {
          return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
      } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
      }
    }
  ];

  /**
   * Mark all notifications as read
   */
  markAllAsRead = [
    async (req: Request, res: Response) => {
      try {
        await this.notificationService.markAllAsRead(req.user!.id);
        res.json({ message: 'All notifications marked as read' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
      }
    }
  ];

  /**
   * Delete a notification
   */
  deleteNotification = [
    validateRequest([param('id').isMongoId()]),
    async (req: Request, res: Response) => {
      try {
        const notification = await this.notificationService.deleteNotification(req.params.id);
        if (!notification) {
          return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ message: 'Notification deleted' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
      }
    }
  ];

  /**
   * Get unread notification count
   */
  getUnreadCount = [
    async (req: Request, res: Response) => {
      try {
        const count = await this.notificationService.getUnreadCount(req.user!.id);
        res.json({ count });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get unread count' });
      }
    }
  ];

  /**
   * Create a system notification (admin only)
   */
  createSystemNotification = [
    validateRequest([
      body('title').isString().notEmpty(),
      body('message').isString().notEmpty(),
      body('data').optional()
    ]),
    async (req: Request, res: Response) => {
      try {
        if (req.user?.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied' });
        }

        const { title, message, data } = req.body;
        const notifications = await this.notificationService.createSystemNotification(
          title,
          message,
          data
        );
        res.json(notifications);
      } catch (error) {
        res.status(500).json({ error: 'Failed to create system notification' });
      }
    }
  ];
} 