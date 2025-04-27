import { User } from '../models/User';
import { Course } from '../models/Course';
import { Assessment } from '../models/Assessment';
import { Certificate } from '../models/Certificate';
import { Enrollment } from '../models/Enrollment';
import { Progress } from '../models/Progress';
import { Feedback } from '../models/Feedback';
import { QuizAttempt } from '../models/mongoose/QuizAttempt';
import { Quiz } from '../models/mongoose/Quiz';
import { Types } from 'mongoose';

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

interface QuizAnalytics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  topPerformers: Array<{
    userId: Types.ObjectId;
    name: string;
    score: number;
  }>;
  questionPerformance: Array<{
    questionId: Types.ObjectId;
    correctAnswers: number;
    totalAttempts: number;
    difficulty: number;
  }>;
}

interface UserAnalytics {
  totalQuizzes: number;
  averageScore: number;
  completionRate: number;
  timeSpent: number;
  progress: Array<{
    quizId: Types.ObjectId;
    title: string;
    score: number;
    attempts: number;
  }>;
}

interface SystemAnalytics {
  activeUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
  averageCompletionTime: number;
  popularQuizzes: Array<{
    quizId: Types.ObjectId;
    title: string;
    attempts: number;
    averageScore: number;
  }>;
}

export class AnalyticsService {
  /**
   * Get analytics for a specific quiz
   */
  async getQuizAnalytics(quizId: string, timeRange?: TimeRange): Promise<QuizAnalytics> {
    const matchStage = {
      quizId: new Types.ObjectId(quizId),
      ...(timeRange && {
        completedAt: {
          $gte: timeRange.startDate,
          $lte: timeRange.endDate
        }
      })
    };

    const [
      totalAttempts,
      averageScore,
      passRate,
      averageTimeSpent,
      topPerformers,
      questionPerformance
    ] = await Promise.all([
      QuizAttempt.countDocuments(matchStage),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            passed: { $sum: { $cond: ['$passed', 1, 0] } }
          }
        }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            score: { $max: '$score' }
          }
        },
        { $sort: { score: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            name: '$user.name',
            score: 1
          }
        }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $unwind: '$answers' },
        {
          $group: {
            _id: '$answers.questionId',
            correctAnswers: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
            totalAttempts: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: '_id',
            as: 'question'
          }
        },
        { $unwind: '$question' },
        {
          $project: {
            questionId: '$_id',
            correctAnswers: 1,
            totalAttempts: 1,
            difficulty: '$question.difficulty'
          }
        }
      ])
    ]);

    return {
      totalAttempts,
      averageScore: averageScore[0]?.avgScore || 0,
      passRate: passRate[0] ? (passRate[0].passed / passRate[0].total) * 100 : 0,
      averageTimeSpent: averageTimeSpent[0]?.avgTime || 0,
      topPerformers,
      questionPerformance
    };
  }

  /**
   * Get analytics for a specific user
   */
  async getUserAnalytics(userId: string, timeRange?: TimeRange): Promise<UserAnalytics> {
    const matchStage = {
      userId: new Types.ObjectId(userId),
      ...(timeRange && {
        completedAt: {
          $gte: timeRange.startDate,
          $lte: timeRange.endDate
        }
      })
    };

    const [
      totalQuizzes,
      averageScore,
      completionRate,
      timeSpent,
      progress
    ] = await Promise.all([
      QuizAttempt.distinct('quizId', matchStage).then(ids => ids.length),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$quizId',
            attempts: { $sum: 1 },
            completed: { $sum: { $cond: ['$completedAt', 1, 0] } }
          }
        }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$quizId',
            score: { $max: '$score' },
            attempts: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        {
          $project: {
            quizId: '$_id',
            title: '$quiz.title',
            score: 1,
            attempts: 1
          }
        }
      ])
    ]);

    const totalCompleted = completionRate.reduce((sum, quiz) => sum + quiz.completed, 0);
    const totalAttempts = completionRate.reduce((sum, quiz) => sum + quiz.attempts, 0);

    return {
      totalQuizzes,
      averageScore: averageScore[0]?.avgScore || 0,
      completionRate: totalAttempts > 0 ? (totalCompleted / totalAttempts) * 100 : 0,
      timeSpent: timeSpent[0]?.totalTime || 0,
      progress
    };
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(timeRange?: TimeRange): Promise<SystemAnalytics> {
    const matchStage = timeRange ? {
      completedAt: {
        $gte: timeRange.startDate,
        $lte: timeRange.endDate
      }
    } : {};

    const [
      activeUsers,
      totalQuizzes,
      totalAttempts,
      averageCompletionTime,
      popularQuizzes
    ] = await Promise.all([
      QuizAttempt.distinct('userId', matchStage).then(ids => ids.length),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(matchStage),
      QuizAttempt.aggregate([
        { $match: matchStage },
        { $group: { _id: null, avgTime: { $avg: '$timeSpent' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$quizId',
            attempts: { $sum: 1 },
            averageScore: { $avg: '$score' }
          }
        },
        { $sort: { attempts: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        {
          $project: {
            quizId: '$_id',
            title: '$quiz.title',
            attempts: 1,
            averageScore: 1
          }
        }
      ])
    ]);

    return {
      activeUsers,
      totalQuizzes,
      totalAttempts,
      averageCompletionTime: averageCompletionTime[0]?.avgTime || 0,
      popularQuizzes
    };
  }
} 