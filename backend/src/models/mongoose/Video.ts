import { Schema, model, Document } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  duration: number;
  order: number;
  lessonId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
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

export const Video = model<IVideo>('Video', videoSchema); 