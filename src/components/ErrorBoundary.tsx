import React from "react";

type State = { error: Error | null };

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface to console so Lovable log capture picks it up.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background text-foreground grid place-items-center p-6">
          <div className="max-w-md w-full border border-crimson/40 bg-black/70 p-6 rounded">
            <div className="font-display text-2xl text-crimson mb-2">Something broke</div>
            <p className="text-sm text-zinc-400 mb-4">
              An unexpected error occurred. Try reloading the page.
            </p>
            <pre className="text-[10px] text-zinc-500 whitespace-pre-wrap max-h-40 overflow-auto mb-4">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-crimson text-primary-foreground font-mono-tech text-xs uppercase tracking-widest"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}