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
  const [score, setScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    const qId = questions[currentQ].id;
    const newAnswers = { ...answers, [qId]: score };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setScore(null); // reset bubble
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
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', width: '100%', gap: '1rem' }}>
          <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap' }}>เห็นด้วย</span>
          
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { value: 100, color: '#2ecc71', size: 56 },
              { value: 80, color: '#2ecc71', size: 46 },
              { value: 60, color: '#2ecc71', size: 36 },
              { value: 50, color: '#95a5a6', size: 30 },
              { value: 40, color: '#9b59b6', size: 36 },
              { value: 20, color: '#9b59b6', size: 46 },
              { value: 0, color: '#9b59b6', size: 56 },
            ].map((opt, i) => {
              const isSelected = score === opt.value;
              return (
                <div 
                  key={i} 
                  onClick={() => setScore(opt.value)}
                  style={{ 
                    width: `${opt.size}px`, 
                    height: `${opt.size}px`, 
                    borderRadius: '50%', 
                    border: `3px solid ${opt.color}`,
                    backgroundColor: isSelected ? opt.color : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 15px ${opt.color}60` : 'none'
                  }}
                >
                  {isSelected && <span style={{ color: 'white', fontSize: `${opt.size * 0.5}px`, lineHeight: 1 }}>✓</span>}
                </div>
              )
            })}
          </div>

          <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap' }}>ไม่เห็นด้วย</span>
        </div>

        <button 
          onClick={handleNext} 
          disabled={isSubmitting || score === null}
          className="upgrade-btn" 
          style={{ 
            padding: '12px 32px', 
            fontSize: '1.2rem', 
            background: score === null ? '#555' : '#3498db', 
            color: 'white',
            cursor: score === null ? 'not-allowed' : 'pointer',
            opacity: score === null ? 0.5 : 1
          }}
        >
          {isSubmitting ? 'กำลังประมวลผล...' : (currentQ === questions.length - 1 ? 'ดูผลลัพธ์' : 'ข้อต่อไป')}
        </button>
      </div>
    </div>
  );
}
