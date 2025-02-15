import { createSignal, createEffect, JSX } from "solid-js";
import { notesState } from "./App"; 
import { useAtom } from "solid-jotai";
import { scaleState } from "./Boad";

export function DraggableStickyNote(
  { id, onMove }: {
    id: string;
    onMove: (newPos: { x: number; y: number; }) => void;
  },
): JSX.Element {
  const [notes] = useAtom(notesState);
  const noteFromAtom = () => notes().find((note) => note.id === id);
  const initialNote = noteFromAtom();
  if (!initialNote) return <></>;
  const { content, color } = initialNote;
  const [position, setPosition] = createSignal({ x: initialNote.x, y: initialNote.y });
  const [scale] = useAtom(scaleState);
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // atomの値が更新されたらローカル状態を同期
  createEffect(() => {
    const currentNote = noteFromAtom();
    if (currentNote && !isDragging) {
      setPosition({ x: currentNote.x, y: currentNote.y });
    }
  });

  const handleMouseDown = (
    e: { stopPropagation: () => void; clientX: number; clientY: number },
  ) => {
    e.stopPropagation();
    isDragging = true;
    // マウス座標にscale補正を適用
    dragOffset = {
      x: (e.clientX / scale()) - position().x,
      y: (e.clientY / scale()) - position().y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!isDragging) return;
    setPosition({
      x: (e.clientX / scale()) - dragOffset.x,
      y: (e.clientY / scale()) - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    isDragging = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    onMove(position());
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        top: `${position().y}px`,
        left: `${position().x}px`,
        width: "200px",
        height: "200px",
        background: color,
        padding: "10px",
        cursor: "move",
        "user-select": "none",
        "box-shadow": "0 2px 5px rgba(0,0,0,0.3)",
      }}
    >
      <p>{content}</p>
    </div>
  );
}