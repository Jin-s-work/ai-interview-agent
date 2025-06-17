from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from google import genai

# 환경변수 & Gemini 클라이언트
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

app = Flask(__name__)
CORS(app)

@app.route("/api/generate-question", methods=["POST"])
def generate_question():
    data = request.get_json() or {}
    topic = data.get("topic", "").strip()
    if not topic:
        return jsonify({"error": "topic이 없습니다."}), 400

    # 인성면접일 때
    if topic == "인성면접":
        prompt = (
            "한국 기업의 개발자 인성 면접에서 자주 묻는 질문 하나를 "
            "한국어로 생성해줘."
        )
    else:
        prompt = (
            f"한국 기업 개발자 면접에서 자주 나오는 {topic} 관련 "
            "컴퓨터공학(CS) 질문 하나를 난이도 초~중급으로 한국어로 생성해줘."
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

# (기존 /api/chat 라우트는 그대로 두세요)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
