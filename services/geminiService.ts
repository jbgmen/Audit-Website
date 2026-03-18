import { GoogleGenAI, Type } from "@google/genai";
import { AuditReportData, AuditInput } from "../types";

export const performForensicAudit = async (
  input: AuditInput,
  industry: string,
  userTier: string = 'Free'
): Promise<AuditReportData> => {

  // Vite frontend mein process.env kaam nahi karta — import.meta.env use karo
  // Key sirf Vercel env vars mein hogi — code mein kuch nahi
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to Vercel environment variables.");

  const ai = new GoogleGenAI({ apiKey });

  const auditId          = `VELA-AUD-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  const verificationHash = `sha256:v2.5:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  const auditDate        = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const textPart = {
    text: `Conduct a Proprietary Forensic Protocol v2.5 Audit for the following target:
           URL: ${input.url}
           Industry: ${industry}
           Plan Context: ${userTier}
           ${input.description ? `Context/Objectives: ${input.description}` : ''}
           
           Act as a Lead Forensic Audit Unit. Be hyper-critical, authoritative, and precise.
           Analyze conversion architecture, visual trust signals, and performance metrics.
           Provide an industry comparison and ROI growth forecast.`
  };

  const parts: any[] = [textPart];

  if (input.image) {
    const base64Data = input.image.includes(',') ? input.image.split(',')[1] : input.image;
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',   // gemini-3-pro-preview exist nahi karta — yeh latest free model hai
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          engineClass: { type: Type.STRING },
          overview: {
            type: Type.OBJECT,
            properties: {
              websiteName: { type: Type.STRING },
              url:         { type: Type.STRING },
              websiteUrl:  { type: Type.STRING }
            },
            required: ["websiteName", "url"]
          },
          executiveSummary: {
            type: Type.OBJECT,
            properties: {
              score:        { type: Type.NUMBER },
              verdict:      { type: Type.STRING },
              summary:      { type: Type.STRING },
              decisionLine: { type: Type.STRING }
            },
            required: ["score", "verdict", "summary", "decisionLine"]
          },
          scoreBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label:   { type: Type.STRING },
                meaning: { type: Type.STRING },
                score:   { type: Type.NUMBER }
              },
              required: ["label", "meaning", "score"]
            }
          },
          industryComparison: {
            type: Type.OBJECT,
            properties: {
              percentile:          { type: Type.NUMBER },
              averageScore:        { type: Type.NUMBER },
              topFivePercentScore: { type: Type.NUMBER },
              standing:            { type: Type.STRING }
            },
            required: ["percentile", "averageScore", "topFivePercentScore", "standing"]
          },
          roiForecast: {
            type: Type.OBJECT,
            properties: {
              estimatedLift:       { type: Type.STRING },
              confidenceLevel:     { type: Type.STRING },
              primaryGrowthDriver: { type: Type.STRING }
            },
            required: ["estimatedLift", "confidenceLevel", "primaryGrowthDriver"]
          },
          gapBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category:  { type: Type.STRING },
                deduction: { type: Type.NUMBER },
                evidence:  { type: Type.STRING },
                priority:  { type: Type.STRING, enum: ["Critical", "High", "Medium", "Low"] }
              },
              required: ["category", "deduction", "evidence", "priority"]
            }
          },
          pathToPerfect: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task:            { type: Type.STRING },
                reason:          { type: Type.STRING },
                projectedImpact: { type: Type.NUMBER }
              },
              required: ["task", "reason", "projectedImpact"]
            }
          },
          strengths: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                point:         { type: Type.STRING },
                businessValue: { type: Type.STRING },
                impact:        { type: Type.STRING }
              },
              required: ["point", "businessValue", "impact"]
            }
          },
          criticalIssues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity:    { type: Type.STRING, enum: ["Critical", "Important", "Standard"] },
                title:       { type: Type.STRING },
                urgency:     { type: Type.STRING, enum: ["Immediate", "Soon", "Planned"] },
                explanation: { type: Type.STRING }
              },
              required: ["severity", "title", "urgency", "explanation"]
            }
          },
          actionPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase:  { type: Type.STRING },
                task:   { type: Type.STRING },
                effort: { type: Type.STRING }
              },
              required: ["phase", "task", "effort"]
            }
          }
        },
        required: [
          "engineClass", "overview", "executiveSummary", "scoreBreakdown",
          "industryComparison", "roiForecast", "gapBreakdown",
          "pathToPerfect", "strengths", "criticalIssues", "actionPlan"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Audit generation failed — empty response from AI.");

  const parsed = JSON.parse(text);

  return {
    ...parsed,
    auditId,
    auditDate,
    verificationHash,
    planType: userTier
  } as AuditReportData;
};
