import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Quiz } from '@entities/quiz.entity';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Quiz | Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: Date, required: true })
  startedAt: Date;

  @Prop({ type: Date, required: false, default: null })
  finishedAt?: Date | null;

  @Prop({
    type: [
      {
        correct: { type: Boolean, required: true },
        a: { type: String, required: true },
      },
    ],
    required: true,
    default: [],
  })
  answers: { correct: boolean; a: string }[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);
