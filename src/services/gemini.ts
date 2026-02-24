import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn('VITE_GEMINI_API_KEY is not set. AI features will not work.');
}

const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

export const geminiService = {
    async generateTaskSuggestions(context: string): Promise<string[]> {
        if (!model) return [];

        try {
            const prompt = `Based on the following context, suggest 3-5 specific tasks for a software development team. Return ONLY a JSON array of strings. Context: ${context}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON array from text (handling potential markdown formatting)
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        } catch (error) {
            console.error('Error generating tasks:', error);
            return [];
        }
    },

    async summarizeMeeting(minutes: string): Promise<string> {
        if (!model) return '';

        try {
            const prompt = `Summarize the following meeting minutes into a concise paragraph highlighting key decisions and action items: ${minutes}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error summarizing meeting:', error);
            return '';
        }
    },

    async generateTestCases(requirements: string): Promise<string> {
        if (!model) return '';

        try {
            const prompt = `Generate a list of QA test cases (Gherkin syntax preferred) for the following requirements: ${requirements}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating test cases:', error);
            return '';
        }
    }
};
