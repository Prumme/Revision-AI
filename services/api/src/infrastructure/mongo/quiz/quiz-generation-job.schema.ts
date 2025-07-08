import { Document, Schema, Types } from 'mongoose';
import { FileContentDTO } from '../../../types/FileContentDTO';
import { QuizGenerationJobStatus } from '@entities/quiz-generation-job.entity';

export const QuizGenerationJobSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  quizId: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(QuizGenerationJobStatus),
    default: QuizGenerationJobStatus.PENDING,
  },
  events: [
    {
      error: { type: Boolean, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  files: [
    {
      identifier: { type: String, required: true },
      parsed: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface QuizGenerationJobDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  userId: string;
  quizId: string;
  status: QuizGenerationJobStatus;
  events: {
    error: boolean;
    message: string;
    timestamp: Date;
  }[];
  files: {
    identifier: string;
    parsed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
