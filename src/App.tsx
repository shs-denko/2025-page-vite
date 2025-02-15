import { createEffect, createSignal, onMount } from "solid-js";
import { DraggableInfiniteBoard } from "./Boad";
import { DraggableStickyNote } from "./Notes";
import { atom, useAtom } from "solid-jotai";
import "./App.css";
import GlowingCursor from "./GlowingCursor";

const password = "password";
let socket: WebSocket | null = null;

export const notesState = atom<{
  x: number;
  y: number;
  content: string;
  color: string;
  id: string;
}[]>([]);
const tags = ["game", "web", "1年生", "2年生", "3年生", "卒業生"];
const announcements = [
  {
    title: "テトリス",
    description: "テトリスを作りました。ぜひ遊んでみてください。",
    link: "https://tetris.com",
    images: "data:image/jpeg;base64,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",
    tags: [tags[0], tags[1], tags[5]],
  },
]


export default function App() {
  const [notes, setNotes] = useAtom(notesState);
  const [selectedTag, setSelectedTag] = createSignal<string[]>([]);
  onMount(() => {
    fetch("/notes").then(async (res) => {
      const data = await res.json();
      console.log("Notes:", data);
      setNotes(data);
    });
    socket = new WebSocket("./ws/" + password);
    socket.onopen = (event) => {
      console.log("Connected to server");
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
      if (data.type === "create") {
        console.log("New note received:", data.note);
        setNotes((prev) => [...prev, data.note]); // 追加
      }
      if (data.type === "error") {
        console.error("Error:", data.message);
      }
      if (data.type === "move") {
        setNotes((prev) => {
          const newNotes = prev.map((note) => {
            if (note.id === data.note.id) {
              return {
                ...note,
                x: data.note.x,
                y: data.note.y,
              };
            }
            return note;
          });
          return newNotes;
        });
      }
    };
    return () => {
      socket?.close();
    };
  });

  return (
    <>
    <GlowingCursor />
      <header
        class="fixed top-2 left-1/2 transform -translate-x-1/2 w-[90%] max-w-8xl text-white p-4 shadow-md z-50 rounded-full flex items-center justify-between"
        style={{
          border: "1px solid hsla(0, 0%, 100%, .08)",
          background: "hsla(0, 0%, 6%, 0.2)",
          "backdrop-filter": "blur(8px) saturate(140%)",
        }}
      >
        <h1 class="text-xl font-bold">電子工学部</h1>
        <nav class="flex-1 text-center">
          <ul class="inline-flex space-x-6">
            <li>
              <a href="#" class="hover:text-gray-400">
                ホーム
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-gray-400">
                サービス
              </a>
            </li>
            <li>
              <a href="#" class="hover:text-gray-400">
                お問い合わせ
              </a>
            </li>
          </ul>
        </nav>
        <a href="#" class="text-xl font-bold">
          <img src="x.png" alt="X" class="h-8" />
        </a>
      </header>

      <DraggableInfiniteBoard>
        {notes().map((note) => (
          <DraggableStickyNote
            id={note.id}
            onMove={(newPos: { x: number; y: number }) => {
              sendMoveNote({ id: note.id, x: newPos.x, y: newPos.y });
            }}
          />
        ))}
      </DraggableInfiniteBoard>
      <div class="bg-[#121212]">
        <div class="container mx-auto px-4 py-16">
          <div class="text-[#fff] text-6xl font-bold text-center mb-8 slide-in">
        電子工学部
          </div>
          
          <div class="text-[#fff] max-w-3xl mx-auto text-center mb-12 opacity-90 slide-in-delayed">
        <p class="text-xl leading-relaxed">
          私たちは電子工学部です。主にプログラミングやハードウェア開発を行っています。
          部員それぞれが興味のある分野で、ゲーム開発やウェブアプリケーション作成、
          電子工作などに取り組んでいます。
        </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-[#fff] text-center fade-in mb-12">
        <div class="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#252525] transition-all hover:scale-105 hover:rotate-2">
          <h3 class="text-2xl font-bold mb-4">活動内容</h3>
          <p>〇〇〇</p>
        </div>
        <div class="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#252525] transition-all hover:scale-105 hover:rotate-2">
          <h3 class="text-2xl font-bold mb-4">活動時間</h3>
          <p class="mb-2">平日：13:30-18:00</p>
          <p class="mb-2">水木金が主な活動日</p>
          <p>休日は不定期で活動</p>
        </div>
        <div class="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#252525] transition-all hover:scale-105 hover:rotate-2">
          <h3 class="text-2xl font-bold mb-4">活動場所</h3>
          <p class="mb-2">メイン：LAN教室</p>
        </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#fff] text-center fade-in ">
        <div class="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#252525] transition-all hover:scale-105 hover:rotate-2">
          <h3 class="text-2xl font-bold mb-4">活動実績</h3>
          <p>休日は不定期で活動</p>
        </div>
        <div class="bg-[#1a1a1a] p-6 rounded-lg hover:bg-[#252525] transition-all hover:scale-105 hover:rotate-2">
          <h3 class="text-2xl font-bold mb-4">部員募集中！</h3>
          <p class="mb-2">初心者大歓迎！</p>
          <p class="mb-2">興味のある方は気軽に見学に来てください</p>
          <p>顧問：○○先生</p>
        </div>
          </div>
        </div>
      </div>
      <div class="bg-[#1a1a1a] py-16">
        <div class="container mx-auto px-4">
          <h2 class="text-4xl font-bold text-white text-center mb-12">作品展示</h2>
          <div class="flex justify-center mb-12">
          {tags.map((tag, index) => (
            <button
              class="mx-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                    border border-blue-500 focus:outline-none card-hover"
              style={{
                "animation": `slideIn 0.3s ease-out ${index * 0.1}s forwards`,
                "opacity": "0"
              }}
              classList={{
                "bg-blue-600 text-white hover:bg-blue-700": selectedTag().includes(tag),
                "bg-transparent text-blue-500 hover:bg-blue-600 hover:text-white": !selectedTag().includes(tag)
              }}
              onClick={() => {
                setSelectedTag((prev) => {
                  if (prev.includes(tag)) {
                    return prev.filter((t) => t !== tag);
                  } else {
                    return [...prev, tag];
                  }
                });
              }}
            >
              {tag}
            </button>
          ))}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement) => {
              if (!announcement.tags.some((tag) => selectedTag().includes(tag))) {
                if(selectedTag().length !== 0) {
                  return null;
                }
              }
              return <div class="bg-[#252525] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                  <img 
                    src={announcement.images} 
                    alt={announcement.title} 
                    class="w-full h-48 object-cover"
                  />
                  <div class="p-6">
                    <h3 class="text-2xl font-bold text-white mb-2">
                      {announcement.title}
                    </h3>
                    <p class="text-gray-300 mb-4">
                      {announcement.description}
                    </p>
                    <a 
                      href={announcement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      詳細を見る
                    </a>
                  </div>
                </div>;
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export function sendNewNote(note: { x: number; y: number; color: string; content: string }) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "create", note }));
  } else {
    console.error("ソケットが接続されていません");
  }
}

export function sendMoveNote(note: { id: string; x: number; y: number }) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "move", note }));
  } else {
    console.error("ソケットが接続されていません");
  }
}