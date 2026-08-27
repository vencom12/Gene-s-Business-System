import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center border border-amber-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-600 text-sm mb-6">
              Don't worry! Your bakery data is safe in your device storage. We encountered a minor issue.
            </p>
            {this.state.error && (
              <div className="bg-slate-100 text-slate-700 text-xs p-3 rounded-lg text-left mb-6 font-mono overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-98"
            >
              <RefreshCw size={18} />
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
