import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  companyId: mongoose.Types.ObjectId;
  type: 'research_generated' | 'email_generated' | 'email_sent' | 'reply_received' | 'status_changed' | 'meeting_scheduled';
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any; 
  createdAt: Date;
}
const ActivitySchema = new Schema<IActivity>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['research_generated', 'email_generated', 'email_sent', 'reply_received', 'status_changed', 'meeting_scheduled'] 
  },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);