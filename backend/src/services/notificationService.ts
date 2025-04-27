import { Notification } from '../models/mongoose/Notification';
import { User } from '../models/mongoose/User';
import { Types } from 'mongoose';

interface NotificationData {
  userId: string;
  type: 'quiz' | 'system' | 'achievement';
  title: string;
  message: string;
  data?: any;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: NotificationData) {
    const notification = new Notification({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: false
    });

    await notification.save();
    return notification;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    return Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { read: true }
    );
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string) {
    return Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string) {
    return Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false
    });
  }

  /**
   * Create a system-wide notification
   */
  async createSystemNotification(title: string, message: string, data?: any) {
    const users = await User.find({}, '_id');
    const notifications = users.map(user => ({
      userId: user._id,
      type: 'system' as const,
      title,
      message,
      data,
      read: false
    }));

    return Notification.insertMany(notifications);
  }

  /**
   * Create a quiz-related notification
   */
  async createQuizNotification(
    userId: string,
    quizId: string,
    title: string,
    message: string,
    data?: any
  ) {
    return this.createNotification({
      userId,
      type: 'quiz',
      title,
      message,
      data: { quizId, ...data }
    });
  }

  /**
   * Create an achievement notification
   */
  async createAchievementNotification(
    userId: string,
    achievementId: string,
    title: string,
    message: string,
    data?: any
  ) {
    return this.createNotification({
      userId,
      type: 'achievement',
      title,
      message,
      data: { achievementId, ...data }
    });
  }
} 