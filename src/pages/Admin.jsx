import { useState, useEffect } from 'react';
import { characters, skillsList } from '../data/characters';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ boxSizing: 'border-box', width: '100%', padding: '2rem', margin: '0 auto', color: 'white', minHeight: '100vh', backgroundColor: 'var(--bg-color)', overflowX: 'hidden' }}>
      <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>🏛️ ฐานข้อมูลประชากรพหุปัญญา</h1>
      {loading ? <p>Loading data...</p> : (
        <div style={{ background: '#161925', borderRadius: '16px', overflowX: 'auto', overflowY: 'hidden', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1200px' }}>
            <thead>
              <tr style={{ background: '#1a1d2d', borderBottom: '2px solid #2ecc71' }}>
                <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>ชื่อ (Nickname)</th>
                <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>คาแรคเตอร์ประจำตัว</th>
                <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>ทักษะอันดับ 1</th>
                {skillsList.map(skill => (
                  <th key={skill.id} style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span title={skill.name}>{skill.icon} คำตอบ<br/><small style={{color: '#8b92a5', fontSize: '0.7rem'}}>{skill.name.replace('ด้าน','')}</small></span>
                  </th>
                ))}
                <th style={{ padding: '1rem', whiteSpace: 'nowrap' }}>วันที่บันทึก</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #333', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1e2235'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#fff' }}>{u.nickname}</td>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', whiteSpace: 'nowrap' }}>
                    <img src={characters[u.character_key]?.image || '/character.png'} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2ecc71' }} />
                    <span style={{ color: '#2ecc71', fontWeight: '500' }}>{characters[u.character_key]?.name || u.character_key}</span>
                  </td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: '#8b92a5' }}>
                    {characters[u.character_key]?.mainSkill || '-'}
                  </td>
                  {/* Map through each skill to show answers */}
                  {skillsList.map(skill => {
                    const ans = u.answers ? u.answers[skill.id] : '-';
                    // Determine color based on score
                    let color = '#fff';
                    if (ans >= 80) color = '#2ecc71'; // Green for high
                    else if (ans <= 30) color = '#e74c3c'; // Red for low
                    return (
                      <td key={skill.id} style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: color }}>
                        {ans !== undefined ? `${ans}%` : '-'}
                      </td>
                    );
                  })}
                  <td style={{ padding: '1rem', color: '#8b92a5', fontSize: '0.85rem' }}>
                    {new Date(u.created_at).toLocaleString('th-TH')}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4 + skillsList.length} style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
                    ยังไม่มีข้อมูลประชากรในระบบ ลองให้ใครสักคนทำแบบทดสอบดูสิ!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
