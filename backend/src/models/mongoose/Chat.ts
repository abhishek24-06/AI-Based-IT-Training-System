import { Schema, model, Document } from 'mongoose';

interface IChat extends Document {
  userId: Schema.Types.ObjectId;
  message: string;
  response: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = model<IChat>('Chat', chatSchema); 