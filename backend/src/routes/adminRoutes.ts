import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/auth';
import {
  getUsers,
  updateUserStatus,
  deleteUser,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAnalytics,
  getSystemLogs,
  getErrorLogs,
  updateSystemSettings,
  getSystemSettings,
  createBackup,
  restoreBackup,
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/adminController';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeAdmin);

// Error handling middleware
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Admin route error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// User Management
router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);

// Course Management
// Course Approval (specific routes first)
router.get('/courses/pending', getPendingCourses);
router.post('/courses/:courseId/approve', approveCourse);
router.post('/courses/:courseId/reject', rejectCourse);

// General course routes
router.get('/courses', getAllCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Analytics
router.get('/analytics', getAnalytics);

// System Management
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Logs
router.get('/logs', getSystemLogs);
router.get('/logs/errors', getErrorLogs);

// Backup and Restore
router.post('/backup', createBackup);
router.post('/backup/:backupId/restore', restoreBackup);

export default router; 