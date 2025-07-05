import { Document, Schema, Types } from 'mongoose';

export const SessionSchema = new Schema({
  quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  startedAt: { type: Date, default: Date.now, required: true },
  finishedAt: { type: Date, default: null },
  answers: [
    {
      correct: { type: Boolean, required: true },
      a: { type: String, required: true },
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
  answers: { correct: boolean; a: string }[];
}