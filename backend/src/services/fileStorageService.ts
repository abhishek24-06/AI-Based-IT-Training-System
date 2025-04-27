import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const pipelineAsync = promisify(pipeline);

export class FileStorageService {
  private s3: S3;
  private bucketName: string;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
    this.bucketName = process.env.AWS_BUCKET_NAME || 'your-bucket-name';
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    try {
      const key = `videos/${Date.now()}-${file.originalname}`;
      
      await this.s3.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error('Failed to upload video');
    }
  }

  async uploadThumbnail(filePath: string): Promise<string> {
    try {
      const key = `thumbnails/${Date.now()}.jpg`;
      
      await this.s3.upload({
        Bucket: this.bucketName,
        Key: key,
        Body: await this.readFile(filePath),
        ContentType: 'image/jpeg'
      }).promise();

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error('Failed to upload thumbnail');
    }
  }

  async uploadCaptions(file: Express.Multer.File): Promise<string> {
    try {
      const key = `captions/${Date.now()}-${file.originalname}`;
      
      await this.s3.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      }).promise();

      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw new Error('Failed to upload captions');
    }
  }

  async deleteVideo(url: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(url);
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error('Failed to delete video');
    }
  }

  async deleteThumbnail(url: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(url);
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error('Failed to delete thumbnail');
    }
  }

  async deleteCaptions(url: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(url);
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();
    } catch (error) {
      throw new Error('Failed to delete captions');
    }
  }

  async getVideoStream(url: string): Promise<Readable> {
    try {
      const key = this.getKeyFromUrl(url);
      const response = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      return Readable.from(response.Body as Buffer);
    } catch (error) {
      throw new Error('Failed to get video stream');
    }
  }

  async getVideoThumbnail(url: string): Promise<Buffer> {
    try {
      const key = this.getKeyFromUrl(url);
      const response = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      return response.Body as Buffer;
    } catch (error) {
      throw new Error('Failed to get video thumbnail');
    }
  }

  async downloadFile(url: string, destination: string): Promise<void> {
    try {
      const key = this.getKeyFromUrl(url);
      const response = await this.s3.getObject({
        Bucket: this.bucketName,
        Key: key
      }).promise();

      await mkdir(join(destination, '..'), { recursive: true });
      const writeStream = createWriteStream(destination);
      
      await pipelineAsync(
        Readable.from(response.Body as Buffer),
        writeStream
      );
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }

  private getKeyFromUrl(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  }

  private async readFile(filePath: string): Promise<Buffer> {
    const { readFile } = await import('fs/promises');
    return readFile(filePath);
  }
} 