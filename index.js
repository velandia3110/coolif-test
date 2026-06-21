const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Crear tabla al iniciar
pool.query(`
  CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    completada BOOLEAN DEFAULT false,
    creada_en TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log('Tabla lista'));

// Rutas
app.get('/', (req, res) => {
  res.json({ mensaje: '¡Servidor funcionando!', status: 'ok' });
});

app.get('/tareas', async (req, res) => {
  const result = await pool.query('SELECT * FROM tareas ORDER BY creada_en DESC');
  res.json(result.rows);
});

app.post('/tareas', async (req, res) => {
  const { titulo } = req.body;
  const result = await pool.query(
    'INSERT INTO tareas (titulo) VALUES ($1) RETURNING *',
    [titulo]
  );
  res.json(result.rows[0]);
});

app.patch('/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'UPDATE tareas SET completada = NOT completada WHERE id = $1 RETURNING *',
    [id]
  );
  res.json(result.rows[0]);
});

app.delete('/tareas/:id', async (req, res) => {
  await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
  res.json({ mensaje: 'Tarea eliminada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App corriendo en puerto ${PORT}`));
