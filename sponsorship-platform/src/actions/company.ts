'use server'
import connectToDatabase from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { revalidatePath } from 'next/cache';
export interface UploadCompanyInput {
    name: string;
    email: string;
    website?: string;
    industry?: string;
    contactName?: string;
}
export async function uploadCompanies(companies: UploadCompanyInput[]) {
    try {
        await connectToDatabase();
        const formattedCompanies = companies.map(company => ({
        name: company.name,
        website: company.website,
        industry: company.industry,
        notes: company.contactName ? `Contact: ${company.contactName}` : '',
        status: 'lead'
        }));
        await Company.insertMany(formattedCompanies);
        revalidatePath('/');
        return { success: true, count: companies.length };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.error("Error uploading companies:", error);
        return { success: false, error: error.message };
    }
}
export async function getCompanies() {
  try {
    await connectToDatabase();
    const companies = await Company.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(companies));
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}