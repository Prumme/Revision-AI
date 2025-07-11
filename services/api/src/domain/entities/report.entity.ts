import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface ReportReason {
  userId: string;
  userName: string;
  reason: string;
  createdAt: Date;
}

@Schema()
export class Report extends Document {
  @Prop({ required: true })
  type: 'user' | 'quiz';

  @Prop({ required: true })
  targetId: string;

  @Prop({ required: true })
  targetName: string;

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        reason: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    required: true,
  })
  reasons: ReportReason[];

  @Prop({ default: false })
  resolved: boolean;

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolvedBy?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
