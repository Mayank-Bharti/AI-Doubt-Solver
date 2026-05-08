# 🎓 DoubtBuster AI

**DoubtBuster AI** is a premium, full-stack AI-powered educational tool designed specifically for school students (Classes 6 to 12). It provides high-quality, step-by-step explanations for doubts across various subjects using Google's Gemini AI, wrapped in a beautiful, highly interactive Glassmorphism UI.

## 🌟 Key Features
- **Dynamic Subject Themes:** The entire UI (colors, borders, backgrounds) automatically adapts based on the chosen subject (e.g., Physics turns Amber, Biology turns Pink).
- **Dual-Engine AI System:** Features an incredibly robust backend that uses **Google Gemini 1.5 Flash**. If the API encounters regional restrictions or fails, it automatically switches to a **Keyless Web Search Engine (DuckDuckGo AI)** to ensure the student *always* gets an answer.
- **Smart Math Solver:** Internally detects and calculates exact answers for specific mathematical problems (like HCF/LCM) locally, independent of cloud AI.
- **Framer Motion Animations:** Smooth, engaging UI transitions that make learning feel premium.
- **One-Click Copy:** Easily copy the AI's step-by-step explanations to the clipboard.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Framer Motion, Lucide-React, Vanilla CSS (Glassmorphism).
- **Backend:** Python, Flask, Flask-CORS, Google Generative AI (Gemini), DuckDuckGo Search (Fallback).

## 🚀 How to Run Locally

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Install the required dependencies:
   ```bash
   pip install flask flask-cors google-generativeai python-dotenv requests duckduckgo-search
   ```
3. Create a `.env` file in the `backend` folder and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Run the Flask server:
   ```bash
   python app.py
   ```
   *The backend will run on `http://127.0.0.1:5000`*

### 2. Frontend Setup
1. Open a second terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` link in your browser!

## 🔒 Security
- This project utilizes comprehensive `.gitignore` configurations at both the root and folder levels to ensure that `.env` files and API keys are never pushed to public repositories.
