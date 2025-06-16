from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from google import genai

# 1) 환경변수 로드
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("⚠️ GOOGLE_API_KEY가 설정되지 않았습니다. server/.env를 확인하세요.")

# 2) Gemini 클라이언트 초기화
client = genai.Client(api_key=api_key)

# 3) Flask 앱 초기화 → CORS 허용
app = Flask(__name__)
CORS(app)

# 4) 질문 생성 API
@app.route("/api/generate-question", methods=["GET"])
def generate_question():
    prompt = (
        "한국 기업 개발자 면접에서 자주 나오는 컴퓨터공학(CS) 이론 질문 하나를 "
        "중~상급 난이도로 한국어로 생성해줘."
    )
    try:
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return jsonify({"question": resp.text.strip()})
    except Exception as e:
        app.logger.error("질문 생성 실패", exc_info=e)
        return jsonify({"error": str(e)}), 500

# 5) 답변 생성 API
@app.route("/api/answer-question", methods=["POST"])
def answer_question():
    data = request.get_json() or {}
    q = data.get("question", "").strip()
    if not q:
        return jsonify({"error": "질문이 없습니다."}), 400
    try:
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=q
        )
        return jsonify({"answer": resp.text.strip()})
    except Exception as e:
        app.logger.error("답변 생성 실패", exc_info=e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
