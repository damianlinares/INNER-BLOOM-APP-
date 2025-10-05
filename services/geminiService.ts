
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CheckInData, JournalEntry } from "./types";

if (!process.env.API_KEY) {
  // A simple fallback for environments where process.env is not defined.
  // In a real build process, this would be replaced.
  const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your actual key if needed for local dev
   if(apiKey === 'YOUR_API_KEY_HERE') {
    console.warn("API Key is not set. Please set it in geminiService.ts");
   }
   process.env.API_KEY = apiKey;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getJournalReflection = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `My journal entry is: "${text}". Please provide a short, validating, and encouraging reflection on this. Act as a compassionate mirror, not a problem solver. Keep it under 50 words.`,
      config: {
        systemInstruction: "You are a compassionate, gentle companion. Your role is to listen and offer warmth and validation. Never give advice. Your tone is soft and understanding.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting journal reflection:", error);
    return "I'm having trouble connecting right now, but your thoughts have been safely saved.";
  }
};

export const createPsychoanalysisSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are an integrative psychotherapist. Your approach is warm, empathetic, and insightful. Use open-ended questions to guide the user in exploring their thoughts and feelings. Maintain context throughout the 40-minute session. Start the conversation by gently asking, 'What's on your mind today?'.",
    },
  });
};

export const getSessionSummaryAndTitle = async (conversationHistory: { role: 'user' | 'model'; text: string }[]): Promise<{ title: string, summary: string }> => {
    const historyText = conversationHistory.map(m => `${m.role}: ${m.text}`).join('\n');
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following therapy session conversation, please generate a concise, thematic title (3-5 words) and a brief summary (2-3 sentences) of the key themes and feelings explored.\n\nConversation:\n${historyText}\n\nRespond in the format: Title: [Your Title]\nSummary: [Your Summary]`,
        });
        
        const text = response.text;
        const titleMatch = text.match(/Title: (.*)/);
        const summaryMatch = text.match(/Summary: (.*)/);

        const title = titleMatch ? titleMatch[1].trim() : 'Session Reflection';
        const summary = summaryMatch ? summaryMatch[1].trim() : 'A summary of our conversation.';

        return { title, summary };

    } catch (error) {
        console.error("Error getting session summary:", error);
        return { title: "Session Reflection", summary: "Could not generate a summary for this session." };
    }
};

export const getAIInsight = async (checkIns: CheckInData[], journalEntries: JournalEntry[]): Promise<string> => {
    const prompt = `Analyze the following recent user data (check-ins and journal excerpts) and generate one gentle, positive, and encouraging insight. Look for a simple correlation or a recurring theme. Frame it as an observation, not a directive. Max 2 sentences.
    
    Data:
    - Recent Check-ins (mood, energy, sleep rated 1-5): ${JSON.stringify(checkIns.map(c => ({ m: c.mood, e: c.energy, s: c.sleep })))}
    - Recent Journal Themes: ${journalEntries.map(j => j.content.slice(0, 100)).join('... ')}
    
    Example Insight: "It's wonderful to see that on days you mention 'nature' in your journal, your energy levels also seem a bit higher. Your connection to the outdoors appears to be nurturing you."`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating AI insight:", error);
        return "Keep nurturing your awareness. Your journey of self-discovery is a beautiful process.";
    }
};

export const getJournalPrompt = async (checkIns: CheckInData[]): Promise<string> => {
    const latestCheckIn = checkIns[0];
    const prompt = `Based on a user's latest daily check-in (mood: ${latestCheckIn.mood}/5, energy: ${latestCheckIn.energy}/5), generate a single, gentle, and introspective journal prompt. The prompt should be open-ended and encouraging.
    
    Example for low mood/energy: "What is one small act of kindness you could offer yourself right now?"
    Example for high mood/energy: "What is contributing to this positive energy, and how can you savor it today?"`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating journal prompt:", error);
        return "What's on your mind today?";
    }
};


export const getMonthlyReport = async (checkIns: any[], journalThemes: string[]): Promise<string> => {
    const prompt = `Based on the following wellness data for the month, generate a gentle, encouraging summary.
    
    Check-in data summary: There were ${checkIns.length} check-ins.
    Key journal themes: ${journalThemes.join(', ')}.

    Please create a short paragraph (3-4 sentences) highlighting positive trends and acknowledging recurring themes without being clinical or prescriptive. For example: 'This month, it looks like your energy often followed your sleep quality. Your reflections frequently touched on themes of [theme1] and [theme2], showing a deep engagement with your inner world. Keep nurturing this awareness.'`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating monthly report:", error);
        return "There was an issue generating your monthly report. Please check back later.";
    }
};