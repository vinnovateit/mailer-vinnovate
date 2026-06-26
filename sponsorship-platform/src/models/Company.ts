import mongoose, {Document, Schema} from 'mongoose';
export interface ICompany extends Document {
    name: string;
    website?: string;
    industry?: string;
    fitScore?: number;
    summary?: string;
    partnershipAngle?: string;
    status: 'lead' | 'researching' | 'research_complete' | 'email_generated' | 'contacted' | 'replied' | 'discussion' | 'meeting_scheduled' | 'negotiation' | 'confirmed' | 'closed';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
const CompanySchema=new Schema<ICompany>({
    name: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    fitScore: { type: Number, min: 0, max: 100 },
    summary: { type: String },
    partnershipAngle: { type: String },
    status:{ 
        type: String, 
        required: true, 
        enum: ['lead', 'researching', 'research_complete', 'email_generated', 'contacted', 'replied', 'discussion', 'meeting_scheduled', 'negotiation', 'confirmed', 'closed'],
        default: 'lead' },
    notes: { type: String }
}, { timestamps: true });
export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);