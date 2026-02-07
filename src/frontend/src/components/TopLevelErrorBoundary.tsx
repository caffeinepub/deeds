import { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class TopLevelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('TopLevelErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-amber-100 p-4">
                <AlertTriangle className="h-12 w-12 text-amber-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Something Went Wrong
              </h1>
              <p className="text-gray-600">
                Deeds encountered an unexpected error. Please try reloading the app.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-xs font-mono text-gray-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              onClick={this.handleReload}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload App
            </Button>

            <p className="text-xs text-gray-500">
              If this error continues, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
