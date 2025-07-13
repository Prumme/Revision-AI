import { Document, Schema, Types } from 'mongoose';
import { UploadedDocument } from '@entities/document.entity';

export const QuizSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: '' },
  questions: [
    {
      q: { type: String, required: true },
      answers: [
        {
          a: { type: String, required: true },
          c: { type: Boolean, required: true },
        },
      ],
    },
  ],
  questionsNumbers: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  media: [
    {
      checksum: { type: String, required: true },
      identifier: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
    },
  ],
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
  username: string;
  title: string;
  category: string;
  questions: {
    q: string;
    answers: {
      a: string;
      c: boolean;
    }[];
  }[];
  questionsNumbers: number;
  description: string;
  isPublic: boolean;
  media: UploadedDocument[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
