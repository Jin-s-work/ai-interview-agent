// src/App.jsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // { role, content } 리스트
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API = "http://127.0.0.1:5000";

  // 첫 질문 자동 생성
  useEffect(() => {
    (async () => {
      const res = await fetch(`${API}/api/generate-question`);
      const { question } = await res.json();
      setMessages([{ role: "agent", content: question }]);
    })();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMsg = { role: "user", content: message };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setLoading(true);

    const res = await fetch(`${API}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const { reply } = await res.json();
    setMessages((m) => [...m, { role: "agent", content: reply }]);
    setLoading(false);

    // 맨 아래로 스크롤
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ** 마크다운 볼드(**)만 제거해 주는 헬퍼
  const sanitize = (text) => text.replace(/\*\*/g, "");

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-blue-600 text-white py-4 text-center font-semibold text-xl">
        CS 면접 AI Agent
      </header>
      <main className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-lg p-4 rounded ${
              m.role === "agent"
                ? "bg-gray-200 self-start text-left"
                : "bg-blue-100 self-end text-right"
            }`}
          >
            <p className="whitespace-pre-wrap">
              {sanitize(m.content)}
            </p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>
      <footer className="p-4 bg-white flex">
        <input
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="답변 또는 다음 질문 요청"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          className="rounded-l-none bg-green-600 hover:bg-green-700"
        >
          {loading ? "⏳" : "전송"}
        </Button>
      </footer>
    </div>
  );
}
