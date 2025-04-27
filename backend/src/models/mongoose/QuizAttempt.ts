import { Schema, model, Document, Types } from 'mongoose';

export interface IAnswer {
  questionId: Types.ObjectId;
  answer: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  quizId: Types.ObjectId;
  userId: Types.ObjectId;
  score: number;
  passed: boolean;
  timeSpent: number;
  answers: IAnswer[];
  completedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  answers: [{
    questionId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
QuizAttemptSchema.index({ userId: 1, completedAt: -1 });
QuizAttemptSchema.index({ quizId: 1, score: -1 });
QuizAttemptSchema.index({ userId: 1, quizId: 1 });

export const QuizAttempt = model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema); 