import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/auditLogService';

export const auditLogMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Store the original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;

    // Override response methods to capture response body
    res.json = function (body: any) {
      res.locals.responseBody = body;
      return originalJson.call(this, body);
    };

    res.send = function (body: any) {
      res.locals.responseBody = body;
      return originalSend.call(this, body);
    };

    res.end = function (chunk?: any, encoding?: any, cb?: any) {
      if (chunk && !res.locals.responseBody) {
        res.locals.responseBody = chunk;
      }
      return originalEnd.call(this, chunk, encoding, cb);
    };

    // Log the request when response is finished
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      AuditLogService.logRequest(req, res, responseTime);
    });

    // Log errors
    res.on('error', (error: Error) => {
      const responseTime = Date.now() - startTime;
      AuditLogService.logRequest(req, res, responseTime, error);
    });

    next();
  };
}; 