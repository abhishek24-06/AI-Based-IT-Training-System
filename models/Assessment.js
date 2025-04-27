const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    explanation: String,
    points: {
      type: Number,
      default: 1
    }
  }],
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isRandomized: {
    type: Boolean,
    default: true
  },
  showAnswers: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total points for the assessment
assessmentSchema.methods.calculateTotalPoints = function() {
  return this.questions.reduce((total, question) => total + question.points, 0);
};

// Method to calculate score percentage
assessmentSchema.methods.calculateScorePercentage = function(correctAnswers) {
  const totalPoints = this.calculateTotalPoints();
  return (correctAnswers / totalPoints) * 100;
};

module.exports = mongoose.model('Assessment', assessmentSchema); 