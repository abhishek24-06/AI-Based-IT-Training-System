import { Request, Response } from 'express';
import { QuizAttemptService } from '../services/quizAttemptService';
import { validateRequest } from '../middleware/validateRequest';
import { body, param, query } from 'express-validator';

export class QuizAttemptController {
  private quizAttemptService: QuizAttemptService;

  constructor() {
    this.quizAttemptService = new QuizAttemptService();
  }

  /**
   * Create a new quiz attempt
   */
  createAttempt = [
    validateRequest([
      body('quizId').isMongoId().withMessage('Invalid quiz ID'),
      body('answers').isArray().withMessage('Answers must be an array'),
      body('answers.*.questionId').isMongoId().withMessage('Invalid question ID'),
      body('answers.*.answer').notEmpty().withMessage('Answer is required'),
      body('answers.*.timeSpent').isInt({ min: 0 }).withMessage('Time spent must be a positive number')
    ]),
    async (req: Request, res: Response) => {
      try {
        const attempt = await this.quizAttemptService.createAttempt({
          ...req.body,
          userId: req.user._id
        });
        res.status(201).json(attempt);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Get a quiz attempt by ID
   */
  getAttemptById = [
    validateRequest([
      param('id').isMongoId().withMessage('Invalid attempt ID')
    ]),
    async (req: Request, res: Response) => {
      try {
        const attempt = await this.quizAttemptService.getAttemptById(req.params.id);
        if (!attempt) {
          return res.status(404).json({ message: 'Attempt not found' });
        }
        res.json(attempt);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Get all attempts for a user
   */
  getUserAttempts = [
    validateRequest([
      param('userId').isMongoId().withMessage('Invalid user ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ]),
    async (req: Request, res: Response) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await this.quizAttemptService.getUserAttempts(req.params.userId, page, limit);
        res.json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Get all attempts for a quiz
   */
  getQuizAttempts = [
    validateRequest([
      param('quizId').isMongoId().withMessage('Invalid quiz ID'),
      query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    ]),
    async (req: Request, res: Response) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await this.quizAttemptService.getQuizAttempts(req.params.quizId, page, limit);
        res.json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Get user's best attempt for a quiz
   */
  getBestAttempt = [
    validateRequest([
      param('quizId').isMongoId().withMessage('Invalid quiz ID')
    ]),
    async (req: Request, res: Response) => {
      try {
        const attempt = await this.quizAttemptService.getBestAttempt(req.params.quizId);
        if (!attempt) {
          return res.status(404).json({ message: 'No attempts found' });
        }
        res.json(attempt);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Get quiz statistics
   */
  getQuizStatistics = [
    validateRequest([
      param('quizId').isMongoId().withMessage('Invalid quiz ID')
    ]),
    async (req: Request, res: Response) => {
      try {
        const statistics = await this.quizAttemptService.getQuizStatistics(req.params.quizId);
        res.json(statistics);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];

  /**
   * Delete a quiz attempt
   */
  deleteAttempt = [
    validateRequest([
      param('id').isMongoId().withMessage('Invalid attempt ID')
    ]),
    async (req: Request, res: Response) => {
      try {
        const success = await this.quizAttemptService.deleteAttempt(req.params.id);
        if (!success) {
          return res.status(404).json({ message: 'Attempt not found' });
        }
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  ];
} 