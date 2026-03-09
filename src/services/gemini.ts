/**
 * Gemini AI Service — V3 Secure Proxy Implementation
 *
 * Routes all AI calls through /api/gemini-proxy (Vercel serverless function)
 * instead of calling the Google Generative AI SDK directly from the client.
 *
 * // TODO(v3): Remove VITE_GEMINI_API_KEY from Vercel env after deploy
 */

import { supabase } from './supabase';

// =============================================================================
// Proxy Helper
// =============================================================================

async function callGeminiProxy(prompt: string, model = 'gemini-2.0-flash'): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';

    const res = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, model }),
    });

    if (!res.ok) {
        throw new Error(`AI proxy error: ${res.status}`);
    }

    const data = await res.json();
    return data.text as string;
}

// =============================================================================
// Public Service API (interface unchanged from previous version)
// =============================================================================

export const geminiService = {
    async generateTaskSuggestions(context: string): Promise<string[]> {
        try {
            const prompt = `Based on the following context, suggest 3-5 specific tasks for a software development team. Return ONLY a JSON array of strings. Context: ${context}`;
            const text = await callGeminiProxy(prompt);

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
        try {
            const prompt = `Summarize the following meeting minutes into a concise paragraph highlighting key decisions and action items: ${minutes}`;
            return await callGeminiProxy(prompt);
        } catch (error) {
            console.error('Error summarizing meeting:', error);
            return '';
        }
    },

    async generateTestCases(requirements: string): Promise<string> {
        try {
            const prompt = `Generate a list of QA test cases (Gherkin syntax preferred) for the following requirements: ${requirements}`;
            return await callGeminiProxy(prompt);
        } catch (error) {
            console.error('Error generating test cases:', error);
            return '';
        }
    }
};
