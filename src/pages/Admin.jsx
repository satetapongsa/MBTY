import { useState, useEffect } from 'react';
import { characters, skillsList } from '../data/characters';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  const chartData = Object.values(
    users.reduce((acc, user) => {
      const key = user.character_key;
      if (!acc[key]) {
        acc[key] = { name: characters[key]?.name || key, value: 0 };
      }
      acc[key].value += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.value - a.value);

  const COLORS = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f1c40f', '#e67e22', '#1abc9c', '#34495e', '#fd79a8', '#00cec9', '#ffeaa7', '#fab1a0', '#a29bfe'];

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM for Thai language support
    const header = ["ชื่อผู้เล่น", "คาแรคเตอร์", "ทักษะเด่น", ...skillsList.map(s => s.name), "เวลาบันทึก"];
    csvContent += header.join(",") + "\n";
    
    users.forEach(u => {
      const row = [
        `"${u.nickname}"`,
        `"${characters[u.character_key]?.name || u.character_key}"`,
        `"${characters[u.character_key]?.mainSkill?.split(' ')[1] || '-'}"`,
        ...skillsList.map(skill => u.answers ? u.answers[skill.id] : '-'),
        `"${new Date(u.created_at).toLocaleString('th-TH')}"`
      ];
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mbti_users_data.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div style={{ boxSizing: 'border-box', width: '100%', padding: '2rem', margin: '0 auto', color: 'white', minHeight: '100vh', backgroundColor: 'var(--bg-color)', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: '#2ecc71', margin: 0 }}>🏛️ ฐานข้อมูลประชากรพหุปัญญา</h1>
        <button onClick={exportCSV} className="upgrade-btn" style={{ background: '#3498db', padding: '10px 20px', fontSize: '1rem' }}>
          📥 Export Data (CSV)
        </button>
      </div>
      
      {loading ? <p>Loading data...</p> : (
        <>
          {/* Analytics Dashboard */}
          {users.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ flex: '1 1 300px', background: '#161925', borderRadius: '16px', padding: '2rem', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>ยอดผู้ทำแบบทดสอบทั้งหมด</h3>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: '#2ecc71' }}>{users.length.toLocaleString()}</div>
                <div style={{ color: 'var(--text-muted)' }}>คน</div>
              </div>
              <div style={{ flex: '2 1 500px', background: '#161925', borderRadius: '16px', padding: '2rem', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minHeight: '350px' }}>
                <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>สัดส่วนคาแรคเตอร์ทั้งหมด</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return percent > 0.05 ? (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1d2d', border: '1px solid #333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div style={{ background: '#161925', borderRadius: '16px', overflowX: 'auto', overflowY: 'hidden', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#1a1d2d', borderBottom: '2px solid #2ecc71', fontSize: '0.9rem' }}>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>ชื่อผู้เล่น</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>คาแรคเตอร์</th>
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>ทักษะเด่น</th>
                {skillsList.map(skill => (
                  <th key={skill.id} style={{ padding: '0.5rem', textAlign: 'center' }}>
                    <div title={skill.name} style={{ fontSize: '1.2rem', cursor: 'help' }}>{skill.icon}</div>
                  </th>
                ))}
                <th style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>เวลาบันทึก</th>
              </tr>
            </thead>
            <tbody>
              {[...users].sort((a, b) => {
                const isAPlayer = a.nickname.startsWith('Player_');
                const isBPlayer = b.nickname.startsWith('Player_');
                if (isAPlayer && !isBPlayer) return 1;
                if (!isAPlayer && isBPlayer) return -1;
                return new Date(b.created_at) - new Date(a.created_at);
              }).map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #333', transition: 'background 0.2s', fontSize: '0.9rem' }} onMouseEnter={(e) => e.currentTarget.style.background = '#1e2235'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap' }}>{u.nickname}</td>
                  <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                    <img src={characters[u.character_key]?.image || '/character.png'} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #2ecc71' }} />
                    <span style={{ color: '#2ecc71', fontWeight: '500' }}>{characters[u.character_key]?.name || u.character_key}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#8b92a5' }}>
                    {characters[u.character_key]?.mainSkill?.split(' ')[1] || '-'}
                  </td>
                  {/* Map through each skill to show answers */}
                  {skillsList.map(skill => {
                    const ans = u.answers ? u.answers[skill.id] : '-';
                    // Determine color based on score
                    let color = '#8b92a5';
                    if (ans >= 80) color = '#2ecc71'; // Green for high
                    else if (ans <= 30) color = '#e74c3c'; // Red for low
                    return (
                      <td key={skill.id} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', color: color }}>
                        {ans !== undefined ? ans : '-'}
                      </td>
                    );
                  })}
                  <td style={{ padding: '0.75rem 1rem', color: '#8b92a5', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
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
        </>
      )}
    </div>
  );
}
