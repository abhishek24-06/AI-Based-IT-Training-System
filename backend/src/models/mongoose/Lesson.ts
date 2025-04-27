import { Schema, model, Document } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description: string;
  courseId: Schema.Types.ObjectId;
  order: number;
  videos: Schema.Types.ObjectId[];
  quizzes: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    quizzes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Lesson = model<ILesson>("Lesson", lessonSchema);
