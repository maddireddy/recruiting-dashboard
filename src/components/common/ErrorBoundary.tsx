import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Could send to Sentry/Log here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="max-w-xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-sm text-red-600 mt-2">An unexpected error occurred while rendering this page.</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reload
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-dark-200 rounded"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
