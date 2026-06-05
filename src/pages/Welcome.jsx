import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { characters, skillsList } from '../data/characters';

export default function Welcome() {
  const [name, setName] = useState('');
  const [localUser, setLocalUser] = useState(null);
  const [selectedChar, setSelectedChar] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
      

    const saved = localStorage.getItem('mbti_user');
    if (saved) {
      try {
        setLocalUser(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleStart = (e) => {
    e.preventDefault();
    if (name.trim()) {
      navigate('/quiz', { state: { nickname: name } });
    }
  };

  const handleRetake = () => {
    if(window.confirm('หากทำแบบทดสอบใหม่ ข้อมูลเดิมของคุณในเบราว์เซอร์นี้จะหายไป ต้องการทำต่อหรือไม่?')) {
      localStorage.removeItem('mbti_user');
      setLocalUser(null);
      setName('');
    }
  };

  const hasDoneTest = localUser !== null;

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 10, position: 'relative' }}>
        <h1 className="title-main" style={{ fontSize: '3rem', justifyContent: 'center' }}>ค้นหาพลังพหุปัญญาในตัวคุณ</h1>
        <div className="description" style={{ fontSize: '1.2rem', maxWidth: '100%', margin: '0 auto' }}>
          สำรวจทั้ง {Object.keys(characters).length} คาแรคเตอร์ที่ซ่อนอยู่ในตัวคุณ<br/>
          {hasDoneTest ? (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => navigate('/result', { state: { user: localUser } })} className="upgrade-btn" style={{ padding: '10px 20px', fontSize: '1.1rem', background: '#3498db' }}>
                ดูโปรไฟล์ของฉัน
              </button>
              <button onClick={handleRetake} className="upgrade-btn" style={{ padding: '10px 20px', fontSize: '1.1rem', background: '#e74c3c' }}>
                เริ่มทำแบบทดสอบใหม่
              </button>
            </div>
          ) : (
            <span>กรุณาทำแบบทดสอบเพื่อปลดล็อกข้อมูลทั้งหมด</span>
          )}
        </div>
      </div>

      {/* Global Statistics */}
      {hasDoneTest && stats && stats.total > 0 && (
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ color: '#2ecc71', marginBottom: '0.5rem', fontSize: '1.5rem' }}>🌍 5 อันดับคาแรคเตอร์ที่พบมากที่สุด</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>
            จากผู้เข้าร่วมทดสอบทั้งหมด <strong style={{ color: 'white' }}>{stats.total.toLocaleString()}</strong> คน
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {stats.distribution.sort((a, b) => b.count - a.count).slice(0, 5).map((stat, i) => {
              const charInfo = Object.values(characters).find(c => c.key === stat.character_key);
              if (!charInfo) return null;
              const percentage = ((stat.count / stats.total) * 100).toFixed(1);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={charInfo.image} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '0.8rem', objectFit: 'cover', border: '3px solid #3498db', boxShadow: '0 5px 15px rgba(52, 152, 219, 0.4)' }} />
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem' }}>{charInfo.name}</div>
                  <div style={{ color: '#3498db', fontSize: '1.2rem', fontWeight: 'bold' }}>{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Characters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        filter: hasDoneTest ? 'none' : 'blur(8px) brightness(0.5)',
        transition: 'filter 0.5s ease',
        pointerEvents: hasDoneTest ? 'auto' : 'none'
      }}>
        {Object.values(characters).map(c => (
          <div key={c.key} style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)',
            transition: 'transform 0.3s',
            cursor: hasDoneTest ? 'pointer' : 'default'
          }}
          onClick={() => { if(hasDoneTest) setSelectedChar(c); }}
          onMouseEnter={e => hasDoneTest && (e.currentTarget.style.transform = 'translateY(-10px)')}
          onMouseLeave={e => hasDoneTest && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <img src={c.image} alt={c.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1rem', border: '3px solid #2ecc71' }} />
            <h3 style={{ color: '#2ecc71', marginBottom: '0.5rem' }}>{c.name}</h3>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 'bold' }}>{c.mainSkill}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Overlay Modal if not done */}
      {!hasDoneTest && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20
        }}>
          <div style={{
            background: 'rgba(19, 22, 32, 0.95)',
            padding: '3rem',
            borderRadius: '24px',
            border: '2px solid #2ecc71',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            textAlign: 'center',
            maxWidth: '90%',
            width: '400px'
          }}>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>คุณคือใครกันนะ?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>กรอกชื่อของคุณเพื่อเริ่มการค้นหา</p>
            <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="Enter your English nickname..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0b0d14', color: 'white', fontSize: '1.1rem', textAlign: 'center' }}
              />
              <button type="submit" className="upgrade-btn" style={{ padding: '14px', fontSize: '1.2rem', background: '#2ecc71', color: '#0b0d14', fontWeight: 'bold' }}>
                Start Quiz
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selected Character Modal */}
      {selectedChar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedChar(null)}>
          <div style={{ position: 'relative', background: 'var(--bg-color)', padding: '2rem', borderRadius: '24px', maxWidth: '800px', width: '90%', display: 'flex', gap: '3rem', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
            
            {/* Left side: Character Info */}
            <div style={{ flex: '1 1 300px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <img src={selectedChar.image} style={{ width: '200px', height: '200px', borderRadius: '50%', border: '4px solid #2ecc71', marginBottom: '1.5rem', objectFit: 'cover' }} />
               <h2 style={{ color: '#2ecc71', fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedChar.name}</h2>
               <p style={{ color: 'white', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedChar.mainSkill}</p>
               <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{selectedChar.desc}</p>
            </div>

            {/* Right side: Mock Skills Breakdown */}
            <div style={{ flex: '2 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>พลังพหุปัญญาเฉลี่ยของสายนี้</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {skillsList.map(s => {
                    // Generate mock score based on character trait
                    const score = s.id === selectedChar.key ? 95 : (selectedChar.key === 'hybrid' ? 85 : 40 + Math.floor(Math.random() * 20));
                    return (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ width: '150px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{s.icon}</span> {s.name}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                           <div style={{ width: `${score}%`, background: s.color, height: '100%', borderRadius: '4px' }} />
                        </div>
                        <span style={{ width: '40px', textAlign: 'right', color: s.color, fontWeight: 'bold' }}>{score}%</span>
                      </div>
                    );
                 })}
               </div>
            </div>

            <button onClick={() => setSelectedChar(null)} style={{ position: 'absolute', top: '20px', right: '25px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '2rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
