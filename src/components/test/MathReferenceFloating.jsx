import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import mathRefImg from "../../assets/math-reference.jpeg";
export default function MathReferenceFloating({ visible, onClose }) {
  const panelRef = useRef(null);

  // позиция окна; по умолчанию — под Reference справа сверху
  const [pos, setPos] = useState({ x: null, y: null });
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // обработчик начала тащить (по шапке окна)
  const handleMouseDown = (e) => {
    if (!panelRef.current) return;
    e.preventDefault();

    const rect = panelRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      setPos({
        x: Math.max(
          0,
          Math.min(
            window.innerWidth - Math.min(720, window.innerWidth - 32),
            e.clientX - dragOffsetRef.current.x,
          ),
        ),
        y: Math.max(
          0,
          Math.min(
            window.innerHeight - 60,
            e.clientY - dragOffsetRef.current.y,
          ),
        ),
      });
    };

    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  if (!visible) return null;

  // если ещё не таскали — ставим дефолт: под Reference
  const style = {
    position: "fixed",
    zIndex: 40,
    // либо сохранённые координаты, либо дефолт
    top: pos.y ?? 72,
    right: pos.x == null ? 24 : undefined,
    left: pos.x ?? undefined,
  };

  return (
    <div style={style} ref={panelRef}>
      <div className="bg-white rounded-xl shadow-2xl border border-gray-300 w-[min(720px,100vw-32px)]">
        {/* шапка — за неё двигаем */}
        <div
          className="cursor-move flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl"
          onMouseDown={handleMouseDown}
        >
          <span className="text-sm font-semibold">Math Reference</span>
          <button
            onClick={onClose}
            aria-label="Close math reference"
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* сама картинка */}
        <div className="p-4 bg-white">
          <img
            src={mathRefImg}
            alt="Math Reference Sheet"
            className="max-h-[60vh] w-full object-contain select-none pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
