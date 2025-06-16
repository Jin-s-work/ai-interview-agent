import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://127.0.0.1:5000";

  // CS 면접 질문 생성
  const generateQuestion = async () => {
    setError("");
    setAnswer("");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/generate-question`);
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || res.statusText);
      }
      const { question } = await res.json();
      setQuestion(question);
    } catch (err) {
      console.error(err);
      setError("질문 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 생성된 질문에 답변 요청
  const getAnswer = async () => {
    setError("");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/answer-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || res.statusText);
      }
      const { answer } = await res.json();
      setAnswer(answer);
    } catch (err) {
      console.error(err);
      setError("답변 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          CS 면접 도우미
        </h1>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col space-y-4">
          <Button
            onClick={generateQuestion}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "질문 생성 중..." : "면접 질문 자동 생성"}
          </Button>

          {question && (
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-700">
                  생성된 질문
                </h2>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                  {question}
                </p>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={getAnswer}
            disabled={loading || !question}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "답변 생성 중..." : "Gemini에게 답변 요청"}
          </Button>

          {answer && (
            <Card className="bg-green-50 border-green-200">
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-700">
                  모범 답안
                </h2>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                  {answer}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
