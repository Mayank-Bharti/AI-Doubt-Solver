import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [doubt, setDoubt] = useState('');
  const [subject, setSubject] = useState('General');
  const [grade, setGrade] = useState('Class 10');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const subjectThemes = {
    'Mathematics': { color: '#6366f1', icon: '🔢' },
    'Physics': { color: '#f59e0b', icon: '⚛️' },
    'Chemistry': { color: '#10b981', icon: '🧪' },
    'Biology': { color: '#ec4899', icon: '🧬' },
    'English': { color: '#8b5cf6', icon: '📚' },
    'History': { color: '#ef4444', icon: '🏛️' },
    'General': { color: '#6366f1', icon: '✨' }
  };

  const currentTheme = subjectThemes[subject] || subjectThemes['General'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doubt.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      // Call the Flask backend
      const response = await fetch('http://127.0.0.1:5000/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doubt,
          subject,
          grade
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Backend server is not responding correctly.');
      }

      const data = await response.json();
      setResponse(data);
    } catch (error) {
      console.error(error);
      setResponse({
        answer: "Error: " + error.message,
        steps: [
          "1. Ensure the Flask server is running (python app.py)",
          "2. Check if GEMINI_API_KEY is set in backend/.env",
          "3. Verify internet connectivity"
        ],
        tips: "Make sure you have installed flask-cors in your backend."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      {/* Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '10px', borderRadius: '12px', background: currentTheme.color }}>
            <Sparkles size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Doubt<span style={{ color: currentTheme.color }}>Buster</span> AI
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>How it works</a>
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Login</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-text" 
          style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1' }}
        >
          Master any subject <br /> with AI-powered clarity.
        </motion.h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Paste your homework question, math problem, or science doubt and get instant, detailed explanations tailored for your grade.
        </p>
      </section>

      {/* Main Form */}
      <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Subject</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      background: subject === s ? currentTheme.color : 'rgba(255,255,255,0.05)',
                      border: '1px solid',
                      borderColor: subject === s ? currentTheme.color : 'rgba(255,255,255,0.1)',
                      color: subject === s ? 'white' : 'var(--text-muted)',
                      fontWeight: subject === s ? '700' : '500'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ width: '150px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Grade</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '0.85rem' }}
              >
                {[6,7,8,9,10,11,12].map(n => <option key={n} value={`Class ${n}`}>Class {n}</option>)}
              </select>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea 
              placeholder="Paste your question here or type your doubt..."
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              style={{ 
                width: '100%', 
                height: '150px', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                background: '#1e293b', 
                border: '1px solid #334155', 
                color: 'white',
                fontSize: '1rem',
                resize: 'none',
                marginBottom: '1.5rem'
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ 
                position: 'absolute', 
                bottom: '35px', 
                right: '15px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: `linear-gradient(135deg, ${currentTheme.color} 0%, #8b5cf6 100%)`
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {loading ? 'Solving...' : 'Solve Doubt'}
            </button>
          </div>
        </form>
      </div>

      {/* Response Area */}
      <AnimatePresence>
        {response && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card" 
            style={{ padding: '2.5rem', borderLeft: `4px solid ${currentTheme.color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color={currentTheme.color} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>AI Explanation</h3>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(response.answer);
                  alert('Explanation copied to clipboard!');
                }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Copy Answer
              </button>
            </div>
            
            <p style={{ lineHeight: '1.7', color: '#cbd5e1', marginBottom: '2rem', whiteSpace: 'pre-wrap' }}>
              {response.answer}
            </p>

            <div style={{ background: `${currentTheme.color}15`, padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: currentTheme.color }}>Step-by-Step Breakdown</h4>
              <ul style={{ listStyle: 'none' }}>
                {response.steps.map((step, idx) => (
                  <li key={idx} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                    <span style={{ fontWeight: '800', color: currentTheme.color }}>{idx + 1}.</span>
                    <span style={{ color: '#94a3b8' }}>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
              <Sparkles size={16} />
              <span>{response.tips}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '4rem 0 2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800' }}>10k+</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Doubts Solved</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800' }}>98%</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy Rate</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '800' }}>24/7</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Support</p>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © 2024 DoubtBuster AI. Designed for future scholars.
        </p>
      </footer>
    </div>
  );
}

export default App;
