const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { auth, admin } = require('../middleware/auth');
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addRating,
  getRecommendations
} = require('../controllers/courseController');

// Validation middleware
const courseValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['Programming', 'Web Development', 'Data Science', 'Cloud Computing', 'Cybersecurity', 'Networking'])
    .withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('modules').isArray().withMessage('Modules must be an array'),
  body('modules.*.title').trim().notEmpty().withMessage('Module title is required'),
  body('modules.*.content').trim().notEmpty().withMessage('Module content is required')
];

const ratingValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().trim()
];

// Public routes
router.get('/', getAllCourses);
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid course ID')
], getCourseById);

// Protected routes
router.post('/', [
  auth,
  ...courseValidation
], createCourse);

router.put('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid course ID'),
  ...courseValidation
], updateCourse);

router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid course ID')
], deleteCourse);

router.post('/:id/ratings', [
  auth,
  param('id').isMongoId().withMessage('Invalid course ID'),
  ...ratingValidation
], addRating);

router.get('/recommendations', auth, getRecommendations);

module.exports = router; 