import { Video } from '../models/Video';
import { AppDataSource } from '../data-source';
import { Repository } from 'typeorm';
import { NotFoundError } from '../errors/NotFoundError';

export class VideoRepository {
  private repository: Repository<Video>;

  constructor() {
    this.repository = AppDataSource.getRepository(Video);
  }

  async findMany(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [videos, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      relations: ['user'],
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findById(id: string) {
    const video = await this.repository.findOne({
      where: { id },
      relations: ['user']
    });

    if (!video) {
      throw new NotFoundError('Video not found');
    }

    return video;
  }

  async create(data: Partial<Video>) {
    const video = this.repository.create(data);
    return this.repository.save(video);
  }

  async update(id: string, data: Partial<Video>) {
    const video = await this.findById(id);
    Object.assign(video, data);
    return this.repository.save(video);
  }

  async delete(id: string) {
    const video = await this.findById(id);
    await this.repository.remove(video);
  }

  async getVideoAnalytics(videoId: string) {
    const video = await this.findById(videoId);

    const [views, likes, comments] = await Promise.all([
      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.views', 'view')
        .where('video.id = :videoId', { videoId })
        .getCount(),

      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.likes', 'like')
        .where('video.id = :videoId', { videoId })
        .getCount(),

      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.comments', 'comment')
        .where('video.id = :videoId', { videoId })
        .getCount()
    ]);

    return {
      views,
      likes,
      comments,
      engagementRate: ((likes + comments) / views) * 100 || 0
    };
  }

  async getVideosByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [videos, total] = await this.repository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    return {
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPopularVideos(limit: number = 10) {
    return this.repository
      .createQueryBuilder('video')
      .leftJoinAndSelect('video.views', 'view')
      .groupBy('video.id')
      .orderBy('COUNT(view.id)', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getRecentVideos(limit: number = 10) {
    return this.repository.find({
      order: {
        createdAt: 'DESC'
      },
      take: limit
    });
  }

  async searchVideos(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [videos, total] = await this.repository
      .createQueryBuilder('video')
      .where('video.title LIKE :query', { query: `%${query}%` })
      .orWhere('video.description LIKE :query', { query: `%${query}%` })
      .skip(skip)
      .take(limit)
      .orderBy('video.createdAt', 'DESC')
      .getManyAndCount();

    return {
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getVideoStats() {
    const [totalVideos, totalViews, totalLikes, totalComments] = await Promise.all([
      this.repository.count(),
      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.views', 'view')
        .getCount(),
      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.likes', 'like')
        .getCount(),
      this.repository
        .createQueryBuilder('video')
        .leftJoinAndSelect('video.comments', 'comment')
        .getCount()
    ]);

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      averageEngagement: ((totalLikes + totalComments) / totalViews) * 100 || 0
    };
  }
} 