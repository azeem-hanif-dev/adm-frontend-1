
import { GoogleGenAI, Type } from "@google/genai";

/**
 * AI Service for NeoSend Enterprise
 * Uses Gemini 2.5 series for multi-modal analysis and text generation.
 */

export const analyzePoster = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const prompt = `
    Analyze this marketing campaign poster.
    Extract the following information and return it in JSON format:
    1. headline: The main catchy title or message.
    2. offer: The specific value proposition or discount mentioned.
    3. cta: The Call to Action (e.g., "Sign up now").
    4. tone: The visual and emotional tone of the branding (e.g., Professional, Energetic, Luxury).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            offer: { type: Type.STRING },
            cta: { type: Type.STRING },
            tone: { type: Type.STRING },
          },
          propertyOrdering: ["headline", "offer", "cta", "tone"],
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

export const generatePersonalizedEmail = async (
  lead: any,
  campaignInfo: any,
  tone: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-pro';

  const prompt = `
    Role: Senior Growth Marketer.
    Task: Write a high-converting, human-sounding marketing email.
    
    Recipient: ${lead.contactName} (${lead.contactName.split(' ')[0]})
    Company: ${lead.companyName}
    Industry: ${lead.industry}
    Location: ${lead.location}

    Campaign context from poster:
    - Headline: ${campaignInfo.headline}
    - Offer: ${campaignInfo.offer}
    - Requested Tone: ${tone}

    STRICT GUIDELINES:
    - NO robotic templates. Start with an observation about ${lead.companyName}.
    - NO spam words: "Free", "Buy Now", "Urgent", "Guarantee".
    - CTA: Soft and professional (e.g., "Would you be open to a 5-min chat?").
    - Length: Under 110 words. Clear white space.
    - Subject Line: Under 40 chars, no emojis.
    
    Return as JSON:
    {
      "subject": "...",
      "body": "..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          propertyOrdering: ["subject", "body"],
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Text Generation Error:", error);
    return {
      subject: `Quick question for ${lead.companyName}`,
      body: `Hi ${lead.contactName},\n\nI was looking into ${lead.industry} leaders in ${lead.location} and ${lead.companyName} stood out. I'd love to share some thoughts on how we can help with ${campaignInfo.headline}.\n\nBest,\nAlex`
    };
  }
};

export const generateReplySuggestion = async (
  incomingMessage: string,
  leadContext: any
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are an AI Sales Assistant for NeoSend.
    
    Context: A potential client (${leadContext.contactName} from ${leadContext.companyName}) has replied to our cold email.
    Incoming Message: "${incomingMessage}"
    
    Task: Draft a professional, concise, and helpful reply to close the deal or book a meeting.
    Tone: Professional, confident, and helpful.
    
    Return pure text of the email body only. No subject line.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: prompt }] }
  });

  return response.text;
};
