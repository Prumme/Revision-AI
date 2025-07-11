import { Document, Schema, Types } from 'mongoose';

export const SessionSchema = new Schema({
  id: { type: String, unique: true, required: true },
  quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now, required: true },
  finishedAt: { type: Date, default: null },
  status: { type: String, enum: ['pending', 'active', 'paused', 'finished'], default: 'pending' },
  answers: [
    {
      c: { type: Boolean, required: true },
      a: { type: String, required: true },
      _id: false,
    },
  ],
});

export interface SessionDocument extends Document {
  _id: Types.ObjectId;
  quizId: Types.ObjectId;
  userId: Types.ObjectId;
  score: number;
  startedAt: Date;
  finishedAt?: Date | null;
  status: 'pending' | 'active' | 'paused' | 'finished';
  answers: { correct: boolean; a: string }[];
}