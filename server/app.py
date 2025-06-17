import re, os, json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

# 환경 변수 & Gemini 초기화
load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)

def sanitize_text(text: str) -> str:
    # **, __ 제거, 앞뒤 strip, 내부 줄넘김 유지
    t = re.sub(r"(\*\*|__)", "", text)
    return t.strip()

@app.route("/api/generate-question", methods=["POST"])
def generate_question():
    topic = (request.json or {}).get("topic", "").strip()
    if not topic:
        return jsonify({"error": "topic이 없습니다."}), 400

    if topic == "인성면접":
        prompt = (
            "한국 기업의 개발자 인성 면접에서 자주 묻는 질문 하나를 생성해 주세요.\n"
            "오직 질문 문장만 출력해 주세요."
        )
    else:
        prompt = (
            f"한국 기업 개발자 면접에서 자주 나오는 {topic} 관련\n"
            "CS 질문 하나를 초~중급 난이도로 생성해 주세요.\n"
            "오직 질문 문장만 출력해 주세요."
        )

    resp = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return jsonify({"question": sanitize_text(resp.text or "")})

@app.route("/api/chat", methods=["POST"])
def chat():
    user_msg = (request.json or {}).get("message", "").strip()
    if not user_msg:
        return jsonify({"error": "message가 없습니다."}), 400

    prompt = (
        f"사용자가 이렇게 답변했습니다:\n{user_msg}\n\n"
        "1) 이 답변에 대해 '잘한 점'과 '개선할 점'을 상세히 평가해 주세요.\n"
        "2) 이 질문에 대한 모범 답안도 제시해 주세요.\n"
        "3) 동일한 주제에 맞는 새로운 질문을 하나 제시해 주세요.\n\n"
        "출력 형식은 아래와 같으며, **반드시** '다음 질문:' 으로 시작하세요:\n\n"
        "<피드백 본문>\n\n"
        "다음 질문: <여기에 새 질문 문장>\n"
    )

    resp = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    raw = resp.text or ""

    # '다음 질문:' 마커로 분리
    parts = re.split(r"^다음 질문:\s*", raw, maxsplit=1, flags=re.MULTILINE)
    feedback_raw = parts[0].strip()
    next_q_raw = parts[1].strip() if len(parts) > 1 else ""

    return jsonify({
        "feedback": sanitize_text(feedback_raw),
        "next_question": sanitize_text(next_q_raw),
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
