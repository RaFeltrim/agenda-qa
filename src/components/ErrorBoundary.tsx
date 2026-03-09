import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Algo deu errado</h2>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            Ocorreu um erro inesperado. Tente recarregar a pagina.
          </p>
          <details style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>Detalhes do erro</summary>
            <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', overflow: 'auto', fontSize: '0.85rem' }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: '#4063ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Recarregar Pagina
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
