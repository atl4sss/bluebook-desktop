import { HashRouter, Navigate, Routes, Route } from "react-router-dom";
import StartCodePage from "./pages/StartCodePage";
import TestPage from "./pages/TestPage";
import FinishPage from "./pages/FinishPage";
import SessionProvider from "./app/SessionProvider";
import { useSession } from "./app/sessionContext";
import ErrorBoundary from "./components/ErrorBoundary";
import DesktopKiosk from "./components/DesktopKiosk";
import "katex/dist/katex.min.css";

function RequireSession({ children }) {
  const { session } = useSession();
  return session ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <DesktopKiosk />
      <SessionProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<StartCodePage />} />
            <Route
              path="/test"
              element={
                <RequireSession>
                  <TestPage />
                </RequireSession>
              }
            />
            <Route
              path="/finish"
              element={
                <RequireSession>
                  <FinishPage />
                </RequireSession>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </SessionProvider>
    </ErrorBoundary>
  );
}
