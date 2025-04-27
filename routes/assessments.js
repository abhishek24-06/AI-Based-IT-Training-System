const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  submitAssessment,
  getAssessmentHistory,
  getAdaptiveAssessment
} = require('../controllers/assessmentController');

// Validation middleware
const assessmentValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('courseId').isMongoId().withMessage('Invalid course ID'),
  body('moduleId').isMongoId().withMessage('Invalid module ID'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('questions').isArray().withMessage('Questions must be an array'),
  body('questions.*.questionText').trim().notEmpty()
    .withMessage('Question text is required'),
  body('questions.*.options').isArray().withMessage('Options must be an array'),
  body('questions.*.options.*.text').trim().notEmpty()
    .withMessage('Option text is required'),
  body('questions.*.options.*.isCorrect').isBoolean()
    .withMessage('isCorrect must be a boolean'),
  body('timeLimit').isInt({ min: 1 }).withMessage('Time limit must be at least 1 minute'),
  body('passingScore').isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  body('maxAttempts').isInt({ min: 1 }).withMessage('Max attempts must be at least 1'),
  body('isRandomized').isBoolean().withMessage('isRandomized must be a boolean'),
  body('showAnswers').isBoolean().withMessage('showAnswers must be a boolean')
];

const submissionValidation = [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('answers.*').isInt({ min: 0 }).withMessage('Invalid answer index')
];

// Public routes
router.get('/', getAllAssessments);
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid assessment ID')
], getAssessmentById);

// Protected routes
router.post('/', [
  auth,
  admin,
  ...assessmentValidation
], createAssessment);

router.put('/:id', [
  auth,
  admin,
  param('id').isMongoId().withMessage('Invalid assessment ID'),
  ...assessmentValidation
], updateAssessment);

router.delete('/:id', [
  auth,
  admin,
  param('id').isMongoId().withMessage('Invalid assessment ID')
], deleteAssessment);

// User routes
router.post('/:id/submit', [
  auth,
  param('id').isMongoId().withMessage('Invalid assessment ID'),
  ...submissionValidation
], submitAssessment);

router.get('/history', auth, getAssessmentHistory);

router.get('/adaptive/:courseId', [
  auth,
  param('courseId').isMongoId().withMessage('Invalid course ID')
], getAdaptiveAssessment);

module.exports = router; 