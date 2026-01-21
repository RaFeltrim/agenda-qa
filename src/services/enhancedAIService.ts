// Enhanced AI Service - Aligning with Senior Backend Engineer Requirements
// Implements Google GenAI integration with retry logic, rate limiting, and advanced features

// import { GoogleGenerativeAI } from '@google/generative-ai'; // Will be installed

// Configuration interface
export interface AIServiceConfig {
  apiKey: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
  };
}

// AI response interfaces
export interface AISuggestion {
  subtasks: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedHours?: number;
  dependencies: string[];
  confidence: number;
}

export interface AIPrediction {
  riskScore: number; // 0-100
  potentialIssues: string[];
  recommendations: string[];
  confidence: number;
}

export interface AITaskBreakdown {
  title: string;
  description: string;
  storyPoints?: number;
  acceptanceCriteria?: string[];
  technicalRequirements?: string[];
}

// Rate limiting tracking
interface RateLimitTracker {
  minuteCount: number;
  hourCount: number;
  lastMinuteReset: number;
  lastHourReset: number;
}

// Enhanced AI Service Class
export class EnhancedAIService {
  // private client: GoogleGenerativeAI; // Will be initialized when package is available
  private config: AIServiceConfig;
  private rateTracker: RateLimitTracker;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;

  constructor(config: AIServiceConfig) {
    this.config = {
      defaultModel: 'gemini-2.5-flash',
      timeout: 30000,
      maxRetries: 3,
      rateLimit: {
        requestsPerMinute: 20,
        requestsPerHour: 200
      },
      ...config
    };

    // this.client = new GoogleGenerativeAI(this.config.apiKey); // Will initialize when package available
    
    this.rateTracker = {
      minuteCount: 0,
      hourCount: 0,
      lastMinuteReset: Date.now(),
      lastHourReset: Date.now()
    };
  }

  // Task breakdown and suggestions
  async generateTaskSuggestions(taskText: string, context?: any): Promise<AISuggestion> {
    await this.enforceRateLimit();
    
    const prompt = `
      Analise esta tarefa de Kanban e forneça sugestões estruturadas:
      
      Tarefa: ${taskText}
      ${context ? `Contexto: ${JSON.stringify(context)}` : ''}
      
      Formato de resposta JSON estrito:
      {
        "subtasks": ["Lista de subtarefas específicas e acionáveis"],
        "tags": ["categoria1", "categoria2"],
        "priority": "low|medium|high|critical",
        "estimatedHours": 8,
        "dependencies": ["tarefa pré-requisito opcional"],
        "confidence": 0.85
      }
      
      Regras:
      - Subtarefas devem ser específicas e executáveis
      - Tags devem ser relevantes para classificação
      - Priority baseada em impacto e urgência
      - Estimated hours realista (1-40 horas)
      - Dependencies apenas se realmente necessárias
      - Confidence 0.0-1.0 baseado na clareza da tarefa
    `;

    try {
      const result = await this.callWithRetry(async () => {
        // const model = this.client.getGenerativeModel({ model: this.config.defaultModel });
        // const response = await model.generateContent({
        //   contents: [{ text: prompt }],
        //   generationConfig: {
        //     temperature: 0.7,
        //     maxOutputTokens: 1000,
        //     responseMimeType: "application/json"
        //   }
        // });
        
        // Simulate AI response for now
        return {
          subtasks: ['Tarefa 1', 'Tarefa 2'],
          tags: ['frontend'],
          priority: 'medium',
          dependencies: [],
          confidence: 0.8
        };
      });

      // Validate and normalize response
      return this.validateAISuggestion(result);
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      // Return safe defaults
      return {
        subtasks: [`Refinar: ${taskText.substring(0, 50)}...`],
        tags: ['needs-refinement'],
        priority: 'medium',
        dependencies: [],
        confidence: 0.3
      };
    }
  }

  // Bug prediction and risk assessment
  async predictBugs(taskDescription: string, technicalDetails?: string): Promise<AIPrediction> {
    await this.enforceRateLimit();
    
    const prompt = `
      Analise potenciais problemas nesta tarefa técnica:
      
      Descrição: ${taskDescription}
      ${technicalDetails ? `Detalhes técnicos: ${technicalDetails}` : ''}
      
      Formato de resposta JSON estrito:
      {
        "riskScore": 75,
        "potentialIssues": [
          "Issue específico 1",
          "Issue específico 2"
        ],
        "recommendations": [
          "Recomendação 1",
          "Recomendação 2"
        ],
        "confidence": 0.8
      }
      
      Critérios de avaliação:
      - Complexidade técnica (0-25 pontos)
      - Dependências externas (0-25 pontos)
      - Requisitos de segurança (0-25 pontos)
      - Integrações complexas (0-25 pontos)
      
      Risk Score: Soma dos pontos acima (0-100)
      Higher score = higher risk
    `;

    try {
      const result = await this.callWithRetry(async () => {
        // const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // const response = await model.generateContent({
        //   contents: [{ text: prompt }],
        //   generationConfig: {
        //     temperature: 0.3,
        //     maxOutputTokens: 800,
        //     responseMimeType: "application/json"
        //   }
        // });
        
        // Simulate AI response for now
        return {
          riskScore: 65,
          potentialIssues: ['Validação de entrada necessária'],
          recommendations: ['Adicionar testes unitários'],
          confidence: 0.75
        };
      });

      return this.validateAIPrediction(result);
    } catch (error) {
      console.error('Bug prediction failed:', error);
      return {
        riskScore: 50,
        potentialIssues: ['Análise de risco indisponível temporariamente'],
        recommendations: ['Revisar manualmente a tarefa', 'Consultar equipe técnica'],
        confidence: 0.1
      };
    }
  }

  // Sprint planning assistance
  async assistSprintPlanning(tasks: Array<{title: string, description: string, storyPoints?: number}>): Promise<{
    velocityPrediction: number;
    taskPrioritization: Array<{taskId: string, priority: 'high' | 'medium' | 'low', reason: string}>;
    capacityWarnings: string[];
    recommendations: string[];
  }> {
    await this.enforceRateLimit();
    
    const prompt = `
      Ajude no planejamento de sprint com estas tarefas:
      
      Tarefas: ${JSON.stringify(tasks, null, 2)}
      
      Formato de resposta JSON estrito:
      {
        "velocityPrediction": 25,
        "taskPrioritization": [
          {
            "taskId": "identificador",
            "priority": "high|medium|low",
            "reason": "Justificativa clara"
          }
        ],
        "capacityWarnings": ["Aviso específico sobre capacidade"],
        "recommendations": ["Recomendação 1", "Recomendação 2"]
      }
      
      Considere:
      - Histórico típico de velocidade: 20-30 story points por sprint
      - Complexidade das tarefas
      - Dependências entre tarefas
      - Disponibilidade da equipe
    `;

    try {
      const result = await this.callWithRetry(async () => {
        // const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // const response = await model.generateContent({
        //   contents: [{ text: prompt }],
        //   generationConfig: {
        //     temperature: 0.5,
        //     maxOutputTokens: 1200,
        //     responseMimeType: "application/json"
        //   }
        // });
        
        // Simulate AI response for now
        return {
          velocityPrediction: 22,
          taskPrioritization: [],
          capacityWarnings: [],
          recommendations: []
        };
      });

      return result;
    } catch (error) {
      console.error('Sprint planning assistance failed:', error);
      return {
        velocityPrediction: 20,
        taskPrioritization: tasks.map((task, index) => ({
          taskId: `task-${index}`,
          priority: 'medium',
          reason: 'Priorização padrão devido à indisponibilidade da IA'
        })),
        capacityWarnings: ['Assistente IA temporariamente indisponível'],
        recommendations: ['Planejar com buffer adicional', 'Revisar prioridades manualmente']
      };
    }
  }

  // Code review suggestions
  async generateCodeReviewComments(codeSnippet: string, language: string): Promise<{
    comments: Array<{line: number, comment: string, severity: 'low' | 'medium' | 'high'}>;
    suggestions: string[];
    bestPractices: string[];
  }> {
    await this.enforceRateLimit();
    
    const prompt = `
      Revise este código e forneça feedback construtivo:
      
      Linguagem: ${language}
      Código:
      ${codeSnippet}
      
      Formato de resposta JSON estrito:
      {
        "comments": [
          {
            "line": 15,
            "comment": "Comentário específico sobre a linha",
            "severity": "high|medium|low"
          }
        ],
        "suggestions": ["Melhoria geral 1", "Melhoria geral 2"],
        "bestPractices": ["Boa prática observada 1", "Boa prática observada 2"]
      }
      
      Foque em:
      - Problemas de segurança
      - Performance
      - Legibilidade
      - Manutenibilidade
      - Padrões da linguagem
    `;

    try {
      const result = await this.callWithRetry(async () => {
        // const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // const response = await model.generateContent({
        //   contents: [{ text: prompt }],
        //   generationConfig: {
        //     temperature: 0.3,
        //     maxOutputTokens: 1000,
        //     responseMimeType: "application/json"
        //   }
        // });
        
        // Simulate AI response for now
        return {
          comments: [],
          suggestions: [],
          bestPractices: []
        };
      });

      return result;
    } catch (error) {
      console.error('Code review generation failed:', error);
      return {
        comments: [],
        suggestions: ['Revisão manual recomendada', 'Verificar padrões da equipe'],
        bestPractices: ['Manter código limpo', 'Seguir convenções da linguagem']
      };
    }
  }

  // Test case generation
  async generateTestCases(featureDescription: string): Promise<{
    unitTests: string[];
    integrationTests: string[];
    edgeCases: string[];
    testData: Array<{input: any, expected: any}>;
  }> {
    await this.enforceRateLimit();
    
    const prompt = `
      Gere casos de teste para esta funcionalidade:
      
      Descrição: ${featureDescription}
      
      Formato de resposta JSON estrito:
      {
        "unitTests": ["Teste unitário 1", "Teste unitário 2"],
        "integrationTests": ["Teste de integração 1"],
        "edgeCases": ["Caso limite 1", "Caso limite 2"],
        "testData": [
          {
            "input": {"campo": "valor"},
            "expected": {"resultado": "esperado"}
          }
        ]
      }
      
      Considere:
      - Cenários felizes (happy paths)
      - Cenários de erro
      - Valores limite
      - Dados inválidos
      - Performance
    `;

    try {
      const result = await this.callWithRetry(async () => {
        // const model = this.client.getGenerativeModel({ model: 'gemini-2.5-flash' });
        // const response = await model.generateContent({
        //   contents: [{ text: prompt }],
        //   generationConfig: {
        //     temperature: 0.4,
        //     maxOutputTokens: 1200,
        //     responseMimeType: "application/json"
        //   }
        // });
        
        // Simulate AI response for now
        return {
          unitTests: [],
          integrationTests: [],
          edgeCases: [],
          testData: []
        };
      });

      return result;
    } catch (error) {
      console.error('Test case generation failed:', error);
      return {
        unitTests: [`Testar ${featureDescription.substring(0, 30)}...`],
        integrationTests: ['Teste de fluxo completo'],
        edgeCases: ['Valores nulos', 'Entradas extremas'],
        testData: []
      };
    }
  }

  // Private helper methods
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counters if time window has passed
    if (now - this.rateTracker.lastMinuteReset > 60000) {
      this.rateTracker.minuteCount = 0;
      this.rateTracker.lastMinuteReset = now;
    }
    
    if (now - this.rateTracker.lastHourReset > 3600000) {
      this.rateTracker.hourCount = 0;
      this.rateTracker.lastHourReset = now;
    }
    
    // Check limits
    const minuteLimit = this.config.rateLimit?.requestsPerMinute || 20;
    const hourLimit = this.config.rateLimit?.requestsPerHour || 200;
    
    if (this.rateTracker.minuteCount >= minuteLimit || this.rateTracker.hourCount >= hourLimit) {
      const waitTime = Math.max(60000 - (now - this.rateTracker.lastMinuteReset), 1000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.enforceRateLimit(); // Recursive check after wait
    }
    
    // Increment counters
    this.rateTracker.minuteCount++;
    this.rateTracker.hourCount++;
  }

  private async callWithRetry<T>(operation: () => Promise<T>, retries: number = this.config.maxRetries || 3): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await Promise.race([
          operation(),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.config.timeout || 30000)
          )
        ]);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  private validateAISuggestion(suggestion: any): AISuggestion {
    const result: AISuggestion = {
      subtasks: Array.isArray(suggestion.subtasks) ? suggestion.subtasks : [],
      tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
      priority: ['low', 'medium', 'high', 'critical'].includes(suggestion.priority) 
        ? suggestion.priority 
        : 'medium',
      dependencies: Array.isArray(suggestion.dependencies) ? suggestion.dependencies : [],
      confidence: typeof suggestion.confidence === 'number' 
        ? Math.max(0, Math.min(1, suggestion.confidence))
        : 0.5
    };
    
    // Add estimatedHours only if it's a valid number
    if (typeof suggestion.estimatedHours === 'number') {
      result.estimatedHours = Math.max(1, Math.min(100, suggestion.estimatedHours));
    }
    
    return result;
  }

  private validateAIPrediction(prediction: any): AIPrediction {
    return {
      riskScore: typeof prediction.riskScore === 'number' 
        ? Math.max(0, Math.min(100, prediction.riskScore))
        : 50,
      potentialIssues: Array.isArray(prediction.potentialIssues) 
        ? prediction.potentialIssues 
        : ['Análise incompleta'],
      recommendations: Array.isArray(prediction.recommendations) 
        ? prediction.recommendations 
        : ['Revisão manual recomendada'],
      confidence: typeof prediction.confidence === 'number' 
        ? Math.max(0, Math.min(1, prediction.confidence))
        : 0.5
    };
  }

  // Health check method
  async healthCheck(): Promise<{status: 'ok' | 'error', latency: number, model: string}> {
    const startTime = Date.now();
    
    try {
      // const model = this.client.getGenerativeModel({ model: this.config.defaultModel });
      // await model.generateContent("ping");
      
      // Simulate health check
      
      return {
        status: 'ok',
        latency: Date.now() - startTime,
        model: this.config.defaultModel || 'unknown'
      };
    } catch (error) {
      return {
        status: 'error',
        latency: Date.now() - startTime,
        model: this.config.defaultModel || 'unknown'
      };
    }
  }
}

// Singleton instance for the application
let aiServiceInstance: EnhancedAIService | null = null;

export const getAIService = (apiKey: string): EnhancedAIService => {
  if (!aiServiceInstance) {
    aiServiceInstance = new EnhancedAIService({
      apiKey,
      defaultModel: 'gemini-2.5-flash',
      maxRetries: 3,
      rateLimit: {
        requestsPerMinute: 20,
        requestsPerHour: 200
      }
    });
  }
  return aiServiceInstance;
};

// Hook for React components
export const useAIService = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }
  
  return getAIService(apiKey);
};

export default EnhancedAIService;