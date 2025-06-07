'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class TranscriptionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Transcription Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="max-w-2xl mx-auto my-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Transcription Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                An error occurred with the transcription service. This might be due to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Network connectivity issues</li>
                <li>Microphone permission problems</li>
                <li>Browser compatibility issues</li>
                <li>Service temporarily unavailable</li>
              </ul>
            </div>

            {this.state.error && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs font-mono text-muted-foreground">
                  Error: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Developer Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}
