import { Document, Schema, Types } from 'mongoose';
import { FileContentDTO } from '../../../types/FileContentDTO';

export const CachedFileParsedSchema = new Schema({
  checksum: { type: String, required: true },
  identifier: { type: String, required: true },
  fileContent: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface CachedFileParsedDocument extends Document {
  _id: Types.ObjectId;
  checksum: string;
  identifier: string;
  fileContent: FileContentDTO; // Adjust type as needed based on FileContentDTO structure
  createdAt: Date;
  updatedAt: Date;
}
