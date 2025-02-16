import { createEffect, createSignal, onMount } from "solid-js";
import { DraggableInfiniteBoard } from "./Boad";
import { DraggableStickyNote } from "./Notes";
import { atom, useAtom } from "solid-jotai";
import "./App.css";
import GlowingCursor from "./GlowingCursor";
import { announcements, tags } from "./announcements.ts";

const password = "password";
let socket: WebSocket | null = null;

export const notesState = atom<{
  x: number;
  y: number;
  content: string;
  color: string;
  id: string;
}[]>([]);

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
      <div class="scrollbar">
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
        <div class="bg-[#121212] scrollbar">
          <div class="container mx-auto px-4 py-16 scrollbar">
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
            <h2 class="text-4xl font-bold text-white text-center mb-12">
              作品展示
            </h2>
            <div class="flex justify-center mb-12">
              {Object.values(tags).filter((x) => typeof x === "string").map((
                tag: string,
                index: number,
              ) => (
                <button
                  class="mx-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                    border border-blue-500 focus:outline-none card-hover"
                  style={{
                    "animation": `slideIn 0.3s ease-out ${
                      index * 0.1
                    }s forwards`,
                    "opacity": "0",
                  }}
                  classList={{
                    "bg-blue-600 text-white hover:bg-blue-700": selectedTag()
                      .includes(tag),
                    "bg-transparent text-blue-500 hover:bg-blue-600 hover:text-white":
                      !selectedTag().includes(tag),
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
                if (
                  !announcement.tags.some((tag) => selectedTag().includes(tag))
                ) {
                  if (selectedTag().length !== 0) {
                    return null;
                  }
                }
                return (
                  <div class="bg-[#252525] rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
                    <img
                      src={announcement.images}
                      alt={announcement.title}
                      class="w-full h-48 object-cover"
                    />
                    <div class="p-6">
                      <h3 class="text-2xl font-bold text-white mb-2">
                        {announcement.title}
                      </h3>
                      <p class="text-gray-300 mb-1">
                        {announcement.description}
                      </p>
                      <p class="text-gray-400 mb-4">
                        作者: {announcement.creator}
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
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function sendNewNote(
  note: { x: number; y: number; color: string; content: string },
) {
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
