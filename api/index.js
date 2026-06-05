import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

// Fallback in-memory DB if no DATABASE_URL is provided
let mockDb = [];

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('Connected to Neon Database.');
} else {
  console.log('WARNING: DATABASE_URL not found. Using in-memory mock database.');
}

// Ensure table exists if using real DB
const initDb = async () => {
  if (!pool) return;
  const query = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(50) NOT NULL,
        character_key VARCHAR(50) NOT NULL,
        answers JSONB NOT NULL,
        skills JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('Database table verified/created.');
  } catch (err) {
    console.error('Error creating table:', err);
  }
};
initDb();

app.post('/api/users', async (req, res) => {
  const { nickname, character_key, answers, skills } = req.body;
  if (pool) {
    try {
      const result = await pool.query(
        'INSERT INTO users (nickname, character_key, answers, skills) VALUES ($1, $2, $3, $4) RETURNING *',
        [nickname, character_key, JSON.stringify(answers), JSON.stringify(skills)]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    // Mock DB
    const newUser = {
      id: mockDb.length + 1,
      nickname,
      character_key,
      answers,
      skills,
      created_at: new Date().toISOString()
    };
    mockDb.push(newUser);
    res.json(newUser);
  }
});

app.get('/api/users', async (req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.json(mockDb.slice().reverse());
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
}

export default app;
