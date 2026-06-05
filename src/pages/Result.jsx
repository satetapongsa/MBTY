import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { characters, skillsList } from '../data/characters';
import '../index.css';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(location.state?.user || null);

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('mbti_user');
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {}
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const initialSkills = skillsList.map(s => ({
    ...s,
    score: user ? user.skills[s.id] : (s.id === 'naturalist' ? 95 : 50)
  }));

  const [skills, setSkills] = useState(initialSkills);

  useEffect(() => {
    if (user) {
      setSkills(skillsList.map(s => ({
        ...s,
        score: user.skills[s.id]
      })));
    }
  }, [user]);

  if (!user) return null;

  const character = characters[user.character_key] || characters.naturalist;
  const totalScore = skills.reduce((sum, skill) => sum + skill.score, 0);

  let currentPercentage = 0;
  const conicStops = skills.map(skill => {
    const percentage = (skill.score / totalScore) * 100;
    const stop = `${skill.color} ${currentPercentage}% ${currentPercentage + percentage}%`;
    currentPercentage += percentage;
    return stop;
  }).join(', ');

  const topSkills = [...skills].sort((a, b) => b.score - a.score).slice(0, 3);

  // Helper for generating Card style
  const cardStyle = {
    background: 'var(--card-bg)',
    borderRadius: '16px',
    padding: '2rem',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  };

  const cardRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { 
        backgroundColor: '#0b0d14',
        scale: 2 // High quality
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `MBTY-${user.nickname || 'Result'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    }
  };

  return (
    <>
      {/* Hidden container for 16:9 Full Infographic Export */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={cardRef} style={{ width: '1920px', minHeight: '1080px', height: 'max-content', display: 'flex', gap: '2.5rem', background: '#0b0d14', padding: '3.5rem', boxSizing: 'border-box', position: 'relative' }}>
          
          {/* Col 1: Character Identity */}
          <div style={{ ...cardStyle, width: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem' }}>
            <h2 style={{ color: 'white', fontSize: '1.2rem', letterSpacing: '2px', background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '20px' }}>MBTY RESULT</h2>
            <img src={character.image} alt={character.name} style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '20px', border: '3px solid #2ecc71', boxShadow: '0 10px 30px rgba(46, 204, 113, 0.3)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>คุณคือ</div>
              <h2 style={{ color: '#2ecc71', fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{character.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{character.desc}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
              {topSkills.map((skill, index) => (
                <div key={`exp-${skill.id}`} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', flex: 1, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{skill.icon}</div>
                  <div style={{ fontSize: '0.9rem', color: skill.color, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.name.replace('ด้าน','')}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: skill.color }}>{skill.score}%</div>
                </div>
              ))}
            </div>

            <div className="donut-chart" style={{ background: `conic-gradient(${conicStops})`, width: '280px', height: '280px', margin: '1rem auto 0' }}>
              <div className="donut-inner" style={{ width: '150px', height: '150px' }}>
                <div className="donut-inner-text" style={{ fontSize: '1rem' }}>พหุปัญญา</div>
                <div className="donut-inner-sub" style={{ fontSize: '1.5rem' }}>8 ด้าน</div>
              </div>
              {skills.map((skill) => {
                 const startPercent = skills.slice(0, skills.indexOf(skill)).reduce((sum, s) => sum + (s.score / totalScore) * 100, 0);
                 const percent = (skill.score / totalScore) * 100;
                 const middlePercent = startPercent + (percent / 2);
                 const angle = (middlePercent / 100) * 360;
                 const radius = 105;
                 const radians = (angle - 90) * (Math.PI / 180);
                 const x = Math.cos(radians) * radius;
                 const y = Math.sin(radians) * radius;
                 return (
                   <div key={`label-exp-${skill.id}`} style={{ position: 'absolute', transform: `translate(${x}px, ${y}px)`, color: 'white', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                     <span style={{ fontSize: '1.2rem' }}>{skill.icon}</span>
                     <span style={{ fontWeight: 'bold' }}>{Math.round(percent)}%</span>
                   </div>
                 )
              })}
            </div>
          </div>

          {/* Col 2: Deep Dive, Strengths & Careers */}
          <div style={{ width: '630px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 8 Skills Bars */}
            <div style={{ ...cardStyle, flexShrink: 0, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', letterSpacing: '2px', fontSize: '1.2rem' }}>สัดส่วนทักษะทั้ง 8 ด้าน</h3>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {skills.map(skill => (
                  <div key={`bar-exp-${skill.id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '180px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{skill.icon}</span> {skill.name}
                    </span>
                    <div style={{ flex: 1, height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '7px', overflow: 'hidden' }}>
                      <div style={{ width: `${skill.score}%`, backgroundColor: skill.color, height: '100%', borderRadius: '7px' }} />
                    </div>
                    <span style={{ width: '45px', textAlign: 'right', color: skill.color, fontWeight: 'bold', fontSize: '1.1rem' }}>{skill.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #16192b, #121420)', flexShrink: 0, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                <span>🧩</span> บุคลิกภาพของคุณ
              </h3>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1.1rem', margin: 0 }}>{character.personality}</p>
            </div>

            {/* Strengths */}
            <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #0d211c, #0b1814)', border: '1px solid rgba(46, 204, 113, 0.2)', flexShrink: 0, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                <span>💪</span> จุดแข็งของคุณ
              </h3>
              <ul style={{ color: 'var(--text-main)', lineHeight: '1.6', paddingLeft: '1.5rem', fontSize: '1.05rem', margin: 0 }}>
                {(character.strengths).map((str, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Careers */}
            <div style={{ ...cardStyle, flex: 1, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: '#3498db', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                <span>💼</span> อาชีพที่เหมาะ
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {(character.careers).map((career, i) => (
                  <span key={i} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '0.6rem 1.2rem', borderRadius: '20px', fontSize: '1.05rem', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
                    {career}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Growth & Frameworks */}
          <div style={{ width: '630px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Learning Styles */}
            <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #1a1625, #13111a)', flexShrink: 0, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                <span>📚</span> คำแนะนำการเรียนรู้
              </h3>
              <ul style={{ color: 'var(--text-main)', lineHeight: '1.6', paddingLeft: '1.5rem', fontSize: '1.05rem', margin: 0 }}>
                {(character.learning_style).map((item, i) => (
                  <li key={i} style={{ color: '#d2b4de', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-main)' }}>{item}</span></li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #2a1616, #1c0f0f)', border: '1px solid rgba(231, 76, 60, 0.2)', flexShrink: 0, padding: '1.5rem 2.5rem' }}>
              <h3 style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.3rem' }}>
                <span>🌱</span> ด้านที่ควรพัฒนา
              </h3>
              <ol style={{ color: 'var(--text-main)', lineHeight: '1.6', paddingLeft: '1.5rem', fontSize: '1.05rem', margin: 0 }}>
                {(character.improvements).map((item, i) => (
                  <li key={i} style={{ color: '#f5b7b1', fontWeight: 'bold', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-main)', fontWeight: 'normal' }}>{item}</span></li>
                ))}
              </ol>
            </div>

            {/* MBTI & Enneagram */}
            <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
              <div style={{ ...cardStyle, flex: 1, padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '1.5rem', textTransform: 'uppercase' }}>16Personalities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {[
                    { left: 'E', right: 'I', leftScore: Math.min(100, Math.max(0, skills[5].score + 10)) },
                    { left: 'S', right: 'N', leftScore: Math.min(100, Math.max(0, skills[1].score + 5)) },
                    { left: 'T', right: 'F', leftScore: Math.min(100, Math.max(0, skills[7].score + 15)) },
                    { left: 'J', right: 'P', leftScore: Math.min(100, Math.max(0, skills[0].score + 5)) },
                  ].map((dim, i) => {
                    const isLeftDom = dim.leftScore >= 50;
                    const domScore = isLeftDom ? dim.leftScore : 100 - dim.leftScore;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span style={{ width: '20px', fontWeight: 'bold', color: isLeftDom ? '#8c52ff' : '#555', textAlign: 'center', fontSize: '1.1rem' }}>{dim.left}</span>
                        <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                          {isLeftDom ? (
                            <>
                              <div style={{ width: `${dim.leftScore}%`, background: '#8c52ff', height: '100%' }} />
                              <div style={{ flex: 1, background: '#222' }} />
                            </>
                          ) : (
                            <>
                              <div style={{ width: `${dim.leftScore}%`, background: '#222', height: '100%' }} />
                              <div style={{ flex: 1, background: '#8c52ff' }} />
                            </>
                          )}
                        </div>
                        <span style={{ width: '20px', fontWeight: 'bold', color: !isLeftDom ? '#8c52ff' : '#555', textAlign: 'center', fontSize: '1.1rem' }}>{dim.right}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...cardStyle, flex: 1.5, padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '1px', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Enneagram</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {[
                    { id: 1, name: 'ผู้ชอบความสมบูรณ์แบบ', score: Math.min(100, Math.floor((skills[7].score + skills[0].score) / 2)) },
                    { id: 2, name: 'ผู้ให้', score: Math.min(100, Math.floor((skills[5].score + skills[2].score) / 2)) },
                    { id: 3, name: 'ผู้ไขว่คว้า', score: Math.min(100, Math.max(0, skills[1].score + 10)) },
                    { id: 4, name: 'ศิลปิน', score: Math.min(100, Math.floor((skills[3].score + skills[6].score) / 2)) },
                    { id: 5, name: 'นักสำรวจ', score: Math.min(100, Math.max(0, skills[0].score + 5)) },
                    { id: 6, name: 'ผู้จงรักภักดี', score: Math.min(100, Math.floor((skills[5].score + skills[7].score) / 2)) },
                    { id: 7, name: 'นักผจญภัย', score: Math.min(100, Math.max(0, skills[1].score + 15)) },
                    { id: 8, name: 'ผู้นำ', score: Math.min(100, Math.max(0, skills[5].score + 20)) },
                    { id: 9, name: 'ผู้รักสันติ', score: Math.min(100, Math.floor((skills[2].score + skills[0].score) / 2)) },
                  ].map(enn => (
                    <div key={enn.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#1a1d2d', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #333', flexShrink: 0 }}>
                        {enn.id}
                      </div>
                      <span style={{ width: '130px', color: '#8b92a5', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{enn.name}</span>
                      <div style={{ flex: 1, height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${enn.score}%`, background: '#4a4d5e', height: '100%', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
          </div>

        </div>
      </div>

    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Action Bar (Buttons) */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/')} className="upgrade-btn" style={{ padding: '12px 28px', fontSize: '1.1rem', background: '#3498db', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)', borderRadius: '50px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          กลับหน้าหลัก
        </button>
        <button onClick={handleDownloadImage} className="upgrade-btn" style={{ padding: '12px 28px', fontSize: '1.1rem', background: '#2ecc71', color: '#111', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 5px 15px rgba(46, 204, 113, 0.3)', borderRadius: '50px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          โหลดรูป
        </button>
      </div>

      {/* Top Section: Character & Details */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Left: Character Card */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 350px' }}>
          <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.2rem', letterSpacing: '2px', background: 'rgba(255,255,255,0.1)', padding: '5px 15px', borderRadius: '20px' }}>MBTY RESULT</h2>
            <img src={character.image} alt={character.name} style={{ width: '250px', height: '250px', objectFit: 'cover', borderRadius: '16px', marginBottom: '1.5rem', border: '2px solid #2ecc71' }} />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>คุณคือ</div>
            <h2 style={{ color: '#2ecc71', fontSize: '2rem', marginBottom: '1rem' }}>{character.name}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{character.desc}</p>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
              {topSkills.map((skill, index) => (
                <div key={skill.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{skill.icon}</div>
                  <div style={{ fontSize: '0.8rem', color: skill.color, marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.name.replace('ด้าน','')}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: skill.color }}>{skill.score}%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>อันดับ {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Personality, Strengths, Careers */}
        <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Personality */}
          <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #16192b, #121420)' }}>
            <h3 style={{ color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span>🧩</span> บุคลิกภาพของคุณ
            </h3>
            <p style={{ color: 'var(--text-main)', lineHeight: '1.6' }}>{character.personality || 'บุคลิกภาพที่โดดเด่นและเต็มไปด้วยศักยภาพที่รอการค้นพบ'}</p>
          </div>

          {/* Strengths */}
          <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #0d211c, #0b1814)', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
            <h3 style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span>💪</span> จุดแข็งของคุณ
            </h3>
            <ul style={{ color: 'var(--text-main)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              {(character.strengths || ['มีความสามารถในการเรียนรู้สิ่งใหม่ๆ ได้อย่างรวดเร็ว']).map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Careers */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ color: '#3498db', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span>💼</span> อาชีพที่เหมาะ
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {(character.careers || ['ผู้เชี่ยวชาญแบบบูรณาการ']).map((career, i) => (
                <span key={i} style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(52, 152, 219, 0.3)' }}>
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Donut & Skills */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--text-muted)', marginBottom: '3rem', letterSpacing: '2px' }}>สัดส่วนพหุปัญญา 8 ด้าน</h3>
        
        <div className="donut-chart" style={{ background: `conic-gradient(${conicStops})`, width: '300px', height: '300px', marginBottom: '3rem' }}>
          <div className="donut-inner" style={{ width: '160px', height: '160px' }}>
            <div className="donut-inner-text">พหุปัญญา</div>
            <div className="donut-inner-sub">8 ด้าน</div>
          </div>
          {skills.map((skill) => {
             const startPercent = skills.slice(0, skills.indexOf(skill)).reduce((sum, s) => sum + (s.score / totalScore) * 100, 0);
             const percent = (skill.score / totalScore) * 100;
             const middlePercent = startPercent + (percent / 2);
             const angle = (middlePercent / 100) * 360;
             const radius = 110;
             const radians = (angle - 90) * (Math.PI / 180);
             const x = Math.cos(radians) * radius;
             const y = Math.sin(radians) * radius;
             return (
               <div key={`label-${skill.id}`} style={{
                 position: 'absolute', transform: `translate(${x}px, ${y}px)`, color: 'white', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: '0 1px 3px rgba(0,0,0,0.8)'
               }}>
                 <span>{skill.icon}</span>
                 <span style={{ fontWeight: 'bold' }}>{Math.round(percent)}%</span>
               </div>
             )
          })}
        </div>

        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {skills.map(skill => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ width: '180px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{skill.icon}</span> {skill.name}
              </span>
              <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${skill.score}%`, backgroundColor: skill.color, height: '100%', borderRadius: '6px' }} />
              </div>
              <span style={{ width: '40px', textAlign: 'right', color: skill.color, fontWeight: 'bold' }}>{skill.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Learning, Improvements, Extra Charts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Learning Styles */}
        <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #1a1625, #13111a)' }}>
          <h3 style={{ color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>📚</span> คำแนะนำการเรียนรู้
          </h3>
          <ul style={{ color: 'var(--text-main)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            {(character.learning_style || ['ใช้วิธีการเรียนรู้ที่หลากหลายเพื่อตอบสนองต่อทักษะทุกด้าน']).map((item, i) => (
              <li key={i} style={{ color: '#d2b4de' }}><span style={{ color: 'var(--text-main)' }}>{item}</span></li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div style={{ ...cardStyle, background: 'linear-gradient(145deg, #2a1616, #1c0f0f)', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
          <h3 style={{ color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span>🌱</span> ด้านที่ควรพัฒนา
          </h3>
          <ol style={{ color: 'var(--text-main)', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            {(character.improvements || ['เปิดกว้างในการเรียนรู้ทักษะใหม่ๆ ที่อยู่นอกเหนือความถนัดเดิม']).map((item, i) => (
              <li key={i} style={{ color: '#f5b7b1', fontWeight: 'bold' }}><span style={{ color: 'var(--text-main)', fontWeight: 'normal' }}>{item}</span></li>
            ))}
          </ol>
        </div>

        {/* MBTI & Enneagram */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ ...cardStyle, flex: '1 1 300px' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '1px', marginBottom: '2rem', textTransform: 'uppercase' }}>
              16Personalities Dimensions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { left: 'E', right: 'I', leftScore: Math.min(100, Math.max(0, skills[5].score + 10)) },
                { left: 'S', right: 'N', leftScore: Math.min(100, Math.max(0, skills[1].score + 5)) },
                { left: 'T', right: 'F', leftScore: Math.min(100, Math.max(0, skills[7].score + 15)) },
                { left: 'J', right: 'P', leftScore: Math.min(100, Math.max(0, skills[0].score + 5)) },
              ].map((dim, i) => {
                const isLeftDom = dim.leftScore >= 50;
                const domScore = isLeftDom ? dim.leftScore : 100 - dim.leftScore;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '20px', fontWeight: 'bold', color: isLeftDom ? '#8c52ff' : '#555', textAlign: 'center', fontSize: '1.1rem' }}>{dim.left}</span>
                    <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                      {isLeftDom ? (
                        <>
                          <div style={{ width: `${dim.leftScore}%`, background: '#8c52ff', height: '100%' }} />
                          <div style={{ flex: 1, background: '#222' }} />
                        </>
                      ) : (
                        <>
                          <div style={{ width: `${dim.leftScore}%`, background: '#222', height: '100%' }} />
                          <div style={{ flex: 1, background: '#8c52ff' }} />
                        </>
                      )}
                    </div>
                    <span style={{ width: '20px', fontWeight: 'bold', color: !isLeftDom ? '#8c52ff' : '#555', textAlign: 'center', fontSize: '1.1rem' }}>{dim.right}</span>
                    <span style={{ width: '40px', textAlign: 'right', color: '#8b92a5', fontSize: '0.9rem' }}>{domScore}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...cardStyle, flex: '1 1 400px' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', letterSpacing: '1px', marginBottom: '2rem', textTransform: 'uppercase' }}>
              Enneagram Scores
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { id: 1, name: 'ผู้ชอบความสมบูรณ์แบบ', score: Math.min(100, Math.floor((skills[7].score + skills[0].score) / 2)) },
                { id: 2, name: 'ผู้ให้', score: Math.min(100, Math.floor((skills[5].score + skills[2].score) / 2)) },
                { id: 3, name: 'ผู้ไขว่คว้า', score: Math.min(100, Math.max(0, skills[1].score + 10)) },
                { id: 4, name: 'ศิลปิน', score: Math.min(100, Math.floor((skills[3].score + skills[6].score) / 2)) },
                { id: 5, name: 'นักสำรวจ', score: Math.min(100, Math.max(0, skills[0].score + 5)) },
                { id: 6, name: 'ผู้จงรักภักดี', score: Math.min(100, Math.floor((skills[5].score + skills[7].score) / 2)) },
                { id: 7, name: 'นักผจญภัย', score: Math.min(100, Math.max(0, skills[1].score + 15)) },
                { id: 8, name: 'ผู้นำ', score: Math.min(100, Math.max(0, skills[5].score + 20)) },
                { id: 9, name: 'ผู้รักสันติ', score: Math.min(100, Math.floor((skills[2].score + skills[0].score) / 2)) },
              ].map(enn => (
                <div key={enn.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1d2d', color: '#8b92a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #333', flexShrink: 0 }}>
                    {enn.id}
                  </div>
                  <span style={{ width: '160px', color: '#8b92a5', fontSize: '0.9rem' }}>{enn.name}</span>
                  <div style={{ flex: 1, height: '8px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${enn.score}%`, background: '#4a4d5e', height: '100%', borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '40px', textAlign: 'right', color: '#8b92a5', fontSize: '0.9rem' }}>{enn.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
