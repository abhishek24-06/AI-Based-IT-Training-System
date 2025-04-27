import { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { VideoService } from '../services/videoService';
import { CommentService } from '../services/commentService';
import { LikeService } from '../services/likeService';
import { ViewService } from '../services/viewService';
import { CaptionService } from '../services/captionService';
import { TranscriptionService } from '../services/transcriptionService';
import { AppDataSource } from "../data-source";
import { Video } from "../entity/Video";
import { Lesson } from "../entity/Lesson";

export class VideoController {
  private videoService: VideoService;
  private commentService: CommentService;
  private likeService: LikeService;
  private viewService: ViewService;
  private captionService: CaptionService;
  private transcriptionService: TranscriptionService;

  constructor() {
    this.videoService = new VideoService();
    this.commentService = new CommentService();
    this.likeService = new LikeService();
    this.viewService = new ViewService();
    this.captionService = new CaptionService();
    this.transcriptionService = new TranscriptionService();
  }

  // Get all videos
  getVideos = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const { page = 1, limit = 10 } = req.query;
        const videos = await this.videoService.getVideos(page as number, limit as number);
        res.json(videos);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch videos' });
      }
    }
  ];

  // Upload a new video
  uploadVideo = [
    body('title').isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No video file uploaded' });
        }

        const video = await this.videoService.uploadVideo({
          file: req.file,
          title: req.body.title,
          description: req.body.description,
          userId: req.user.id
        });

        res.status(201).json(video);
      } catch (error) {
        res.status(500).json({ error: 'Failed to upload video' });
      }
    }
  ];

  // Get video details
  getVideoDetails = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const video = await this.videoService.getVideoDetails(req.params.videoId);
        if (!video) {
          return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video details' });
      }
    }
  ];

  // Update video details
  updateVideo = [
    param('videoId').isUUID(),
    body('title').optional().isString().trim().notEmpty(),
    body('description').optional().isString().trim(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const video = await this.videoService.updateVideo(req.params.videoId, req.body);
        if (!video) {
          return res.status(404).json({ error: 'Video not found' });
        }
        res.json(video);
      } catch (error) {
        res.status(500).json({ error: 'Failed to update video' });
      }
    }
  ];

  // Delete video
  deleteVideo = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.videoService.deleteVideo(req.params.videoId);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete video' });
      }
    }
  ];

  // Get video stream
  getVideoStream = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const stream = await this.videoService.getVideoStream(req.params.videoId);
        if (!stream) {
          return res.status(404).json({ error: 'Video not found' });
        }
        res.setHeader('Content-Type', 'video/mp4');
        stream.pipe(res);
      } catch (error) {
        res.status(500).json({ error: 'Failed to stream video' });
      }
    }
  ];

  // Get video thumbnail
  getVideoThumbnail = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const thumbnail = await this.videoService.getVideoThumbnail(req.params.videoId);
        if (!thumbnail) {
          return res.status(404).json({ error: 'Thumbnail not found' });
        }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(thumbnail);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch thumbnail' });
      }
    }
  ];

  // Get video analytics
  getVideoAnalytics = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const analytics = await this.videoService.getVideoAnalytics(req.params.videoId);
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video analytics' });
      }
    }
  ];

  // Get video comments
  getVideoComments = [
    param('videoId').isUUID(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const { page = 1, limit = 10 } = req.query;
        const comments = await this.commentService.getVideoComments(
          req.params.videoId,
          page as number,
          limit as number
        );
        res.json(comments);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
      }
    }
  ];

  // Add video comment
  addVideoComment = [
    param('videoId').isUUID(),
    body('comment').isString().trim().notEmpty(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const comment = await this.commentService.addComment({
          videoId: req.params.videoId,
          userId: req.user.id,
          comment: req.body.comment
        });
        res.status(201).json(comment);
      } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
      }
    }
  ];

  // Delete video comment
  deleteVideoComment = [
    param('videoId').isUUID(),
    param('commentId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.commentService.deleteComment(req.params.commentId);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
      }
    }
  ];

  // Get video likes
  getVideoLikes = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const likes = await this.likeService.getVideoLikes(req.params.videoId);
        res.json(likes);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch likes' });
      }
    }
  ];

  // Like video
  likeVideo = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.likeService.likeVideo(req.params.videoId, req.user.id);
        res.status(201).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to like video' });
      }
    }
  ];

  // Unlike video
  unlikeVideo = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.likeService.unlikeVideo(req.params.videoId, req.user.id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to unlike video' });
      }
    }
  ];

  // Get video views
  getVideoViews = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const views = await this.viewService.getVideoViews(req.params.videoId);
        res.json(views);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch views' });
      }
    }
  ];

  // Increment video views
  incrementVideoViews = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.viewService.incrementViews(req.params.videoId, req.user.id);
        res.status(201).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to increment views' });
      }
    }
  ];

  // Get video duration
  getVideoDuration = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const duration = await this.videoService.getVideoDuration(req.params.videoId);
        res.json({ duration });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video duration' });
      }
    }
  ];

  // Get video status
  getVideoStatus = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const status = await this.videoService.getVideoStatus(req.params.videoId);
        res.json({ status });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch video status' });
      }
    }
  ];

  // Get video transcription
  getVideoTranscription = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const transcription = await this.transcriptionService.getTranscription(req.params.videoId);
        res.json(transcription);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transcription' });
      }
    }
  ];

  // Get video captions
  getVideoCaptions = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        const captions = await this.captionService.getCaptions(req.params.videoId);
        res.json(captions);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch captions' });
      }
    }
  ];

  // Upload video captions
  uploadVideoCaptions = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No caption file uploaded' });
        }

        const captions = await this.captionService.uploadCaptions(
          req.params.videoId,
          req.file
        );
        res.status(201).json(captions);
      } catch (error) {
        res.status(500).json({ error: 'Failed to upload captions' });
      }
    }
  ];

  // Delete video captions
  deleteVideoCaptions = [
    param('videoId').isUUID(),
    validateRequest,
    async (req: Request, res: Response) => {
      try {
        await this.captionService.deleteCaptions(req.params.videoId);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete captions' });
      }
    }
  ];
}

const videoRepository = AppDataSource.getRepository(Video);
const lessonRepository = AppDataSource.getRepository(Lesson);

export const addVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, url, duration, order } = req.body;
    const instructorId = req.user?.userId;

    if (!instructorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const lesson = await lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['course', 'course.instructor']
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.course.instructor.id !== instructorId) {
      return res.status(403).json({ message: 'Not authorized to add videos to this lesson' });
    }

    const video = videoRepository.create({
      title,
      description,
      url,
      duration,
      order,
      lesson
    });

    await videoRepository.save(video);

    res.status(201).json({
      message: 'Video added successfully',
      video
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId, videoId } = req.params;
    const { title, description, url, duration, order } = req.body;
    const instructorId = req.user?.userId;

    if (!instructorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const video = await videoRepository.findOne({
      where: { id: videoId },
      relations: ['lesson', 'lesson.course', 'lesson.course.instructor']
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.lesson.course.instructor.id !== instructorId) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.url = url || video.url;
    video.duration = duration || video.duration;
    video.order = order !== undefined ? order : video.order;

    await videoRepository.save(video);

    res.json({
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId, videoId } = req.params;
    const instructorId = req.user?.userId;

    if (!instructorId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const video = await videoRepository.findOne({
      where: { id: videoId },
      relations: ['lesson', 'lesson.course', 'lesson.course.instructor']
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.lesson.course.instructor.id !== instructorId) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await videoRepository.remove(video);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 