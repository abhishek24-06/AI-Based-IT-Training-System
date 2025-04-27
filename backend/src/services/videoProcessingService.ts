import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import { FileStorageService } from './fileStorageService';
import { NotFoundError } from '../errors/NotFoundError';

const execAsync = promisify(exec);

export class VideoProcessingService {
  private fileStorageService: FileStorageService;

  constructor() {
    this.fileStorageService = new FileStorageService();
  }

  async getVideoDuration(videoUrl: string): Promise<number> {
    try {
      const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoUrl}"`);
      return Math.floor(parseFloat(stdout));
    } catch (error) {
      throw new Error('Failed to get video duration');
    }
  }

  async generateThumbnail(videoUrl: string): Promise<string> {
    try {
      const thumbnailPath = `thumbnails/${Date.now()}.jpg`;
      
      await execAsync(`ffmpeg -i "${videoUrl}" -ss 00:00:01 -vframes 1 "${thumbnailPath}"`);
      
      const thumbnailUrl = await this.fileStorageService.uploadThumbnail(thumbnailPath);
      
      // Clean up temporary file
      await execAsync(`rm "${thumbnailPath}"`);
      
      return thumbnailUrl;
    } catch (error) {
      throw new Error('Failed to generate thumbnail');
    }
  }

  async generateTranscription(videoUrl: string): Promise<string> {
    try {
      // Extract audio from video
      const audioPath = `temp/${Date.now()}.wav`;
      await execAsync(`ffmpeg -i "${videoUrl}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`);
      
      // Use speech-to-text service to generate transcription
      const transcription = await this.speechToText(audioPath);
      
      // Clean up temporary file
      await execAsync(`rm "${audioPath}"`);
      
      return transcription;
    } catch (error) {
      throw new Error('Failed to generate transcription');
    }
  }

  private async speechToText(audioPath: string): Promise<string> {
    // Implement speech-to-text using a service like Google Cloud Speech-to-Text
    // or AWS Transcribe
    // This is a placeholder implementation
    return 'Transcription placeholder';
  }

  async processVideo(videoId: string, videoUrl: string) {
    try {
      // Get video duration
      const duration = await this.getVideoDuration(videoUrl);
      
      // Generate thumbnail
      const thumbnailUrl = await this.generateThumbnail(videoUrl);
      
      // Generate transcription
      const transcription = await this.generateTranscription(videoUrl);
      
      return {
        duration,
        thumbnailUrl,
        transcription
      };
    } catch (error) {
      throw new Error('Failed to process video');
    }
  }

  async extractAudio(videoUrl: string, outputPath: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoUrl}" -vn -acodec libmp3lame "${outputPath}"`);
    } catch (error) {
      throw new Error('Failed to extract audio');
    }
  }

  async compressVideo(videoUrl: string, outputPath: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoUrl}" -vf scale=1280:720 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k "${outputPath}"`);
    } catch (error) {
      throw new Error('Failed to compress video');
    }
  }

  async createVideoPreview(videoUrl: string, outputPath: string, duration: number = 10): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoUrl}" -t ${duration} -c copy "${outputPath}"`);
    } catch (error) {
      throw new Error('Failed to create video preview');
    }
  }

  async addWatermark(videoUrl: string, watermarkPath: string, outputPath: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoUrl}" -i "${watermarkPath}" -filter_complex "overlay=10:10" "${outputPath}"`);
    } catch (error) {
      throw new Error('Failed to add watermark');
    }
  }

  async convertFormat(videoUrl: string, outputPath: string, format: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoUrl}" "${outputPath}.${format}"`);
    } catch (error) {
      throw new Error('Failed to convert video format');
    }
  }
} 