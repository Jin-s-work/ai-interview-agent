import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai  # ✅ 올바른 import 경로

# 환경 변수 불러오기
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY가 .env에 설정되어 있지 않습니다.")

# Gemini API 초기화
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")  # 또는 "gemini-pro", "gemini-1.5-pro" 등

# Flask 앱 설정
app = Flask(__name__)
CORS(app)

# 텍스트 정리 함수
def sanitize_text(text: str) -> str:
    t = re.sub(r"(\*\*|__)", "", text)
    return t.strip()

# 질문 생성 엔드포인트
@app.route("/api/generate-question", methods=["POST"])
def generate_question():
    topic = (request.json or {}).get("topic", "").strip()
    if not topic:
        return jsonify({"error": "topic이 없습니다."}), 400

    if topic == "인성면접":
        prompt = "한국 기업 개발자 면접 중 인성면접에서 자주 나오는 질문 하나를 생성해 주세요.\n질문은 매번 새롭게 구성해 주세요. 이전과 중복되지 않아야 합니다.\n오직 질문 문장만 출력해 주세요."
    else:
        prompt = (
            f"한국 기업 개발자 면접에서 자주 나오는 {topic} 관련\n"
            "CS 질문 하나를 초~중급 난이도로 생성해 주세요.\n"
            "질문은 매번 새롭게 구성해 주세요. 이전과 중복되지 않아야 합니다.\n"
            "오직 질문 문장만 출력해 주세요."
        )

    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.8}
    )
    return jsonify({"question": sanitize_text(response.text)})

# 피드백 + 다음 질문 엔드포인트
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

    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.8}
    )
    raw = response.text or ""

    parts = re.split(r"^다음 질문:\s*", raw, maxsplit=1, flags=re.MULTILINE)
    feedback_raw = parts[0].strip()
    next_q_raw = parts[1].strip() if len(parts) > 1 else ""

    return jsonify({
        "feedback": sanitize_text(feedback_raw),
        "next_question": sanitize_text(next_q_raw),
    })

# 서버 실행
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
