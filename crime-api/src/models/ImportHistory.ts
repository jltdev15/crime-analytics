import { Schema, model, Document } from 'mongoose';

export interface IImportHistory extends Document {
  type: 'crime_data' | 'population_data';
  filename: string;
  totalRows: number;
  processedRows?: number;
  importedCount?: number;
  skippedCount?: number;
  upsertedCount?: number;
  modifiedCount?: number;
  duplicatesSkipped?: number;
  retrainedAI?: boolean;
  importedAt: Date;
}

const ImportHistorySchema = new Schema<IImportHistory>({
  type: { type: String, enum: ['crime_data', 'population_data'], required: true },
  filename: { type: String, required: true },
  totalRows: { type: Number, required: true },
  processedRows: { type: Number },
  importedCount: { type: Number },
  skippedCount: { type: Number },
  upsertedCount: { type: Number },
  modifiedCount: { type: Number },
  duplicatesSkipped: { type: Number },
  retrainedAI: { type: Boolean, default: false },
  importedAt: { type: Date, default: Date.now }
});

export default model<IImportHistory>('ImportHistory', ImportHistorySchema);


