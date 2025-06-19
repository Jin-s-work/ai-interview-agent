import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function App() {
  const topics = [
    "자료구조","운영체제","네트워크","데이터베이스",
    "AI","데이터 사이언스","알고리즘","CS 종합","인성면접",
  ];

  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // { role, type, content }
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const API = "http://127.0.0.1:5000";

  const scrollToBottom = () =>
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // 첫 질문 생성
  useEffect(() => {
    (async () => {
      setLoading(true);
      setMessages([]);
      setMessage("");
      try {
        const res = await fetch(`${API}/api/generate-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: selectedTopic }),
        });
        const { question } = await res.json();
        setMessages([{ role: "agent", type: "question", content: question }]);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedTopic]);

  // 답변 전송 → 피드백 + 다음 질문
  const sendMessage = async () => {
    if (!message.trim()) return;

    const updated = [...messages, { role: "user", type: "answer", content: message }];
    setMessages(updated);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const { feedback, next_question } = await res.json();

      setMessages([
        ...updated,
        { role: "agent", type: "feedback", content: feedback },
        { role: "agent", type: "question", content: next_question },
      ]);
      scrollToBottom();
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { role: "agent", type: "error", content: "⚠️ 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-blue-600 text-white py-4 text-center font-semibold">
        CS·인성·AI 면접 에이전트
      </header>

      <nav className="flex flex-wrap gap-2 p-4 bg-white border-b">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-4 py-2 rounded-full text-sm border ${
              selectedTopic === t
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const justify = isUser ? "justify-end" : "justify-start";
          let bg, border;
          if (isUser) {
            bg = "bg-blue-600 text-white";
            border = "";
          } else if (m.type === "feedback") {
            bg = "bg-yellow-50 text-gray-900";
            border = "border border-yellow-200";
          } else {
            bg = "bg-white text-gray-900";
            border = "border border-gray-300";
          }

          return (
            <div key={i} className={`flex ${justify}`}>
              <div
                className={`${bg} ${border} max-w-[75%] px-4 py-2 rounded-xl whitespace-pre-wrap text-sm`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="animate-pulse bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm">
              Gemini가 작업 중입니다...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="p-4 bg-white flex gap-2">
        <input
          className="flex-1 border rounded-l px-3 py-2 focus:outline-none text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="답변을 입력하고 Enter 또는 전송"
          onKeyUp={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          className="rounded-l-none bg-green-600 hover:bg-green-700 text-white"
        >
          전송
        </Button>
      </footer>
    </div>
  );
}
