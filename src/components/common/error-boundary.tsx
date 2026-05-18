/**
 * React error boundary — catches render errors and shows a fallback UI
 * instead of a blank screen. Displays error details in development.
 */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Glass } from "@/components/ui/glass";
import { Btn } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  digest?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "#070A09" }}>
        <Glass className="p-10 max-w-lg text-center" glow>
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div className="font-black text-white text-xl mb-2">Something went wrong</div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            An unexpected error occurred. Your wallet data is safe — this is a UI error.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-left text-[11px] font-mono text-rose-300 bg-black/40 border border-rose-500/20 rounded-xl p-3 mb-5 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <Btn variant="primary" icon={RefreshCw} onClick={this.reset}>
              Try again
            </Btn>
            <Btn variant="ghost" onClick={() => window.location.reload()}>
              Reload page
            </Btn>
          </div>
        </Glass>
      </div>
    );
  }
}
