import { createEffect, createSignal, JSX } from "solid-js";
import { PopUpFrame, PopUpInput, PopUpLabel, PopUpTitle } from "./popUpFrame";
import { sendNewNote } from "./App.tsx";
import { atom, useAtom } from "solid-jotai";

const background = "#181818";
const border = "#2d2d2d";
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
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M23.643 4.937a9.816 9.816 0 0 1-2.828.775 4.958 4.958 0 0 0 2.165-2.724 9.916 9.916 0 0 1-3.127 1.184 4.924 4.924 0 0 0-8.384 4.49A13.976 13.976 0 0 1 1.671 3.149a4.822 4.822 0 0 0-.666 2.475 4.924 4.924 0 0 0 2.188 4.097 4.902 4.902 0 0 1-2.229-.616v.062a4.928 4.928 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.224.085 4.93 4.93 0 0 0 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.209c9.055 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.025 10.025 0 0 0 24 4.59a9.68 9.68 0 0 1-2.357.647z" />
          </svg>
        </div>
        <div class="absolute bottom-10 left-10  h-14 flex items-center justify-center text-white">
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
