import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
  const topics = [
    "자료구조",
    "알고리즘",
    "운영체제",
    "네트워크",
    "데이터베이스",
    "AI 지식",
    "데이터 사이언스",
    "CS 종합",
    "인성면접",
  ];

  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // { role, content }
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const API = "http://127.0.0.1:5000";

  // selectedTopic이 바뀔 때마다 첫 질문 생성
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${API}/api/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });
      const data = await res.json();
      setMessages([{ role: "agent", content: data.question }]);
      setLoading(false);
    })();
  }, [selectedTopic]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setMessages((m) => [...m, { role: "user", content: message }]);
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-blue-600 text-white py-4 text-center font-semibold text-xl">
        CS·인성 면접 AI Agent
      </header>

      {/* 토픽 선택 */}
      <nav className="flex flex-wrap gap-2 p-4 bg-white">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-4 py-2 rounded-full border ${
              selectedTopic === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-auto p-4 flex flex-col space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-lg p-4 rounded ${
              m.role === "agent"
                ? "bg-gray-200 self-start text-left"
                : "bg-blue-100 self-end text-right"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white flex gap-2">
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
