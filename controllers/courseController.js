const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};

    // Apply filters if provided
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName')
      .populate('ratings.userId', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user.id
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await course.remove();
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add rating to course
exports.addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has already rated
    const existingRating = course.ratings.find(
      r => r.userId.toString() === req.user.id
    );

    if (existingRating) {
      return res.status(400).json({ message: 'Course already rated' });
    }

    course.ratings.push({
      userId: req.user.id,
      rating,
      review
    });

    course.updateAverageRating();
    await course.save();

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get course recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('enrolledCourses.courseId');
    
    // Get user's preferred topics and difficulty
    const { topics, difficulty } = user.preferences;
    
    // Get courses that match user preferences and not already enrolled
    const enrolledCourseIds = user.enrolledCourses.map(ec => ec.courseId._id);
    
    const recommendedCourses = await Course.find({
      _id: { $nin: enrolledCourseIds },
      category: { $in: topics },
      difficulty: difficulty,
      isPublished: true
    })
    .sort({ averageRating: -1, totalEnrollments: -1 })
    .limit(5);

    res.json(recommendedCourses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 