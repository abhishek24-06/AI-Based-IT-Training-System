import { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService';
import { validateRequest } from '../middleware/validateRequest';
import { query } from 'express-validator';

export class AuditLogController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  getLogs = [
    validateRequest([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('userId').optional().isUUID(),
      query('action').optional().isString(),
      query('endpoint').optional().isString(),
      query('statusCode').optional().isInt(),
      query('error').optional().isBoolean(),
      query('startDate').optional().isISO8601(),
      query('endDate').optional().isISO8601(),
    ]),
    async (req: Request, res: Response) => {
      try {
        const result = await this.auditLogService.getLogs(req.query);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching audit logs', error });
      }
    },
  ];

  getErrorLogs = [
    validateRequest([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    ]),
    async (req: Request, res: Response) => {
      try {
        const result = await this.auditLogService.getErrorLogs(
          Number(req.query.page),
          Number(req.query.limit)
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching error logs', error });
      }
    },
  ];

  getUserLogs = [
    validateRequest([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    ]),
    async (req: Request, res: Response) => {
      try {
        const result = await this.auditLogService.getUserLogs(
          req.params.userId,
          Number(req.query.page),
          Number(req.query.limit)
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching user logs', error });
      }
    },
  ];

  deleteOldLogs = [
    validateRequest([
      query('days').optional().isInt({ min: 1, max: 365 }).toInt(),
    ]),
    async (req: Request, res: Response) => {
      try {
        const days = Number(req.query.days) || 30;
        const deletedCount = await this.auditLogService.deleteOldLogs(days);
        res.json({ message: `Deleted ${deletedCount} old logs` });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting old logs', error });
      }
    },
  ];
} 