import express from 'express';
import { assessmentController } from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', assessmentController.getAllAssessments);
router.get('/:id', assessmentController.getAssessmentById);

// Protected routes
router.post('/', authenticateToken, assessmentController.createAssessment);
router.put('/:id', authenticateToken, assessmentController.updateAssessment);
router.delete('/:id', authenticateToken, assessmentController.deleteAssessment);
router.post('/:id/submit', authenticateToken, assessmentController.submitAssessment);

export const assessmentRouter = router; 