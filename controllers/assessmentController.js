const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all assessments
exports.getAllAssessments = async (req, res) => {
  try {
    const { courseId, difficulty } = req.query;
    let query = {};

    if (courseId) query.courseId = courseId;
    if (difficulty) query.difficulty = difficulty;

    const assessments = await Assessment.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json(assessments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assessment by ID
exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('moduleId', 'title');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new assessment
exports.createAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assessment = new Assessment(req.body);
    await assessment.save();

    res.status(201).json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update assessment
exports.updateAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedAssessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    await assessment.remove();
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assessment answers
exports.submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = assessment.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = question.options[userAnswer]?.isCorrect;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question._id,
        userAnswer,
        isCorrect,
        correctAnswer: question.options.findIndex(opt => opt.isCorrect)
      };
    });

    const score = assessment.calculateScorePercentage(correctAnswers);
    const passed = score >= assessment.passingScore;

    // Update user's quiz scores
    const user = await User.findById(req.user.id);
    user.quizScores.push({
      quizId: assessment._id,
      score,
      date: Date.now()
    });
    await user.save();

    res.json({
      score,
      passed,
      results,
      feedback: passed ? 'Congratulations! You passed the assessment.' : 'You need to improve your score to pass.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's assessment history
exports.getAssessmentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('quizScores.quizId', 'title courseId');

    res.json(user.quizScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get adaptive assessment
exports.getAdaptiveAssessment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { courseId } = req.params;

    // Get user's average score in this course
    const courseScores = user.quizScores.filter(
      score => score.quizId.courseId.toString() === courseId
    );
    const averageScore = courseScores.reduce((acc, score) => acc + score.score, 0) / courseScores.length;

    // Determine difficulty level based on performance
    let difficulty = 'beginner';
    if (averageScore >= 80) difficulty = 'advanced';
    else if (averageScore >= 60) difficulty = 'intermediate';

    // Get assessment with appropriate difficulty
    const assessment = await Assessment.findOne({
      courseId,
      difficulty,
      isRandomized: true
    });

    if (!assessment) {
      return res.status(404).json({ message: 'No suitable assessment found' });
    }

    // Randomize questions if needed
    if (assessment.isRandomized) {
      assessment.questions = assessment.questions.sort(() => Math.random() - 0.5);
    }

    res.json(assessment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 