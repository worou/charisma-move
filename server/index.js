const express = require('express');
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charisma_move',
});

async function getItems() {
  const [rows] = await pool.query('SELECT id, name FROM items');
  return rows;
}

async function addItem(name) {
  const [result] = await pool.query('INSERT INTO items (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
}

app.get('/api/items', async (req, res) => {
  try {
    const rows = await getItems();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const item = await addItem(req.body.name);
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CharismaMove API',
      version: '1.0.0',
    },
  },
  apis: ['./index.js'],
};
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: List all items
 *     responses:
 *       200:
 *         description: Array of items
 *   post:
 *     summary: Create an item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created
 */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
