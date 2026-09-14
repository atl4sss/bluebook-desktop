import { useState, type ReactNode } from "react";
import { SessionContext } from "./sessionContext";
import type { Session } from "../services/sessionService";

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  return (
    <SessionContext.Provider
      value={{
        session,
        startSession: setSession,
        endSession: () => setSession(null),
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
