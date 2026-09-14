import { useEffect, useReducer, useState } from "react";
import { initialTestState, testReducer } from "./testState";

export default function useTestSession() {
  const [state, dispatch] = useReducer(
    testReducer,
    undefined,
    initialTestState,
  );
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      dispatch({ type: "tick", now: time });
    };
    const interval = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);
  useEffect(() => {
    if (state.complete) return;
    const confirmClose = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", confirmClose);
    return () => window.removeEventListener("beforeunload", confirmClose);
  }, [state.complete]);
  return {
    state,
    dispatch,
    secondsLeft: Math.max(0, Math.ceil((state.deadline - now) / 1000)),
  };
}
