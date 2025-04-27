import { Video } from '../models/Video';
import { VideoRepository } from '../repositories/videoRepository';
import { FileStorageService } from './fileStorageService';
import { VideoProcessingService } from './videoProcessingService';
import { NotFoundError } from '../errors/NotFoundError';

export class VideoService {
  private videoRepository: VideoRepository;
  private fileStorageService: FileStorageService;
  private videoProcessingService: VideoProcessingService;

  constructor() {
    this.videoRepository = new VideoRepository();
    this.fileStorageService = new FileStorageService();
    this.videoProcessingService = new VideoProcessingService();
  }

  async getVideos(page: number = 1, limit: number = 10) {
    return this.videoRepository.findMany(page, limit);
  }

  async uploadVideo(data: {
    file: Express.Multer.File;
    title: string;
    description?: string;
    userId: string;
  }) {
    // Upload video file
    const videoUrl = await this.fileStorageService.uploadVideo(data.file);

    // Create video record
    const video = await this.videoRepository.create({
      title: data.title,
      description: data.description,
      url: videoUrl,
      userId: data.userId,
      status: 'processing'
    });

    // Process video in background
    this.videoProcessingService.processVideo(video.id, videoUrl);

    return video;
  }

  async getVideoDetails(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }
    return video;
  }

  async updateVideo(videoId: string, data: Partial<Video>) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.videoRepository.update(videoId, data);
  }

  async deleteVideo(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Delete video file
    await this.fileStorageService.deleteVideo(video.url);

    // Delete video record
    await this.videoRepository.delete(videoId);
  }

  async getVideoStream(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.fileStorageService.getVideoStream(video.url);
  }

  async getVideoThumbnail(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.fileStorageService.getVideoThumbnail(video.url);
  }

  async getVideoAnalytics(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.videoRepository.getVideoAnalytics(videoId);
  }

  async getVideoDuration(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.videoProcessingService.getVideoDuration(video.url);
  }

  async getVideoStatus(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return video.status;
  }

  async updateVideoStatus(videoId: string, status: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return this.videoRepository.update(videoId, { status });
  }

  async generateThumbnail(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    const thumbnailUrl = await this.videoProcessingService.generateThumbnail(video.url);
    return this.videoRepository.update(videoId, { thumbnailUrl });
  }

  async generateTranscription(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    const transcription = await this.videoProcessingService.generateTranscription(video.url);
    return this.videoRepository.update(videoId, { transcription });
  }

  async processVideo(videoId: string) {
    const video = await this.videoRepository.findById(videoId);
    if (!video) {
      throw new NotFoundError('Video not found');
    }

    // Update status to processing
    await this.updateVideoStatus(videoId, 'processing');

    try {
      // Generate thumbnail
      await this.generateThumbnail(videoId);

      // Generate transcription
      await this.generateTranscription(videoId);

      // Update status to ready
      await this.updateVideoStatus(videoId, 'ready');
    } catch (error) {
      // Update status to error
      await this.updateVideoStatus(videoId, 'error');
      throw error;
    }
  }
} 