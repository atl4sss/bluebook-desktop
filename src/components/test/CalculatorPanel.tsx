import { useState } from "react";

// A four-function practice calculator. No eval or remotely loaded scripts.
export default function CalculatorPanel() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  function calculate(left: number, right: number, op: string) {
    const result =
      op === "+"
        ? left + right
        : op === "−"
          ? left - right
          : op === "×"
            ? left * right
            : left / right;
    return Number.isFinite(result)
      ? String(Number(result.toPrecision(12)))
      : "Error";
  }
  function press(key: string) {
    if (key === "C") {
      setDisplay("0");
      setStored(null);
      setOperation(null);
      setReplace(false);
      return;
    }
    if (/^[0-9.]$/.test(key)) {
      if (replace || display === "Error") {
        setDisplay(key === "." ? "0." : key);
        setReplace(false);
      } else if (!(key === "." && display.includes(".")))
        setDisplay(
          display === "0" && key !== "." ? key : (display + key).slice(0, 16),
        );
      return;
    }
    const value = Number(display);
    if (!Number.isFinite(value)) return;
    if (key === "±") {
      setDisplay(String(-value));
      return;
    }
    if (key === "√") {
      setDisplay(value >= 0 ? String(Math.sqrt(value)) : "Error");
      setReplace(true);
      return;
    }
    if (key === "x²") {
      setDisplay(String(value * value));
      setReplace(true);
      return;
    }
    const result =
      stored !== null && operation && !replace
        ? calculate(stored, value, operation)
        : display;
    setDisplay(result);
    setReplace(true);
    setStored(key === "=" ? null : Number(result));
    setOperation(key === "=" ? null : key);
  }
  return (
    <div className="max-w-xs mx-auto">
      <p className="text-sm mb-3">Basic practice calculator</p>
      <output
        aria-label="Calculator display"
        className="block border rounded p-3 text-right text-2xl mb-3 overflow-auto"
      >
        {display}
      </output>
      <div className="grid grid-cols-4 gap-2">
        {[
          "C",
          "√",
          "x²",
          "÷",
          "7",
          "8",
          "9",
          "×",
          "4",
          "5",
          "6",
          "−",
          "1",
          "2",
          "3",
          "+",
          "±",
          "0",
          ".",
          "=",
        ].map((key) => (
          <button
            key={key}
            onClick={() => press(key)}
            className="border rounded p-3 hover:bg-gray-100"
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
