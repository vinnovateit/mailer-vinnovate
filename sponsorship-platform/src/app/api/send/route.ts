import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectToDatabase from '@/lib/mongodb';
import { Company } from '@/models/Company';
import { EmailDraft } from '@/models/EmailDraft';
import { Activity } from '@/models/Activity';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { companyId, toEmail, subject, body: emailBody, version } = body;

        if (!companyId || !toEmail || !subject || !emailBody) {
        return NextResponse.json(
            { success: false, error: "Missing required fields for dispatch." },
            { status: 400 }
        );
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return NextResponse.json(
            { success: false, error: "Server missing email credentials in .env.local" },
            { status: 500 }
        );
        }

        await connectToDatabase();

        const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        });

        await transporter.sendMail({
        from: `"VinnovateIT Sponsorships" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subject,
        text: emailBody,
        html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${emailBody}</div>`, 
        });

        await Company.findByIdAndUpdate(companyId, { 
        status: 'contacted',
        updatedAt: new Date()
        });

        const savedDraft = await EmailDraft.create({
        companyId: companyId,
        subject: subject,
        body: emailBody,
        version: version,
        status: 'sent',
        sentAt: new Date()
        });

        await Activity.create({
        companyId: companyId,
        type: 'email_sent',
        description: `Sent Version ${version} email.`,
        metadata: { draftId: savedDraft._id }
        });

        return NextResponse.json({ 
        success: true, 
        message: "Email dispatched and synchronized with database." 
        });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        catch (error: any) {
        console.error("Dispatch Error:", error);
        return NextResponse.json(
        { success: false, error: error.message || "Failed to transmit email." },
        { status: 500 }
        );
    }
}