import { body } from "express-validator";

export const createLessonValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("courseId")
    .notEmpty()
    .withMessage("Course ID is required")
    .isMongoId()
    .withMessage("Invalid Course ID"),
  body("order")
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

export const updateLessonValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

export const addVideoValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("url")
    .trim()
    .notEmpty()
    .withMessage("URL is required")
    .isURL()
    .withMessage("Invalid URL format"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive integer"),
  body("order")
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

export const addQuizValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("questions")
    .isArray()
    .withMessage("Questions must be an array")
    .notEmpty()
    .withMessage("At least one question is required"),
  body("questions.*.text")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Question text must be between 3 and 500 characters"),
  body("questions.*.options")
    .isArray({ min: 2, max: 4 })
    .withMessage("Each question must have 2-4 options"),
  body("questions.*.options.*")
    .trim()
    .notEmpty()
    .withMessage("Option text is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Option text must be between 1 and 200 characters"),
  body("questions.*.correctAnswer")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be between 0 and 3"),
];
