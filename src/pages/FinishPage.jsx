// src/pages/FinishPage.jsx
import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../app/sessionContext";
import Modal from "../components/ui/Modal";
import { HelpCircle, Home } from "lucide-react";
import laptopImg from "../assets/laptop.png"; // твоя картинка с ноутбуком

export default function FinishPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { endSession } = useSession();
  const [help, setHelp] = React.useState(false);
  const home = () => {
    endSession();
    navigate("/", { replace: true });
  };
  // генерим конфетти один раз
  const confetti = React.useMemo(() => {
    const colors = ["#FFD429", "#5CA9E6", "#F36C6C", "#7AD37A"];
    return Array.from({ length: 55 }).map((_, i) => {
      const left = Math.random() * 100; // %
      const delay = Math.random() * 0.1; // от 0 до 0.3s
      const duration = 6 + Math.random() * 7; // 6-13s
      const size = 6 + Math.random() * 8; // высота «палочки»
      const rotate = Math.random() * 360;
      const color = colors[i % colors.length];
      return { id: i, left, delay, duration, size, rotate, color };
    });
  }, []);

  if (!location.state) return <Navigate to="/test" replace />;
  return (
    <div className="min-h-screen bg-[#1A2263] flex flex-col font-sans text-white relative overflow-hidden">
      {/* keyframes прямо здесь, чтобы не лезть в глобальный css */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-110vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 1;
          }
        }
      `}</style>

      {/* верхняя панель */}
      <header className="access-header text-[#191919]">
        <button
          onClick={() => setHelp(true)}
          className="flex items-center gap-1 text-sm text-[#0f172a]"
        >
          <HelpCircle size={18} /> Help
        </button>
        <button
          onClick={home}
          className="flex items-center gap-1 text-sm text-[#0f172a]"
        >
          Return to Home <Home size={18} />
        </button>
      </header>

      {/* анимация конфетти поверх всего */}
      <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
        {confetti.map((c) => (
          <span
            key={c.id}
            style={{
              position: "absolute",
              top: "-10vh",
              left: `${c.left}%`,
              width: "6px",
              height: `${c.size * 2}px`,
              backgroundColor: c.color,
              borderRadius: "9999px",
              animation: `confetti-fall ${c.duration}s linear ${c.delay}s infinite`,
              transform: `rotate(${c.rotate}deg)`,
              opacity: 0.95,
            }}
          />
        ))}
      </div>

      {/* контент */}
      <main className="flex-1 flex flex-col items-center pt-10 pb-16 px-4 relative z-50">
        {/* заголовки как на скрине — чуть крупнее */}
        <h1 className="text-[32px] font-normal text-white tracking-tight">
          Congratulations!
        </h1>
        <p className="text-[17px] text-[#E5E7EB] mb-8 text-center font-semibold">
          Your  test is complete, and your answers have been submitted.
        </p>

        {/* белый центральный блок */}
        <div className="bg-white w-full max-w-[560px] rounded-[22px] shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
          <img
            src={laptopImg}
            alt="Laptop"
            className="w-full h-auto block select-none pointer-events-none"
          />
        </div>

        {/* кнопка снизу */}
        <button
          onClick={home}
          className="mt-6 bg-[#ffd925] hover:bg-[#fbd318] text-[#0f172a] font-semibold text-[16px] px-10 py-3 rounded-full border border-[#0f172a]/40 shadow-[0_10px_25px_rgba(0,0,0,0.12)] transition-colors"
        >
          Return to Homepage
        </button>
        <p className="mt-5 text-sm">
          Answers were kept in this session; they were not submitted for
          scoring.
        </p>
      </main>
      {help && (
        <Modal title="Practice Complete" onClose={() => setHelp(false)}>
          <p>
            Your start code was recorded when your session began. Answers are
            local to this practice session. Return home to start another test.
          </p>
        </Modal>
      )}
    </div>
  );
}
