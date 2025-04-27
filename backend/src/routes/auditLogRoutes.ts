import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../models/User';

const router = Router();
const auditLogController = new AuditLogController();

// Get audit logs with filters
router.get(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  auditLogController.getLogs
);

// Get error logs
router.get(
  '/errors',
  authenticate,
  authorize([UserRole.ADMIN]),
  auditLogController.getErrorLogs
);

// Get logs for a specific user
router.get(
  '/user/:userId',
  authenticate,
  authorize([UserRole.ADMIN]),
  auditLogController.getUserLogs
);

// Delete old logs
router.delete(
  '/old',
  authenticate,
  authorize([UserRole.ADMIN]),
  auditLogController.deleteOldLogs
);

export default router; 