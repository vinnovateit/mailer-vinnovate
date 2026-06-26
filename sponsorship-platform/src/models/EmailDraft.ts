import mongoose, { Schema, Document } from 'mongoose';
export interface IEmailDraft extends Document {
  companyId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  version: 'A' | 'B' | 'C' | 'D';
  selected: boolean;
}
const EmailDraftSchema = new Schema<IEmailDraft>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  version: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  selected: { type: Boolean, default: false }
}, { timestamps: true });
export const EmailDraft = mongoose.models.EmailDraft || mongoose.model<IEmailDraft>('EmailDraft', EmailDraftSchema);