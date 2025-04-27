import { QuizAttempt } from '../models/mongoose/QuizAttempt';
import { Quiz } from '../models/mongoose/Quiz';
import { User } from '../models/mongoose/User';
import { NotFoundError, ValidationError } from '../utils/errors';
import { Types } from 'mongoose';

interface CreateAttemptData {
  quizId: string;
  userId: string;
  answers: Array<{
    questionId: string;
    answer: string;
    timeSpent: number;
  }>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export class QuizAttemptService {
  /**
   * Create a new quiz attempt
   */
  async createAttempt(data: CreateAttemptData) {
    const quiz = await Quiz.findById(data.quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculate score and check answers
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (const answer of data.answers) {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found`);
      }

      if (question.correctAnswer === answer.answer) {
        correctAnswers++;
      }
    }

    const score = (correctAnswers / totalQuestions) * 100;
    const passed = score >= quiz.passingScore;

    const attempt = new QuizAttempt({
      quizId: data.quizId,
      userId: data.userId,
      score,
      passed,
      timeSpent: data.answers.reduce((sum, a) => sum + a.timeSpent, 0),
      answers: data.answers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.answer,
        timeSpent: answer.timeSpent,
        isCorrect: quiz.questions.find(q => q._id.toString() === answer.questionId)?.correctAnswer === answer.answer
      }))
    });

    await attempt.save();
    return attempt;
  }

  /**
   * Get a quiz attempt by ID
   */
  async getAttemptById(id: string) {
    return QuizAttempt.findById(id)
      .populate('quizId', 'title description')
      .populate('userId', 'name email');
  }

  /**
   * Get all attempts for a user
   */
  async getUserAttempts(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find({ userId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('quizId', 'title description'),
      QuizAttempt.countDocuments({ userId })
    ]);

    return {
      data: attempts,
      total,
      page,
      limit
    } as PaginatedResponse<any>;
  }

  /**
   * Get all attempts for a quiz
   */
  async getQuizAttempts(quizId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find({ quizId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      QuizAttempt.countDocuments({ quizId })
    ]);

    return {
      data: attempts,
      total,
      page,
      limit
    } as PaginatedResponse<any>;
  }

  /**
   * Get user's best attempt for a quiz
   */
  async getBestAttempt(quizId: string) {
    return QuizAttempt.findOne({ quizId })
      .sort({ score: -1 })
      .populate('userId', 'name email')
      .populate('quizId', 'title description');
  }

  /**
   * Get quiz statistics
   */
  async getQuizStatistics(quizId: string) {
    const [
      totalAttempts,
      passedAttempts,
      averageScore,
      averageTimeSpent
    ] = await Promise.all([
      QuizAttempt.countDocuments({ quizId }),
      QuizAttempt.countDocuments({ quizId, passed: true }),
      QuizAttempt.aggregate([
        { $match: { quizId: new Types.ObjectId(quizId) } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: { quizId: new Types.ObjectId(quizId) } },
        { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
      ])
    ]);

    return {
      totalAttempts,
      passedAttempts,
      failedAttempts: totalAttempts - passedAttempts,
      passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
      averageScore: averageScore[0]?.avgScore || 0,
      averageTimeSpent: averageTimeSpent[0]?.avgTime || 0
    };
  }

  /**
   * Delete a quiz attempt
   */
  async deleteAttempt(id: string) {
    const result = await QuizAttempt.findByIdAndDelete(id);
    return !!result;
  }
} 