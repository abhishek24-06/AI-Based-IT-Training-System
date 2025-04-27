import { getRepository } from 'typeorm';
import { AuditLog } from '../entities/AuditLog';
import { Request, Response } from 'express';
import { User } from '../entities/User';

export class AuditLogService {
  private static auditLogRepository = getRepository(AuditLog);

  static async logRequest(
    req: Request,
    res: Response,
    responseTime: number,
    error?: Error
  ): Promise<void> {
    const auditLog = new AuditLog();
    
    // Get user ID from request if authenticated
    if (req.user) {
      auditLog.userId = (req.user as any).id;
    }

    // Set request details
    auditLog.action = req.method;
    auditLog.endpoint = req.originalUrl;
    auditLog.statusCode = res.statusCode;
    auditLog.responseTime = responseTime;
    auditLog.ipAddress = req.ip;
    auditLog.userAgent = req.get('user-agent') || null;
    auditLog.timestamp = new Date();

    // Log request body (excluding sensitive data)
    if (req.body) {
      const sanitizedBody = { ...req.body };
      if (sanitizedBody.password) delete sanitizedBody.password;
      if (sanitizedBody.token) delete sanitizedBody.token;
      auditLog.requestBody = sanitizedBody;
    }

    // Log response body (excluding sensitive data)
    if (res.locals.responseBody) {
      const sanitizedResponse = { ...res.locals.responseBody };
      if (sanitizedResponse.token) delete sanitizedResponse.token;
      auditLog.responseBody = sanitizedResponse;
    }

    // Log error details if present
    if (error) {
      auditLog.isError = true;
      auditLog.errorMessage = error.message;
      auditLog.stackTrace = error.stack;
    }

    try {
      await this.auditLogRepository.save(auditLog);
    } catch (err) {
      console.error('Failed to save audit log:', err);
    }
  }

  async getLogs(params: {
    userId?: string;
    action?: string;
    endpoint?: string;
    statusCode?: number;
    error?: boolean;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      userId,
      action,
      endpoint,
      statusCode,
      error,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = params;

    const query = this.auditLogRepository.createQueryBuilder('auditLog');

    if (userId) {
      query.andWhere('auditLog.userId = :userId', { userId });
    }

    if (action) {
      query.andWhere('auditLog.action = :action', { action });
    }

    if (endpoint) {
      query.andWhere('auditLog.endpoint = :endpoint', { endpoint });
    }

    if (statusCode) {
      query.andWhere('auditLog.statusCode = :statusCode', { statusCode });
    }

    if (error !== undefined) {
      query.andWhere('auditLog.isError = :error', { error });
    }

    if (startDate) {
      query.andWhere('auditLog.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('auditLog.timestamp <= :endDate', { endDate });
    }

    const [logs, total] = await query
      .orderBy('auditLog.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getErrorLogs(page: number = 1, limit: number = 10) {
    const [logs, total] = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.isError = :error', { error: true })
      .orderBy('auditLog.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserLogs(userId: string, page: number = 1, limit: number = 10) {
    const [logs, total] = await this.auditLogRepository
      .createQueryBuilder('auditLog')
      .where('auditLog.userId = :userId', { userId })
      .orderBy('auditLog.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteOldLogs(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('timestamp < :date', { date })
      .execute();

    return result.affected;
  }

  async createLog(logData: Partial<AuditLog>) {
    const log = this.auditLogRepository.create(logData);
    return await this.auditLogRepository.save(log);
  }
} 