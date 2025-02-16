import { createEffect, createSignal, JSX } from "solid-js";
import { PopUpFrame, PopUpInput, PopUpLabel, PopUpTitle } from "./popUpFrame";
import { sendNewNote } from "./App.tsx";
import { atom, useAtom } from "solid-jotai";

const background = "#181818";
const border = "#2d2d2d";
const style = "bg-white/20";
export const scaleState = atom(1);
export function DraggableInfiniteBoard(
  props: {
    children:
      | number
      | boolean
      | Node
      | JSX.ArrayElement
      | (string & {})
      | null
      | undefined;
  },
) {
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  const [scale, setScale] = useAtom(scaleState);
  const [isOpenForm, setIsOpenForm] = createSignal(false);
  const [noteContent, setNoteContent] = createSignal("");
  const [color, setColor] = createSignal("#FFD700");
  createEffect(() => {
    console.log(offset(), scale(), isOpenForm(), noteContent(), color());
  });
  let isDragging = false;
  let lastPos = { x: 0, y: 0 };

  const handleMouseDown = (e: { clientX: any; clientY: any }) => {
    isDragging = true;
    lastPos = { x: e.clientX, y: e.clientY };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: { clientX: number; clientY: number }) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
    lastPos = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleWheel = (
    e: { ctrlKey: any; preventDefault: () => void; deltaY: number },
  ) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomFactor = 1 - e.deltaY * 0.001;
      setScale((prev) => {
        let newScale = prev * zoomFactor;
        return Math.max(0.5, Math.min(newScale, 3));
      });
    }
  };

  const handleSaveNote = () => {
    const note = {
      x: 5000, // 任意の位置
      y: 5000, // 任意の位置
      color: color(),
      content: noteContent(),
    };
    sendNewNote(note);
    setIsOpenForm(false);
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          background: background,
        }}
      >
        {/* キャンバス（ボード） */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform:
              `translate(calc(-50% + ${offset().x}px), calc(-50% + ${offset().y}px)) scale(${scale()})`,
            width: "10000px",
            height: "10000px",
            "background-image":
              `repeating-linear-gradient(0deg, ${border}, ${border} 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, ${border}, ${border} 1px, transparent 1px, transparent 20px)`,
            "background-size": "20px 20px",
          }}
        >
          {/* キャンバスの中央に固定するテキスト */}
          <div class="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] text-[50px] font-bold text-[#fff] px-5 py-[10px] rounded-lg z-[1000000000000000]">
            電子工学部へようこそ！
          </div>

          {/* 付箋やその他の要素 */}
          {props.children}
        </div>
        <div
          class="absolute bottom-10 right-10 w-14 h-14 flex items-center justify-center text-white bg-[#1DA1F2] rounded-full shadow-xl hover:bg-[#1991DA] transition-colors cursor-pointer"
          onClick={() => setIsOpenForm(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <div
        onClick={() => {
          //下にスクロール
          window.scrollTo({ top: window.scrollY + 900, behavior: 'smooth' });
        }}
        class="absolute bottom-0 left-15 h-20 flex items-center justify-center text-white bg-white/30 font-bold  hover:bg-white/10 px-10 rounded-t-lg border-t-1 border-r-1 border-l-1 cursor-pointer">
          ↓↓スクロールバー回せば下にあります
        </div>
      </div>
      {isOpenForm() && (
        <PopUpFrame closeScript={setIsOpenForm}>
          <PopUpTitle>付箋を追加</PopUpTitle>
          <PopUpLabel>内容</PopUpLabel>
          <PopUpInput
            type=""
            placeholder="電子工学部さいこう！"
            state={setNoteContent}
          />
          <PopUpLabel>色</PopUpLabel>
          <div class="flex space-x-2 items-center">
            <div
              class={`w-6 h-6 rounded-full bg-yellow-400 cursor-pointer transition-transform duration-100 hover:scale-110 ${
                color() === "#FFD700" ? "border-2 border-white" : ""
              }`}
              onClick={() => setColor("#FFD700")}
            >
            </div>
            <div
              class={`w-6 h-6 rounded-full bg-blue-400 cursor-pointer transition-transform duration-100 hover:scale-110 ${
                color() === "#1DA1F2" ? "border-2 border-white" : ""
              }`}
              onClick={() => setColor("#1DA1F2")}
            >
            </div>
            <div
              class={`w-6 h-6 rounded-full bg-green-400 cursor-pointer transition-transform duration-100 hover:scale-110 ${
                color() === "#00FF00" ? "border-2 border-white" : ""
              }`}
              onClick={() => setColor("#00FF00")}
            >
            </div>
            <div
              class={`w-6 h-6 rounded-full bg-red-400 cursor-pointer transition-transform duration-100 hover:scale-110 ${
                color() === "#FF0000" ? "border-2 border-white" : ""
              }`}
              onClick={() => setColor("#FF0000")}
            >
            </div>
            <input
              type="color"
              class="w-6 h-6 rounded-full cursor-pointer p-0 border-none"
              onChange={(e) => setColor(e.currentTarget.value)}
              value={color()}
              style={color() !== "#FFD700" && color() !== "#1DA1F2" &&
                  color() !== "#00FF00" && color() !== "#FF0000"
                ? "border: 2px solid white"
                : ""}
            />
          </div>
          <div class="flex justify-end">
            <button
              class="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg shadow-md hover:bg-[#1991DA] transition-colors mt-4"
              onClick={handleSaveNote}
            >
              保存
            </button>
          </div>
        </PopUpFrame>
      )}
    </>
  );
}
