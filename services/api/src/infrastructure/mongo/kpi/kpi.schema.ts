import { Document, Schema } from 'mongoose';

export const KpiSchema = new Schema({
  quizId: { type: String, required: true, index: true },
  averageScore: { type: Number, required: true },
  totalSessions: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  averageDuration: { type: Number, required: true },
});

export interface KpiDocument extends Document {
  quizId: string;
  averageScore: number;
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
}

