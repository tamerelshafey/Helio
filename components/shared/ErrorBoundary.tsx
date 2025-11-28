import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { ExclamationCircleIcon } from '../ui/Icons';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleRetry = () => {
      this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationCircleIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md mb-6 text-left overflow-auto max-h-32">
                <code className="text-xs text-red-500 font-mono">
                    {this.state.error?.message}
                </code>
            </div>
            <div className="flex gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="secondary">
                    Try Again
                </Button>
                <Button onClick={this.handleReload}>
                    Reload Page
                </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;