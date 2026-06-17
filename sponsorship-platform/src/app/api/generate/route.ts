import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '', 
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { company } = body;
        if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
            { success: false, error: "Anthropic API key is missing from .env.local. Please add it." },
            { status: 500 }
        );
        }
        const systemPrompt = `You are an expert B2B sponsorship outreach specialist for VinnovateIT, the flagship tech organization at VIT Vellore.

    ## About VinnovateIT
    - Flagship student tech organization at VIT Vellore
    - Organizes VinHack 2026, a 36-hour hackathon with 800+ participants (developers, designers, builders)
    - Built platforms: MessIT (35K+ users), StudyHub (30K+ users), Atlas (5K+ users)
    - Collective reach: 40,000+ students across all initiatives

    ## Your Task
    When given a company's details, you will:
    1. Analyze the company's fit as a VinHack 2026 sponsor
    2. Generate 4 personalized outreach email variations
    3. Return a structured JSON response only — no preamble, no markdown fences

    ## Tone & Style Rules
    - Professional but warm — founder/business-friendly, not salesy
    - Specific to the company — never generic
    - Concise — email body between 180–250 words
    - Never mention AI, templates, or that this was auto-generated
    - No hollow phrases like "I hope this finds you well" or "exciting opportunity"
    - Connect the company's real goals to our audience explicitly
    - Each variation must feel meaningfully different — not just the same email reworded`;

        const userPrompt = `Generate a sponsorship outreach analysis and 4 email variations for the following company.

    ## Company Details
    - Company Name: ${company.name}
    - Website: ${company.website || 'Not provided'}
    - Industry: ${company.industry || 'Not provided'}

    ## Instructions
    Use the company name and website to infer:
    - What the company does and its core products/services
    - Target audience and business goals
    - Hiring needs, developer ecosystem, or student engagement activity
    - CSR or community initiatives if applicable
    - Any relevant recent news or product launches

    Then return ONLY a valid JSON object in this exact structure:
    {
    "analysis": {
        "summary": "2–3 sentence summary of what the company does",
        "industry": "Industry label",
        "fitScore": 85,
        "fitReason": "Why this company is a strong or weak fit for VinHack 2026 sponsorship",
        "recommendedAngle": "The single most compelling sponsorship angle for this company",
        "partnershipOpportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"]
    },
    "emailVariations": [
        { "version": "A", "focus": "Talent & Recruitment", "subject": "Subject line here", "body": "Full email body here. Sign off as:\\n\\nWarm regards,\\nVarun B\\nChairperson, VinnovateIT\\nVIT Vellore" },
        { "version": "B", "focus": "Brand Visibility", "subject": "Subject line here", "body": "Full email body here. Sign off as:\\n\\nWarm regards,\\nVarun B\\nChairperson, VinnovateIT\\nVIT Vellore" },
        { "version": "C", "focus": "Community Engagement", "subject": "Subject line here", "body": "Full email body here. Sign off as:\\n\\nWarm regards,\\nVarun B\\nChairperson, VinnovateIT\\nVIT Vellore" },
        { "version": "D", "focus": "Strategic Partnership", "subject": "Subject line here", "body": "Full email body here. Sign off as:\\n\\nWarm regards,\\nVarun B\\nChairperson, VinnovateIT\\nVIT Vellore" }
    ],
    "followUpSuggestions": ["Follow-up line 1", "Follow-up line 2"]
    }`;
        const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
            { role: "user", content: userPrompt }
        ],
        });

        // @ts-expect-error - The SDK types can be slightly vague, but we know text exists on this message type
        const responseText = msg.content[0].text;
        const cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const generatedData = JSON.parse(cleanJsonString);
        return NextResponse.json({ success: true, data: generatedData });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
        { success: false, error: error.message || "Failed to generate content" },
        { status: 500 }
        );
    }
}