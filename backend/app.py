import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from the same directory as the script
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)
# Enable CORS for the frontend (running on Vite usually ports 5173 or 3000)
CORS(app)

# Configure Gemini
API_KEY = (os.getenv("GEMINI_API_KEY") or "").strip()
if not API_KEY or API_KEY == "your_api_key_here":
    print("CRITICAL: GEMINI_API_KEY is either missing or still set to 'your_api_key_here' in backend/.env")
else:
    print(f"Gemini API Key loaded successfully (starts with {API_KEY[:4]}...)")
    # Using 'rest' transport can sometimes solve connection/model issues on certain networks
    genai.configure(api_key=API_KEY, transport='rest')

@app.route('/api/solve', methods=['POST'])
def solve_doubt():
    try:
        data = request.json
        doubt = data.get('doubt')
        subject = data.get('subject', 'General')
        grade = data.get('grade', 'Class 10')

        if not doubt:
            return jsonify({"error": "Doubt content is required"}), 400

        import requests
        
        # Clean the API Key
        CLEAN_KEY = API_KEY.strip()
        
        # --- MODEL DISCOVERY (v1beta) ---
        available_models = []
        try:
            # Trying v1beta which is often more permissive for new keys
            list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={CLEAN_KEY}"
            r = requests.get(list_url)
            list_res = r.json()
            print(f"DEBUG: Raw Model List Response: {list_res}")
            
            if 'models' in list_res:
                available_models = [m['name'] for m in list_res['models'] if 'generateContent' in m['supportedGenerationMethods']]
                print(f"DEBUG: Found available models: {available_models}")
            else:
                print(f"DEBUG: No models key in response. Error: {list_res.get('error', 'Unknown')}")
        except Exception as e:
            print(f"DEBUG: Could not list models: {str(e)}")

        # Priority list
        priority_models = ['models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemini-pro']
        
        final_model_list = []
        for m in available_models:
            if m not in final_model_list: final_model_list.append(m)
        for m in priority_models:
            if m not in final_model_list: final_model_list.append(m)

        # --- DUAL-ENGINE AI SYSTEM ---
        success = False
        text = ""
        last_error = ""

        # Engine 1: Gemini (Try only if key looks valid)
        if CLEAN_KEY and CLEAN_KEY != "your_api_key_here":
            for model_path in final_model_list:
                try:
                    print(f"DEBUG: Trying Gemini {model_path}...")
                    url = f"https://generativelanguage.googleapis.com/v1beta/{model_path}:generateContent?key={CLEAN_KEY}"
                    prompt_payload = {
                        "contents": [{
                            "parts": [{"text": f"Solve this {subject} doubt for {grade}: {doubt}. Return ONLY JSON with keys: answer, steps (list), tips."}]
                        }]
                    }
                    response = requests.post(url, json=prompt_payload, headers={"Content-Type": "application/json"}, timeout=10)
                    res_json = response.json()

                    if response.status_code == 200:
                        text = res_json['candidates'][0]['content']['parts'][0]['text']
                        success = True
                        break
                    else:
                        last_error = res_json.get('error', {}).get('message', 'Unknown error')
                        print(f"DEBUG: Gemini {model_path} failed: {last_error}")
                except Exception as e:
                    print(f"DEBUG: Gemini request failed: {str(e)}")
                    continue

        # Engine 2: Keyless Web AI Fallback
        if not success:
            print("DEBUG: Gemini failed. Using Bulletproof Web Search Fallback...")
            try:
                # First, check if it's a math problem we can solve perfectly
                import math
                import re
                hcf_match = re.search(r'HCF\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)', doubt, re.IGNORECASE)
                if hcf_match:
                    a, b = int(hcf_match.group(1)), int(hcf_match.group(2))
                    ans = math.gcd(a, b)
                    return jsonify({
                        "answer": f"The HCF of {a} and {b} is {ans}.",
                        "steps": [f"Step 1: Identify numbers {a} and {b}.", f"Step 2: Find the greatest common divisor.", f"Step 3: Result is {ans}."],
                        "tips": "Pro Tip: HCF is also known as Greatest Common Divisor (GCD)."
                    })

                # If not a math problem, use DuckDuckGo text search to find the answer
                from duckduckgo_search import DDGS
                with DDGS() as ddgs:
                    results = list(ddgs.text(doubt + " simple explanation", max_results=3))
                    
                    if results:
                        combined_info = results[0]['body']
                        if len(results) > 1:
                            combined_info += " " + results[1]['body']
                            
                        parsed_response = {
                            "answer": combined_info,
                            "steps": [
                                "Step 1: Read the explanation carefully.",
                                "Step 2: Identify the key terms.",
                                "Step 3: Apply this to your textbook."
                            ],
                            "tips": "Source: Web AI Search (Gemini API is currently unavailable for your key)."
                        }
                        return jsonify(parsed_response)
                    else:
                        raise Exception("No search results found.")
            except Exception as e:
                print(f"DEBUG: Keyless AI also failed: {str(e)}")
                last_error = f"All engines failed. Gemini Error: {last_error} | Web Search Error: {str(e)}"

        if not success:
            return jsonify({
                "error": last_error,
                "answer": "Google's Gemini API has rejected your key, and the backup web search also failed.",
                "steps": [
                    "1. Go to https://aistudio.google.com/app/apikey",
                    "2. Create a NEW API key (make sure Generative Language API is enabled).",
                    "3. Paste the new key into frontend/.env and restart the server."
                ],
                "tips": "This is a Google Cloud permission issue, not a code issue!"
            }), 500

        # Robust JSON extraction
        import json
        import re
        
        # Try to find JSON block in the text
        try:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                clean_json = match.group(0).strip()
                parsed_response = json.loads(clean_json)
            else:
                # If no JSON found, create one from the raw text
                parsed_response = {
                    "answer": text,
                    "steps": ["Follow the explanation above for step-by-step guidance."],
                    "tips": "Try asking more specific questions for better results!"
                }
            return jsonify(parsed_response)
        except Exception as e:
            print(f"DEBUG: JSON parsing failed: {str(e)}")
            return jsonify({
                "answer": text[:500] + "...",
                "steps": ["The AI responded but I had trouble formatting it."],
                "tips": "Ask the question again in a simpler way."
            })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            "error": str(e),
            "answer": f"System Error: {str(e)}",
            "steps": ["Restarting the server might help", "Check if the API key is valid"],
            "tips": "Make sure you are connected to the internet."
        }), 500
        
        # Robust JSON extraction
        try:
            # Find the first { and last } to extract JSON
            start = text.find('{')
            end = text.rfind('}') + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON found in AI response")
            
            clean_json = text[start:end].strip()
            parsed_response = json.loads(clean_json)
            return jsonify(parsed_response)
            
        except (json.JSONDecodeError, ValueError) as je:
            print(f"JSON Parsing Error: {str(je)} | Raw Text: {text}")
            return jsonify({
                "answer": "The AI provided an explanation, but I had trouble formatting it. Raw response: " + text[:500],
                "steps": ["Try rephrasing your question", "Check if the subject matches the question"],
                "tips": "Sometimes the AI gets too creative with formatting!"
            }), 200 # Return 200 but with a fallback message

    except Exception as e:
        print(f"General Error: {str(e)}")
        return jsonify({
            "error": str(e),
            "answer": f"Backend Error: {str(e)}",
            "steps": ["Ensure your Gemini API key is active", "Check if you have reached your API quota"],
            "tips": "Verify your internet connection and try again."
        }), 500

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(debug=True, port=5000)
