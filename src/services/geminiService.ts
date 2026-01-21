import { GoogleGenAI, Type, Modality } from '@google/genai';
import { ExtractedTasks } from '../types';

const SYSTEM_PROMPT = `
Você é um assistente especializado em processar ATAs de reunião técnica para times de QA e Dev.
Sua tarefa: Extrair tarefas estruturadas de uma ATA em Markdown, PDF ou texto.

Para cada tarefa, extrair:
1. titulo (string curta e objetiva)
2. descricao (contexto completo da tarefa)
3. responsavel (nome da pessoa atribuída. Se não houver, use "Não Atribuído")
4. subResponsaveis (array de nomes de outras pessoas citadas)
5. prazo (ISO 8601 date - YYYY-MM-DD, ou null se não especificado)
6. tags (array de strings baseadas no contexto)
7. urgente (boolean: true se a tarefa não tiver responsável ou for explicitamente urgente)

Regras:
- Tarefas sem responsável devem ser marcadas como urgente: true.
`;

/**
 * Handle API errors specifically for permission and missing entities.
 * Returns 'never' because it always throws an error, satisfying any calling return type.
 */
function handleApiError(error: any): never {
  console.error('Gemini API Error Details:', error);
  const message = error?.message || String(error);

  // Handle Permission Denied (403)
  if (message.includes('permission') || message.includes('403')) {
    throw new Error(
      'Erro de Permissão (403): O projeto ou a chave não tem acesso ao modelo solicitado (Pro). Certifique-se de que o faturamento está ativo no console do Google Cloud.'
    );
  }

  // Handle Not Found (404) / Entity Issues
  if (message.includes('Requested entity was not found') || message.includes('404')) {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      aistudio.openSelectKey();
    }
    throw new Error(
      'Configuração expirada ou modelo indisponível. Re-selecionando chave de API...'
    );
  }

  throw error;
}

export async function extractTasksFromDocument(
  content: string,
  mimeType: string = 'text/plain'
): Promise<ExtractedTasks> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const contents =
      mimeType === 'application/pdf'
        ? {
          parts: [
            { inlineData: { data: content, mimeType: 'application/pdf' } },
            { text: 'Extraia as tarefas desta ATA conforme o schema JSON.' },
          ],
        }
        : `Processe esta ATA e extraia as tarefas em formato JSON:\n\n${content}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents as any,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dataMeeting: { type: Type.STRING },
            participantes: { type: Type.ARRAY, items: { type: Type.STRING } },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  descricao: { type: Type.STRING },
                  responsavel: { type: Type.STRING },
                  subResponsaveis: { type: Type.ARRAY, items: { type: Type.STRING } },
                  prazo: { type: Type.STRING, nullable: true },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  urgente: { type: Type.BOOLEAN },
                },
              },
            },
          },
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function speakText(text: string): Promise<ArrayBuffer> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Leia calmamente: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error('Erro ao gerar áudio');

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function generateTestData(context: string): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma massa de dados (JSON ou SQL) realista para testar a seguinte funcionalidade: ${context}. Responda apenas com o código.`,
    });
    return response.text || '';
  } catch (error) {
    return handleApiError(error);
  }
}

export async function generateAIReport(context: string): Promise<{ text: string; sources: any[] }> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: `Realize uma pesquisa web e gere um relatório técnico detalhado sobre como implementar/testar o seguinte requisito: ${context}. Inclua links de referência.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || '',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (error) {
    return handleApiError(error);
  }
}
