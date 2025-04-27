import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { validateRequest } from '../middleware/validateRequest';
import { query } from 'express-validator';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get analytics for a specific quiz
   */
  getQuizAnalytics = [
    validateRequest([
      query('startDate').optional().isISO8601().toDate(),
      query('endDate').optional().isISO8601().toDate()
    ]),
    async (req: Request, res: Response) => {
      try {
        const { quizId } = req.params;
        const { startDate, endDate } = req.query;

        const timeRange = startDate && endDate ? {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        } : undefined;

        const analytics = await this.analyticsService.getQuizAnalytics(quizId, timeRange);
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quiz analytics' });
      }
    }
  ];

  /**
   * Get analytics for a specific user
   */
  getUserAnalytics = [
    validateRequest([
      query('startDate').optional().isISO8601().toDate(),
      query('endDate').optional().isISO8601().toDate()
    ]),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const timeRange = startDate && endDate ? {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        } : undefined;

        const analytics = await this.analyticsService.getUserAnalytics(userId, timeRange);
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user analytics' });
      }
    }
  ];

  /**
   * Get system-wide analytics
   */
  getSystemAnalytics = [
    validateRequest([
      query('startDate').optional().isISO8601().toDate(),
      query('endDate').optional().isISO8601().toDate()
    ]),
    async (req: Request, res: Response) => {
      try {
        const { startDate, endDate } = req.query;

        const timeRange = startDate && endDate ? {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string)
        } : undefined;

        const analytics = await this.analyticsService.getSystemAnalytics(timeRange);
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch system analytics' });
      }
    }
  ];
} 