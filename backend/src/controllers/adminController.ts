import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Course } from "../entity/Course";
import { Assessment } from "../entity/Assessment";
import { Certificate } from "../entity/Certificate";
import { SystemSettings } from "../entity/SystemSettings";
import { Log } from "../entity/Log";
import { Backup } from "../entity/Backup";
import { Op } from "sequelize";
import { Between } from "typeorm";

// User Management
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ["id", "fullName", "email", "role", "isActive", "createdAt"],
      order: { createdAt: "DESC" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = isActive;
    await userRepository.save(user);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await userRepository.remove(user);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Course Approval
export const getPendingCourses = async (req: Request, res: Response) => {
  try {
    const courseRepository = AppDataSource.getRepository(Course);
    const courses = await courseRepository.find({
      where: { status: "pending" },
      relations: ["instructor"],
      order: { createdAt: "DESC" },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending courses" });
  }
};

export const approveCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.status = "approved";
    await courseRepository.save(course);

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to approve course" });
  }
};

export const rejectCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.status = "rejected";
    await courseRepository.save(course);

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to reject course" });
  }
};

// Course Management
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all courses...');
    const courseRepository = AppDataSource.getRepository(Course);
    
    const courses = await courseRepository.find({
      relations: ['instructor'],
      order: { createdAt: 'DESC' }
    });
    
    console.log(`Found ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error('Error in admin getAllCourses:', error);
    res.status(500).json({ 
      message: 'Error fetching courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    // Validate required fields
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ 
        message: "Missing required fields",
        details: {
          title: !title ? "Title is required" : null,
          description: !description ? "Description is required" : null,
          category: !category ? "Category is required" : null
        }
      });
    }

    const courseRepository = AppDataSource.getRepository(Course);
    const userRepository = AppDataSource.getRepository(User);

    // First, get the instructor
    if (!req.user?.userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const instructor = await userRepository.findOne({ where: { id: req.user.userId } });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const courseData = {
      title,
      description,
      category,
      isPublished: req.body.status === 'published',
      instructor,
      status: req.body.status || 'pending',
      difficulty: req.body.difficulty || 'beginner',
      tags: req.body.tags || []
    };

    const course = courseRepository.create(courseData);
    const result = await courseRepository.save(course);
    
    console.log('Course created:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in createCourse:', error);
    res.status(500).json({ 
      message: "Failed to create course",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const courseData = {
      ...req.body,
      isPublished: req.body.status === 'published'
    };

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ 
      where: { id: courseId },
      relations: ['instructor']
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    courseRepository.merge(course, courseData);
    const result = await courseRepository.save(course);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await courseRepository.remove(course);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course" });
  }
};

// Analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const courseRepository = AppDataSource.getRepository(Course);
    const assessmentRepository = AppDataSource.getRepository(Assessment);
    const certificateRepository = AppDataSource.getRepository(Certificate);

    const [
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalAssessments,
      completedAssessments,
      totalCertificates,
      issuedCertificates,
    ] = await Promise.all([
      userRepository.count(),
      userRepository.count({ where: { isActive: true } }),
      courseRepository.count(),
      courseRepository.count({ where: { isPublished: true } }),
      assessmentRepository.count(),
      assessmentRepository.count({ where: { isPublished: true } }),
      certificateRepository.count(),
      certificateRepository.count({ where: { status: "issued" } }),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalCourses,
      publishedCourses,
      totalAssessments,
      completedAssessments,
      totalCertificates,
      issuedCertificates,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// System Settings
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(SystemSettings);
    const settings = await settingsRepository.findOne({ where: {} });
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = settingsRepository.create({
        security: {
          enableEmailVerification: false,
          passwordMinLength: 8,
          sessionTimeout: 30,
          twoFactorAuth: false,
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          notificationFrequency: 'daily',
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600,
          maxUploadSize: 10,
        },
        storage: {
          backupFrequency: 'daily',
          maxBackups: 5,
          storageProvider: 'local',
        },
        siteName: 'AI Based IT Training System',
        siteDescription: 'An advanced IT training platform powered by AI',
        contactEmail: 'contact@aitrainingsystem.com',
        supportEmail: 'support@aitrainingsystem.com',
        maxFileSize: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
        maintenanceMode: false,
        maintenanceMessage: 'System is under maintenance. Please try again later.',
        enableRegistration: true,
        enablePasswordReset: true,
        maxLoginAttempts: 5,
        passwordExpiryDays: 90,
      });
      
      const savedSettings = await settingsRepository.save(defaultSettings);
      return res.json(savedSettings);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error in getSystemSettings:', error);
    res.status(500).json({ message: "Failed to fetch system settings" });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const settingsRepository = AppDataSource.getRepository(SystemSettings);
    const existingSettings = await settingsRepository.findOne({ where: {} });
    
    if (!existingSettings) {
      const newSettings = settingsRepository.create(req.body);
      const result = await settingsRepository.save(newSettings);
      return res.json(result);
    }
    
    settingsRepository.merge(existingSettings, req.body);
    const result = await settingsRepository.save(existingSettings);
    res.json(result);
  } catch (error) {
    console.error('Error in updateSystemSettings:', error);
    res.status(500).json({ message: "Failed to update system settings" });
  }
};

// Logs
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const { level, startDate, endDate, page = 1, limit = 10 } = req.query;

    const logRepository = AppDataSource.getRepository(Log);
    const where: any = {};
    if (level) where.level = level;
    if (startDate && endDate) {
      where.createdAt = Between(
        new Date(startDate as string),
        new Date(endDate as string)
      );
    }

    const [logs, total] = await logRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch system logs" });
  }
};

export const getErrorLogs = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const logRepository = AppDataSource.getRepository(Log);
    const where: any = { level: "error" };
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [
          new Date(startDate as string),
          new Date(endDate as string),
        ],
      };
    }

    const [logs, total] = await logRepository.findAndCount({
      where,
      order: { createdAt: "DESC" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch error logs" });
  }
};

// Backup and Restore
export const createBackup = async (req: Request, res: Response) => {
  try {
    const backupRepository = AppDataSource.getRepository(Backup);
    const backup = backupRepository.create({
      filename: `backup-${Date.now()}.sql`,
      status: "completed",
      createdBy: (req as any).user?.id,
    });

    // TODO: Implement actual backup creation logic
    // This would typically involve:
    // 1. Dumping the database
    // 2. Compressing the dump
    // 3. Storing it in a secure location
    // 4. Updating the backup record with the file path

    const result = await backupRepository.save(backup);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create backup" });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  try {
    const { backupId } = req.params;
    const backupRepository = AppDataSource.getRepository(Backup);
    
    const backup = await backupRepository.findOne({ where: { id: backupId } });
    if (!backup) {
      return res.status(404).json({ message: "Backup not found" });
    }

    backup.status = "restored";
    await backupRepository.save(backup);

    res.json({ message: "Backup restored successfully" });
  } catch (error) {
    console.error('Error in restoreBackup:', error);
    res.status(500).json({ 
      message: "Failed to restore backup",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
