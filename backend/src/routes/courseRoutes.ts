import express from "express";
import { courseController } from "../controllers/courseController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);

// Protected routes
router.post("/", authenticateToken, courseController.createCourse);
router.put("/:id", authenticateToken, courseController.updateCourse);
router.delete("/:id", authenticateToken, courseController.deleteCourse);

export default router;
