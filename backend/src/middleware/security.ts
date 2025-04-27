import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csrf from 'csurf';
import { validationResult } from 'express-validator';
import { AuditLog } from '../entities/AuditLog';
import { getConnection } from 'typeorm';
import { User } from '../entities/User';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// CSRF protection middleware
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Audit logging middleware
export const auditLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  const connection = getConnection();
  const auditLogRepository = connection.getRepository(AuditLog);

  // Override res.send to capture response
  res.send = function (body) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    const userId = (req.user as User)?.id || null;

    // Log the request
    auditLogRepository.save({
      userId,
      action: req.method,
      endpoint: req.originalUrl,
      statusCode,
      responseTime,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      requestBody: req.body,
      responseBody: body,
      timestamp: new Date(),
    });

    return originalSend.call(this, body);
  };

  next();
};

// SQL injection protection middleware
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
  ];

  const checkForInjection = (value: string) => {
    return sqlInjectionPatterns.some(pattern => pattern.test(value));
  };

  // Check query parameters
  Object.values(req.query).forEach(value => {
    if (typeof value === 'string' && checkForInjection(value)) {
      return res.status(400).json({ error: 'Invalid input detected' });
    }
  });

  // Check body parameters
  if (req.body) {
    const bodyString = JSON.stringify(req.body);
    if (checkForInjection(bodyString)) {
      return res.status(400).json({ error: 'Invalid input detected' });
    }
  }

  next();
};

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/[&<>"']/g, (match) => {
        const escape: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
        };
        return escape[match];
      });
    }
    if (Array.isArray(input)) {
      return input.map(sanitizeInput);
    }
    if (typeof input === 'object' && input !== null) {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [key, sanitizeInput(value)])
      );
    }
    return input;
  };

  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);

  next();
};

// Request size limiting middleware
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const MAX_REQUEST_SIZE = '10mb';
  
  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      return res.status(413).json({ error: 'Request entity too large' });
    }
  }

  next();
};

// Session security middleware
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (req.session) {
    // Set secure session cookie
    req.session.cookie.secure = process.env.NODE_ENV === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.sameSite = 'strict';
  }
  next();
};

// Export all middleware
export const securityMiddleware = [
  rateLimiter,
  securityHeaders,
  csrfProtection,
  validateInput,
  auditLogger,
  sqlInjectionProtection,
  xssProtection,
  requestSizeLimiter,
  sessionSecurity,
]; 