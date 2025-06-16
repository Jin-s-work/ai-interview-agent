from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
from dotenv import load_dotenv
import os
from google import genai

# 1. 환경 변수 및 Gemini 클라이언트
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=api_key)

# 2. Flask + CORS + Session
app = Flask(__name__, static_folder="../public", static_url_path="/")
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET") or "dev_secret!"
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
CORS(app)

# 3. 대화 초기화용 헬퍼
def init_memory():
    session["history"] = []

# 4. 질문 생성(기존)
@app.route("/api/generate-question", methods=["GET"])
def generate_question():
    session.pop("history", None)
    prompt = (
      "CS 면접 대비 Agent야. 사용자가 연속으로 연습할 수 있도록, "
      "한국 기업 면접에서 나올 법한 전산학 질문 하나를 한국어로 내놓고 "
      "세션 메모리에 {Q1}로 저장해줘."
    )
    resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    q = resp.text.strip()
    init_memory()
    session["history"].append({"role": "agent", "content": q})
    return jsonify({"question": q})

# 5. 대화형 채팅 엔드포인트
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    user_msg = data.get("message", "").strip()
    if not user_msg:
        return jsonify({"error":"메시지가 없습니다."}), 400

    # 세션 히스토리 가져오기(없으면 초기화)
    history = session.get("history", [])
    history.append({"role": "user", "content": user_msg})

    # LLM 프롬프트: 대화 히스토리 전체 전달
    convo = "\n".join(
      f"{h['role']}:{h['content']}" for h in history
    )
    prompt = (
      "아래는 CS 면접 대비 연습 대화 히스토리야.\n"
      f"{convo}\n"
      "다음 Agent의 응답(모범 답안)을 한국어로 작성해줘."
    )

    resp = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    agent_msg = resp.text.strip()

    # 히스토리에 추가 후 저장
    history.append({"role": "agent", "content": agent_msg})
    session["history"] = history

    return jsonify({"reply": agent_msg})

# 6. React 앱 서빙 (production)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
