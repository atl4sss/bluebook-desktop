import { createContext, useContext } from "react";
import type { Session } from "../services/sessionService";

export const SessionContext = createContext<{
  session: Session | null;
  startSession: (session: Session) => void;
  endSession: () => void;
} | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("SessionProvider is missing");
  return context;
}
