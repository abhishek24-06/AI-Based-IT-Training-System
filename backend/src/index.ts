import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource, initializeDatabase } from "./data-source";
import authRouter from "./routes/authRoutes";
import courseRouter from "./routes/courseRoutes";
import { assessmentRouter } from "./routes/assessmentRoutes";
import adminRouter from "./routes/adminRoutes";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize the database
initializeDatabase()
  .then(() => {
    console.log("Database connected successfully!");

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS configuration
    app.use(
      cors({
        origin: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:5000",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Health check route
    app.get("/health", (req, res) => {
      res.json({ status: "ok", message: "Server is running" });
    });

    // Routes
    app.use("/api/auth", authRouter);
    app.use("/api/courses", courseRouter);
    app.use("/api/assessments", assessmentRouter);
    app.use("/api/admin", adminRouter);

    app.get("/", (req, res) => {
      res.send("AI-Based IT Training System Backend is running!");
    });

    // Error handling middleware
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Error:", err);
        res.status(500).json({
          message: "Internal server error",
          error:
            process.env.NODE_ENV === "development" ? err.message : undefined,
        });
      }
    );

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
