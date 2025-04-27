import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validateRequest";
import * as lessonController from "../controllers/lessonController";
import * as videoController from "../controllers/videoController";
import * as quizController from "../controllers/quizController";
import {
  createLessonValidation,
  updateLessonValidation,
  addVideoValidation,
  addQuizValidation,
} from "../validations/lessonValidation";

const router = Router();

// Lesson routes
router.get(
  "/:courseId/lessons",
  authenticateToken,
  lessonController.getLessons
);
router.post(
  "/:courseId",
  authenticateToken,
  createLessonValidation,
  validateRequest,
  lessonController.createLesson
);
router.put(
  "/:id",
  authenticateToken,
  updateLessonValidation,
  validateRequest,
  lessonController.updateLesson
);
router.delete("/:id", authenticateToken, lessonController.deleteLesson);

// Video routes
router.get("/:lessonId/videos", authenticateToken, lessonController.getVideos);
router.post(
  "/:lessonId/videos",
  authenticateToken,
  addVideoValidation,
  validateRequest,
  lessonController.addVideo
);
router.put(
  "/:lessonId/videos/:videoId",
  authenticateToken,
  addVideoValidation,
  validateRequest,
  lessonController.updateVideo
);
router.delete(
  "/:lessonId/videos/:videoId",
  authenticateToken,
  lessonController.deleteVideo
);

// Quiz routes
router.get(
  "/:lessonId/quizzes",
  authenticateToken,
  lessonController.getQuizzes
);
router.post(
  "/:lessonId/quizzes",
  authenticateToken,
  addQuizValidation,
  validateRequest,
  lessonController.addQuiz
);
router.put(
  "/:lessonId/quizzes/:quizId",
  authenticateToken,
  addQuizValidation,
  validateRequest,
  lessonController.updateQuiz
);
router.delete(
  "/:lessonId/quizzes/:quizId",
  authenticateToken,
  lessonController.deleteQuiz
);

export default router;
