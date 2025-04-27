import express from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middleware/validateRequest";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const authController = new AuthController();

// Validation middleware
const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validateRequest,
];

const loginValidation = [
  body("email").isEmail().withMessage("Must be a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

// Public routes
router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.getCurrentUser);
router.post("/refresh-token", authenticateToken, authController.refreshToken);

export default router;
