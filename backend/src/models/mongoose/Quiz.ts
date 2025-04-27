import { Schema, model, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  lessonId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    questions: [{
      text: {
        type: String,
        required: true,
      },
      options: [{
        type: String,
        required: true,
      }],
      correctAnswer: {
        type: Number,
        required: true,
      },
    }],
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Quiz = model<IQuiz>('Quiz', quizSchema); 