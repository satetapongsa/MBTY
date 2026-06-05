import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { questions } from '../data/questions';
import { characters, skillsList } from '../data/characters';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname || 'Guest';

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const autoAdvanceRef = useRef(null);

  const handleNext = async (val = score) => {
    if (val === null) return;
    
    const qId = questions[currentQ].id;
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      setScore(newAnswers[questions[nextQ]?.id] ?? null);
    } else {
      // Submit
      setIsSubmitting(true);
      
      // Calculate average score per skill
      const skillSums = {};
      const skillCounts = {};
      
      skillsList.forEach(s => {
        skillSums[s.id] = 0;
        skillCounts[s.id] = 0;
      });

      Object.keys(newAnswers).forEach(ansQId => {
        const q = questions.find(x => x.id === ansQId);
        if (q) {
          skillSums[q.skill] += newAnswers[ansQId];
          skillCounts[q.skill] += 1;
        }
      });

      const finalSkills = {};
      skillsList.forEach(s => {
        const avg = skillCounts[s.id] > 0 ? (skillSums[s.id] / skillCounts[s.id]) : 0;
        finalSkills[s.id] = 20 + Math.floor(avg * 0.8);
      });

      let maxScore = -1;
      let topTrait = 'naturalist';
      let allHigh = true;

      for (const [key, v] of Object.entries(finalSkills)) {
        if (v > maxScore) {
          maxScore = v;
          topTrait = key;
        }
        if (v < 70) allHigh = false;
      }
      
      let character_key = topTrait;
      
      // Combo Characters Logic
      const isHigh = (s1, s2) => finalSkills[s1] >= 75 && finalSkills[s2] >= 75;
      
      if (isHigh('interpersonal', 'linguistic')) character_key = 'visionary';
      else if (isHigh('logical', 'spatial')) character_key = 'inventor';
      else if (isHigh('musical', 'bodily')) character_key = 'performer';
      else if (isHigh('intrapersonal', 'naturalist')) character_key = 'sage';
      else if (allHigh) character_key = 'hybrid';

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
        
        localStorage.setItem('mbti_user', JSON.stringify(savedUser));
        navigate('/result', { state: { user: savedUser } });
      } catch (err) {
        console.error(err);
        alert('Error saving data. API might not be running.');
        setIsSubmitting(false);
      }
    }
  };

  const handleOptionClick = (val) => {
    setScore(val);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    
    if (currentQ < questions.length - 1) {
      autoAdvanceRef.current = setTimeout(() => {
        handleNext(val);
      }, 400); // 400ms delay before auto advancing
    }
  };

  const handleBack = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (currentQ > 0) {
      const prevQ = currentQ - 1;
      setCurrentQ(prevQ);
      setScore(answers[questions[prevQ].id] ?? null);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Blurred Character Grid Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        padding: '2rem',
        filter: 'blur(15px) brightness(0.3)',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {Object.values(characters).map(c => (
          <div key={c.key} style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
            <img src={c.image} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Floating Quiz Modal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(19, 22, 32, 0.75)',
        padding: '4rem 2rem',
        borderRadius: '24px',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        maxWidth: '800px',
        width: '90%',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
      {currentQ > 0 && (
        <button 
          onClick={handleBack}
          style={{ 
            position: 'absolute', top: '1.5rem', left: '1.5rem', 
            background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', 
            borderRadius: '50px', padding: '8px 20px', color: '#fff', fontSize: '1rem', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', 
            transition: 'all 0.3s ease', backdropFilter: 'blur(10px)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span> ย้อนกลับ
        </button>
      )}

      <div className="right-panel" style={{ width: '100%', maxWidth: '700px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>คำถามที่ {currentQ + 1} / {questions.length}</h2>
        <h3 style={{ fontSize: '1.6rem', marginBottom: '3rem', lineHeight: '1.5' }}>
          {questions[currentQ].text}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', width: '100%', gap: '1.5rem' }}>
          <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>ไม่เห็นด้วย</span>
          
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center' }}>
            {[
              { value: 0, color: '#9b59b6', size: 56 },
              { value: 20, color: '#9b59b6', size: 46 },
              { value: 40, color: '#9b59b6', size: 36 },
              { value: 50, color: '#95a5a6', size: 30 },
              { value: 60, color: '#2ecc71', size: 36 },
              { value: 80, color: '#2ecc71', size: 46 },
              { value: 100, color: '#2ecc71', size: 56 },
            ].map((opt, i) => {
              const isSelected = score === opt.value;
              return (
                <div 
                  key={i} 
                  onClick={() => handleOptionClick(opt.value)}
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

          <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '1.1rem', whiteSpace: 'nowrap' }}>เห็นด้วย</span>
        </div>

        {currentQ === questions.length - 1 && (
          <button 
            onClick={() => handleNext(score)} 
            disabled={isSubmitting || score === null}
            className="upgrade-btn" 
            style={{ 
              padding: '12px 32px', 
              fontSize: '1.2rem', 
              background: score === null ? '#555' : '#3498db', 
              color: 'white',
              cursor: score === null ? 'not-allowed' : 'pointer',
              opacity: score === null ? 0.5 : 1,
              marginTop: '1rem'
            }}
          >
            {isSubmitting ? 'กำลังประมวลผล...' : 'ดูผลลัพธ์'}
          </button>
        )}
      </div>
    </div>
  );
}
