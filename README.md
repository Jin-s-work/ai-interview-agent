# 💬 CS 면접 AI Agent

AI가 컴퓨터공학 면접 질문을 생성하고, 이에 대해 모범 답안을 제시하는 대화형 CS 면접 도우미입니다.  
Google Gemini API 기반으로 동작하며, React + Flask로 개발되었습니다.

<img width="700" alt="스크린샷 2025-06-17 오후 4 15 09" src="https://github.com/user-attachments/assets/66652f26-cc56-4059-ad35-7d82c0356d3e" />


---

## 🧠 주요 기능

- 컴퓨터공학(CS) 기반 면접 질문 자동 생성
- Gemini AI를 통한 자연스러운 모범 답변 생성
- 사용자의 답변 전송 및 에이전트와의 대화형 인터페이스
- 질문과 답변을 좌우 정렬하여 보기 좋게 출력
- 마크다운, 특수문자 제거 및 깔끔한 텍스트 렌더링
- TailwindCSS 기반의 반응형 UI

---

## 🛠️ 기술 스택

- **Frontend**: React + Vite, TailwindCSS
- **Backend**: Python (Flask), Gemini API
- **AI Model**: Gemini 2.0 Flash (`gemini-2.0-flash`)
- **환경변수 관리**: dotenv
