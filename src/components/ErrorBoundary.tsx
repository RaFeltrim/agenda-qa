import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
      children: ReactNode;
}

interface ErrorBoundaryState {
      hasError: boolean;
      error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
      constructor(props: ErrorBoundaryProps) {
                super(props);
                this.state = { hasError: false, error: null };
      }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
              return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
              console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    render() {
              if (this.state.hasError) {
                            const isEnvError = this.state.error?.message?.includes('environment variables');

                  return (
                                    <div style={{
                                                          minHeight: '100vh',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          backgroundColor: '#f8fafc',
                                                          fontFamily: "'Inter', sans-serif",
                                                          padding: '24px',
                                    }}>
                                                          <div style={{
                                                              maxWidth: '480px',
                                                              textAlign: 'center',
                                                              background: 'white',
                                                              padding: '48px 32px',
                                                              borderRadius: '24px',
                                                              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                                    }}>
                                                                                    <div style={{
                                                                  width: '64px',
                                                                  height: '64px',
                                                                  background: '#fee2e2',
                                                                  borderRadius: '16px',
                                                                  display: 'flex',
                                                                  alignItems: 'center',
                                                                  justifyContent: 'center',
                                                                  margin: '0 auto 24px',
                                                                  fontSize: '28px',
                                    }}>
                                                                                      {isEnvError ? '🔧' : '❌'}
                                                                                      </div>div>
                                                                                    <h2 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '22px' }}>
                                                                                      {isEnvError ? 'Configuração Necessária' : 'Algo deu errado'}
                                                                                      </h2>h2>
                                                                                    <p style={{ color: '#64748b', margin: '0 0 24px', lineHeight: '1.6' }}>
                                                                                      {isEnvError
                                                                                                                        ? 'A aplicação não está configurada corretamente. As variáveis de ambiente do Supabase precisam ser definidas no Vercel.'
                                                                                                                        : 'Ocorreu um erro inesperado na aplicação. Tente recarregar a página.'
                                                                                        }
                                                                                      </p>p>
                                                            {!isEnvError && (
                                                                  <details style={{ textAlign: 'left', marginBottom: '24px' }}>
                                                                                                    <summary style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '13px' }}>
                                                                                                                                          Detalhes técnicos
                                                                                                      </summary>summary>
                                                                                                    <pre style={{
                                                                                                        background: '#f1f5f9',
                                                                                                        padding: '12px',
                                                                                                        borderRadius: '8px',
                                                                                                        fontSize: '12px',
                                                                                                        overflow: 'auto',
                                                                                                        marginTop: '8px',
                                                                                                        color: '#ef4444',
                                                                  }}>
                                                                                                      {this.state.error?.message}
                                                                                                      </pre>pre>
                                                                  </details>details>
                                                              )}
                                                                                    <button
                                                                                                                  onClick={() => window.location.reload()}
                                                                                                                  style={{
                                                                                                                                                    background: '#4063ff',
                                                                                                                                                    color: 'white',
                                                                                                                                                    border: 'none',
                                                                                                                                                    padding: '12px 32px',
                                                                                                                                                    borderRadius: '12px',
                                                                                                                                                    fontSize: '15px',
                                                                                                                                                    fontWeight: 600,
                                                                                                                                                    cursor: 'pointer',
                                                                                                                    }}
                                                                                                              >
                                                                                                                Recarregar Página
                                                                                      </button>button>
                                                          </div>div>
                                    </div>div>
                                );
              }
      
              return this.props.children;
    }
}</button>
