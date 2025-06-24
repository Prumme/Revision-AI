import { Document, Schema, Types } from 'mongoose';

export const QuizSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  questions: [
    {
      q: { type: String, required: true },
      answers: [
        {
          a: { type: String, required: true },
          correct: { type: Boolean, required: true },
        },
      ],
    },
  ],
  questionsNumbers: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  media: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface QuizDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  category: string;
  questions: {
    q: string;
    answers: {
      a: string;
      correct: boolean;
    }[];
  }[];
  questionsNumbers: number;
  description: string;
  isPublic: boolean;
  media: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
