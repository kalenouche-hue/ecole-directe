const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const HTML_FILE = path.join(__dirname, 'index.html');
let SHARED = null;
function readBody(req, cb) {
  let body = '';
const express = require('express');
  const { Pool } = require('pg');
  const cors = require('cors');
  require('dotenv').config();
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // PostgreSQL connection
  const pool = new Pool({
      connectionString: process.env.DATABASE_URL
  });
  
  // ============ INIT DB ============
  async function initDB() {
      try {
            await pool.query(`
                  CREATE TABLE IF NOT EXISTS students (
                          id SERIAL PRIMARY KEY,
                                  name VARCHAR(255) NOT NULL,
                                          class VARCHAR(50),
                                                  email VARCHAR(255),
                                                          created_at TIMESTAMP DEFAULT NOW()
                                                                )
                                                                    `);
        
            await pool.query(`
                  CREATE TABLE IF NOT EXISTS grades (
                          id SERIAL PRIMARY KEY,
                                  student_id INT REFERENCES students(id),
                                          subject VARCHAR(100),
                                                  grade FLOAT,
                                                          date TIMESTAMP DEFAULT NOW()
                                                                )
                                                                    `);
        
            await pool.query(`
                  CREATE TABLE IF NOT EXISTS absences (
                          id SERIAL PRIMARY KEY,
                                  student_id INT REFERENCES students(id),
                                          date_absence DATE,
                                                  reason VARCHAR(255),
                                                          created_at TIMESTAMP DEFAULT NOW()
                                                                )
                                                                    `);
        
            console.log('Database initialized');
      } catch (err) {
            console.error('DB init error:', err);
      }
  }
  
  initDB();
  
  // ============ STUDENTS ============
  app.get('/api/students', async (req, res) => {
      try {
            const result = await pool.query('SELECT * FROM students ORDER BY name');
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  app.post('/api/students', async (req, res) => {
      const { name, class: cls, email } = req.body;
      try {
            const result = await pool.query(
                    'INSERT INTO students (name, class, email) VALUES ($1, $2, $3) RETURNING *',
                    [name, cls, email]
                  );
            res.json(result.rows[0]);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  // ============ GRADES ============
  app.get('/api/grades', async (req, res) => {
      try {
            const result = await pool.query(`
                  SELECT g.*, s.name as student_name
                        FROM grades g
                              LEFT JOIN students s ON g.student_id = s.id
                                    ORDER BY g.date DESC
                                        `);
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  app.get('/api/grades/:studentId', async (req, res) => {
      const { studentId } = req.params;
      try {
            const result = await pool.query(
                    'SELECT * FROM grades WHERE student_id = $1 ORDER BY date DESC',
                    [studentId]
                  );
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  app.post('/api/grades', async (req, res) => {
      const { student_id, subject, grade } = req.body;
      try {
            const result = await pool.query(
                    'INSERT INTO grades (student_id, subject, grade) VALUES ($1, $2, $3) RETURNING *',
                    [student_id, subject, grade]
                  );
            res.json(result.rows[0]);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  // ============ ABSENCES ============
  app.get('/api/absences', async (req, res) => {
      try {
            const result = await pool.query(`
                  SELECT a.*, s.name as student_name
                        FROM absences a
                              LEFT JOIN students s ON a.student_id = s.id
                                    ORDER BY a.date_absence DESC
                                        `);
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  app.get('/api/absences/:studentId', async (req, res) => {
      const { studentId } = req.params;
      try {
            const result = await pool.query(
                    'SELECT * FROM absences WHERE student_id = $1 ORDER BY date_absence DESC',
                    [studentId]
                  );
            res.json(result.rows);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  app.post('/api/absences', async (req, res) => {
      const { student_id, date_absence, reason } = req.body;
      try {
            const result = await pool.query(
                    'INSERT INTO absences (student_id, date_absence, reason) VALUES ($1, $2, $3) RETURNING *',
                    [student_id, date_absence, reason]
                  );
            res.json(result.rows[0]);
      } catch (err) {
            res.status(500).json({ error: err.message });
      }
  });
  
  // ============ START SERVER ============
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`School API running on port ${PORT}`);
  });req.on('data', chunk => body += chunk);
  req.on('end', () => { try { cb(JSON.parse(body)); } catch(e) { cb(null); } });
}
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  if (pathname === '/' && req.method === 'GET') {
    fs.readFile(HTML_FILE, (err, data) => {
      if (err) { res.writeHead(500); res.end('Erreur'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }
  if (pathname === '/api/data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(SHARED));
    return;
  }
  if (pathname === '/api/data' && req.method === 'POST') {
    readBody(req, data => {
      if (data) SHARED = data;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
    return;
  }
  res.writeHead(404); res.end('Not found');
});
server.listen(PORT, () => console.log('Port ' + PORT));
