import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RouteErrorBoundary] Error in route "${this.props.routeName}":`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Algo deu errado nesta seção"
          subTitle={
            import.meta.env.DEV
              ? this.state.error?.message
              : 'Tente recarregar ou voltar à página anterior.'
          }
          extra={[
            <Button key="retry" type="primary" onClick={this.handleReset}>
              Tentar novamente
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/'}>
              Ir ao início
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}
