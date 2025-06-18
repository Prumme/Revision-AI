import { Answer } from '@common/types/answer';
import { Question } from '@common/types/question';
import { Schema, Document, Types } from 'mongoose';

export const QuizSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  questions: [
    {
      label: { type: String, required: true },
      choices: [
        {
          label: { type: String, required: true },
          correct: { type: Boolean, required: true },
        },
      ],
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface QuizDocument extends Document {
  _id: Types.ObjectId;
  userId: string;
  name: string;
  description: string;
  questions: Question[];
  tags: string[];
  rigorScore: number;
  public: boolean;
  answers: Answer[];
  context: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}
