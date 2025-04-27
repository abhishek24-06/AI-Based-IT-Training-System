import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entity/Course';

const courseRepository = AppDataSource.getRepository(Course);

export const courseController = {
  getAllCourses: async (req: Request, res: Response) => {
    try {
      // For students, only return published courses
      const isStudent = req.user?.role === 'student';
      const where = isStudent ? { isPublished: true } : {};
      
      const courses = await courseRepository.find({
        where,
        relations: ['instructor'],
        order: { createdAt: 'DESC' }
      });
      
      // If no courses found and user is a student, return empty array instead of error
      if (isStudent && (!courses || courses.length === 0)) {
        return res.json([]);
      }
      
      res.json(courses);
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      res.status(500).json({ message: 'Error fetching courses', error });
    }
  },

  getCourseById: async (req: Request, res: Response) => {
    try {
      const course = await courseRepository.findOne({ 
        where: { id: req.params.id },
        relations: ['instructor']
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course', error });
    }
  },

  createCourse: async (req: Request, res: Response) => {
    try {
      const courseData = {
        ...req.body,
        isPublished: req.body.status === 'published',
        instructor: { id: req.user?.userId }
      };
      
      const course = courseRepository.create(courseData);
      const result = await courseRepository.save(course);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating course', error });
    }
  },

  updateCourse: async (req: Request, res: Response) => {
    try {
      const course = await courseRepository.findOne({ 
        where: { id: req.params.id },
        relations: ['instructor']
      });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const courseData = {
        ...req.body,
        isPublished: req.body.status === 'published'
      };

      courseRepository.merge(course, courseData);
      const result = await courseRepository.save(course);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating course', error });
    }
  },

  deleteCourse: async (req: Request, res: Response) => {
    try {
      const course = await courseRepository.findOne({ where: { id: req.params.id } });
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      await courseRepository.remove(course);
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting course', error });
    }
  }
}; 