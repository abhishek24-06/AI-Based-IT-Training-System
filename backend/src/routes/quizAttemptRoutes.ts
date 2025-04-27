import { Router } from "express";
import { QuizAttemptController } from "../controllers/quizAttemptController";
import { authenticate } from "../middleware/authenticate";

const router = Router();
const quizAttemptController = new QuizAttemptController();

// Create a new quiz attempt
router.post("/", authenticate, quizAttemptController.createAttempt);

// Get attempt by ID
router.get("/:id", authenticate, quizAttemptController.getAttemptById);

// Get user's attempts
router.get(
  "/user/:userId",
  authenticate,
  quizAttemptController.getUserAttempts
);

// Get quiz attempts
router.get(
  "/quiz/:quizId",
  authenticate,
  quizAttemptController.getQuizAttempts
);

// Get best attempt for a quiz
router.get(
  "/quiz/:quizId/best",
  authenticate,
  quizAttemptController.getBestAttempt
);

// Get quiz statistics
router.get(
  "/quiz/:quizId/statistics",
  authenticate,
  quizAttemptController.getQuizStatistics
);

// Delete attempt
router.delete("/:id", authenticate, quizAttemptController.deleteAttempt);

export default router;
