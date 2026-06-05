import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { questions } from '../data/questions';
import { skillsList } from '../data/characters';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname || 'Guest';

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    const qId = questions[currentQ].id;
    const newAnswers = { ...answers, [qId]: score };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setScore(50); // reset slider
    } else {
      // Submit
      setIsSubmitting(true);
      
      // Calculate skills (base 20 + up to 80 from answer)
      const finalSkills = {};
      skillsList.forEach(s => {
        finalSkills[s.id] = 20 + Math.floor((newAnswers[s.id] || 0) * 0.8);
      });

      // Determine character
      let maxScore = -1;
      let topTrait = 'naturalist';
      let allHigh = true;

      for (const [key, val] of Object.entries(finalSkills)) {
        if (val > maxScore) {
          maxScore = val;
          topTrait = key;
        }
        if (val < 70) allHigh = false;
      }
      
      let character_key = topTrait;
      if (allHigh) character_key = 'hybrid';

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname,
            character_key,
            answers: newAnswers,
            skills: finalSkills
          })
        });
        const savedUser = await res.json();
        
        // Save to Local Storage
        localStorage.setItem('mbti_user', JSON.stringify(savedUser));
        
        navigate('/result', { state: { user: savedUser } });
      } catch (err) {
        console.error(err);
        alert('Error saving data. API might not be running.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="right-panel" style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>คำถามที่ {currentQ + 1} / 8</h2>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '3rem', lineHeight: '1.5' }}>
          {questions[currentQ].text}
        </h3>
        
        <div style={{ marginBottom: '3rem' }}>
          <input 
            type="range" 
            min="0" max="100" 
            value={score} 
            onChange={e => setScore(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-naturalist)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-muted)' }}>
            <span>น้อยมาก (0)</span>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>{score}%</span>
            <span>มากที่สุด (100)</span>
          </div>
        </div>

        <button 
          onClick={handleNext} 
          disabled={isSubmitting}
          className="upgrade-btn" 
          style={{ padding: '12px 32px', fontSize: '1.2rem', background: '#3498db', color: 'white' }}
        >
          {isSubmitting ? 'กำลังประมวลผล...' : (currentQ === questions.length - 1 ? 'ดูผลลัพธ์' : 'ข้อต่อไป')}
        </button>
      </div>
    </div>
  );
}
