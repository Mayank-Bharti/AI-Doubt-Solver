# DoubtBuster AI 🚀

DoubtBuster AI is a premium, AI-powered doubt-solving tool designed for school students (Class 6 to Class 12). It provides clear, grade-appropriate explanations for any subject using Google's Gemini AI.

## ✨ Features

- **Grade-Specific Explanations:** Tailors responses for Class 6-12 students.
- **Subject Expertise:** Supports Math, Science, English, History, and more.
- **Step-by-Step Breakdown:** Helps students understand the *how* and *why*.
- **Premium UI:** Beautiful glassmorphism design with dark mode and smooth animations.
- **Powered by Gemini 1.5 Flash:** Fast and accurate AI analysis.

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Backend:** Python + Flask
- **AI Engine:** Google Generative AI (Gemini Python SDK)
- **Styling:** Vanilla CSS (Modern Design System)

## 🚀 Getting Started

### 1. Backend Setup (Flask)
```bash
cd backend
pip install flask flask-cors google-generativeai python-dotenv
```
- Create a `.env` file in the `backend` directory.
- Add your Gemini API Key:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- Run the Flask server:
  ```bash
  python app.py
  ```

> [!IMPORTANT]
> **Security Note:** `.env` files are ignored by Git to protect your API keys. You must manually create them based on the `.env.example` files provided in both frontend and backend directories.

### 2. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```

## 📄 License

MIT
