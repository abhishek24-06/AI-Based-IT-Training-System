import express from "express";
import multer, { FileFilterCallback } from "multer";
import { VideoController } from "../controllers/videoController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();
const controller = new VideoController();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req: any, file: any, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"));
    }
    cb(null, true);
  },
});

// Public routes
router.get("/", controller.getVideos);
router.get("/:videoId", controller.getVideoDetails);
router.get("/:videoId/stream", controller.getVideoStream);
router.get("/:videoId/thumbnail", controller.getVideoThumbnail);
router.get("/:videoId/comments", controller.getVideoComments);
router.get("/:videoId/likes", controller.getVideoLikes);
router.get("/:videoId/views", controller.getVideoViews);
router.get("/:videoId/duration", controller.getVideoDuration);
router.get("/:videoId/status", controller.getVideoStatus);
router.get("/:videoId/transcription", controller.getVideoTranscription);
router.get("/:videoId/captions", controller.getVideoCaptions);

// Protected routes (require authentication)
router.use(authenticateToken);

// Video management routes
router.post("/upload", upload.single("video") as any, controller.uploadVideo);
router.put("/:videoId", controller.updateVideo);
router.delete("/:videoId", controller.deleteVideo);

// Comment routes
router.post("/:videoId/comments", controller.addVideoComment);
router.delete("/:videoId/comments/:commentId", controller.deleteVideoComment);

// Like routes
router.post("/:videoId/likes", controller.likeVideo);
router.delete("/:videoId/likes", controller.unlikeVideo);

// View routes
router.post("/:videoId/views", controller.incrementVideoViews);

// Caption routes
router.post(
  "/:videoId/captions",
  upload.single("captions") as any,
  controller.uploadVideoCaptions
);
router.delete("/:videoId/captions", controller.deleteVideoCaptions);

// Analytics route
router.get("/:videoId/analytics", controller.getVideoAnalytics);

export default router;
