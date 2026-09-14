import { Component, type ReactNode, type ErrorInfo } from "react";

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error", error, info.componentStack);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="p-10 max-w-xl mx-auto">
          <h1 className="text-2xl mb-4">Something went wrong</h1>
          <p>
            The application could not display this screen. Restart to begin a
            new session.
          </p>
          <button
            className="mt-6 border rounded-full px-6 py-2"
            onClick={() => {
              window.location.hash = "/";
              window.location.reload();
            }}
          >
            Restart application
          </button>
        </main>
      );
    return this.props.children;
  }
}
