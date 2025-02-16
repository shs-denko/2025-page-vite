import { createSignal, onCleanup } from "solid-js";

export default function GlowingCursor() {
  const [cursorPos, setCursorPos] = createSignal({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = createSignal(false);

  const handleMouseMove = (e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseOut = (e: MouseEvent) => {
    if (!e.relatedTarget) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseout", handleMouseOut);

  return (
    <>
      {isVisible() && (
        <div
          class="animate-pulse"
          style={{
            position: "fixed",
            left: cursorPos().x + "px",
            top: cursorPos().y + "px",
            transform: "translate(-50%, -50%)",
            width: "150px",
            height: "150px",
            "border-radius": "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(15px)",
            "pointer-events": "none",
            "z-index": "2000",
          }}
        />
      )}
    </>
  );
}
