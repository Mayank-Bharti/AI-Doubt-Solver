import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for the frontend (running on Vite usually ports 5173 or 3000)
CORS(app)

# Configure Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
else:
    genai.configure(api_key=API_KEY)

@app.route('/api/solve', methods=['POST'])
def solve_doubt():
    try:
        data = request.json
        doubt = data.get('doubt')
        subject = data.get('subject', 'General')
        grade = data.get('grade', 'Class 10')

        if not doubt:
            return jsonify({"error": "Doubt content is required"}), 400

        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""
        You are a helpful and expert school tutor for students from Class 6 to Class 12. 
        The student has a doubt in {subject} and is in {grade}.
        
        Doubt: "{doubt}"
        
        Please provide:
        1. A clear, encouraging, and detailed explanation tailored to their grade level.
        2. A step-by-step breakdown of how to solve or understand the problem.
        3. A short "Pro Tip" or "Memory Trick" for this concept.
        
        Format your response as a JSON object with the following keys:
        {{
          "answer": "string (the main explanation)",
          "steps": ["string", "string", ...],
          "tips": "string"
        }}
        Return ONLY the JSON.
        """

        response = model.generate_content(prompt)
        text = response.text
        
        # Clean the response (sometimes AI adds markdown blocks)
        clean_json = text.replace("```json", "").replace("```", "").strip()
        parsed_response = json.loads(clean_json)
        
        return jsonify(parsed_response)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "answer": f"Backend Error: {str(e)}",
            "steps": ["Ensure GEMINI_API_KEY is set in backend/.env", "Check your internet connection"],
            "tips": "Make sure the Flask server is running on port 5000"
        }), 500

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(debug=True, port=5000)
