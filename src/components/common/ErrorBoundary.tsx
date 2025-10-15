import React from "react";

type ErrorBoundaryState = { hasError: boolean; error?: unknown };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("UI ErrorBoundary caught: ", error, info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
          <div className="glass-card max-w-xl space-y-4 px-8 py-10 text-center">
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Algo deu errado</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Recarregue a pagina. Se o erro persistir, tente sair e entrar novamente.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export class LabeledErrorBoundary extends React.Component<{ label: string } & React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: { label: string } & React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState { return { hasError: true, error }; }
  override componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("UI LabeledErrorBoundary [" + this.props.label + "] caught:", error, info);
  }
  override render() {
    if (this.state.hasError) {
      return null; // deixa o resto da pagina aparecer
    }
    return this.props.children as React.ReactElement;
  }
}
