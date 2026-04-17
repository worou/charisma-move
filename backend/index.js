const express = require('express');
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware de validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequired = (data, fields) => {
  const errors = [];
  fields.forEach(field => {
    if (!data[field] || data[field].toString().trim() === '') {
      errors.push(`${field} est requis`);
    }
  });
  return errors;
};

// Middleware de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
};

// Middleware de logging
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

app.use(requestLogger);

async function sendEmail(to, subject, text) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.FROM_EMAIL;
  if (!apiKey || !from) return;
  
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: 'text/plain', value: text }],
      }),
    });
  } catch (error) {
    console.error('Erreur envoi email:', error);
  }
}

async function sendSMS(phone, message) {
  const key = process.env.TEXTBELT_KEY || 'textbelt';
  try {
    await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message, key }),
    });
  } catch (error) {
    console.error('Erreur envoi SMS:', error);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'charisma_move',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Test de connexion à la base de données
pool.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données établie');
    connection.release();
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
  });

async function init() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      gender VARCHAR(10),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      departure VARCHAR(255),
      arrival VARCHAR(255),
      travel_date DATE,
      travel_time TIME,
      seats INT,
      price DECIMAL(10,2),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    
    await pool.query(`CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      departure VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      departure_lat DECIMAL(10,7) NULL,
      departure_lng DECIMAL(10,7) NULL,
      datetime DATETIME NOT NULL,
      seats INT NOT NULL,
      price DECIMAL(10,2),
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Migration : ajout des colonnes géographiques si absentes (pour bases existantes)
    const annGeoColumns = [
      { name: 'departure_lat', type: 'DECIMAL(10,7) NULL' },
      { name: 'departure_lng', type: 'DECIMAL(10,7) NULL' },
    ];
    for (const column of annGeoColumns) {
      const [col] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'announcements'
           AND COLUMN_NAME = ?`,
        [column.name]
      );
      if (col.length === 0) {
        await pool.query(`ALTER TABLE announcements ADD COLUMN ${column.name} ${column.type}`);
      }
    }

    // Vérifier et ajouter les colonnes manquantes
    const columns = [
      { name: 'is_admin', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'first_name', type: 'VARCHAR(255)' },
      { name: 'gender', type: 'VARCHAR(10)' },
      { name: 'created_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
    ];

    for (const column of columns) {
      const [col] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'users'
           AND COLUMN_NAME = ?`,
        [column.name]
      );
      if (col.length === 0) {
        await pool.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`);
      }
    }

    // Créer un admin par défaut si aucun n'existe
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_admin = TRUE');
    if (rows[0].count === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const adminName = process.env.ADMIN_NAME || 'Admin';
      const adminPhone = process.env.ADMIN_PHONE || null;
      const hash = await bcrypt.hash(adminPassword, 12);
      await pool.query(
        'INSERT INTO users (name, first_name, gender, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [adminName, null, null, adminEmail, hash, adminPhone]
      );
      console.log(`Admin par défaut créé avec l'email ${adminEmail}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

init();

async function getItems() {
  const [rows] = await pool.query('SELECT id, name FROM items');
  return rows;
}

async function searchItems(query) {
  const [rows] = await pool.query(
    'SELECT id, name FROM items WHERE name LIKE ? COLLATE utf8mb4_general_ci',
    [`%${query}%`]
  );
  return rows;
}

async function addItem(name) {
  const [result] = await pool.query('INSERT INTO items (name) VALUES (?)', [name]);
  return { id: result.insertId, name };
}

async function createUser(name, email, password, phone, firstName = null, gender = null, isAdmin = false) {
  const [result] = await pool.query(
    'INSERT INTO users (name, first_name, gender, email, password, phone, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, firstName, gender, email, password, phone, isAdmin]
  );
  return { id: result.insertId, name, first_name: firstName, gender, email, phone, is_admin: isAdmin };
}

async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function getUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, first_name, gender, email, phone, is_admin FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function updateUser(id, fields) {
  const allowed = ['name', 'first_name', 'gender', 'phone'];
  const setParts = [];
  const values = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setParts.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (setParts.length === 0) {
    return getUserById(id);
  }
  values.push(id);
  await pool.query(`UPDATE users SET ${setParts.join(', ')} WHERE id = ?`, values);
  return getUserById(id);
}

async function getAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, is_admin FROM users ORDER BY id ASC'
  );
  return rows;
}

async function removeUser(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

async function createBooking(userId, booking) {
  const [result] = await pool.query(
    `INSERT INTO bookings (user_id, departure, arrival, travel_date, travel_time, seats, price, status)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
    [
      userId,
      booking.departure,
      booking.arrival,
      booking.travel_date,
      booking.travel_time,
      booking.seats,
    ]
  );
  return { id: result.insertId, ...booking, price: 0, status: 'pending' };
}

async function getBookingsByUser(userId) {
  const [rows] = await pool.query(
    'SELECT id, departure, arrival, travel_date, travel_time, seats, price, status, created_at FROM bookings WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function confirmBooking(id) {
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', id]);
  const [rows] = await pool.query(
    `SELECT b.*, u.email, u.phone FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.id = ?`,
    [id]
  );
  return rows[0];
}

async function createAnnouncement(userId, data) {
  const [result] = await pool.query(
    `INSERT INTO announcements (user_id, departure, destination, departure_lat, departure_lng, datetime, seats, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.departure,
      data.destination,
      data.departure_lat ?? null,
      data.departure_lng ?? null,
      data.datetime,
      data.seats,
      data.description ?? null,
    ]
  );
  return { id: result.insertId, ...data };
}

// Géocodage côté serveur via l'API Adresse Gouv française (gratuit, sans clé)
async function geocodeAddress(address) {
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feat = data?.features?.[0];
    if (!feat) return null;
    const [lng, lat] = feat.geometry.coordinates;
    return { lat, lng, label: feat.properties.label };
  } catch (err) {
    console.error('Géocodage échoué:', err);
    return null;
  }
}

// Recherche de trajets proches d'un point (formule de Haversine)
async function getNearbyAnnouncements({ lat, lng, radiusKm = 20, fromDate = null }) {
  const params = [lat, lng, lat];
  let query = `
    SELECT a.*, u.name AS driver_name, u.first_name AS driver_first_name,
           u.email AS driver_email, u.phone AS driver_phone,
           (6371 * ACOS(
              LEAST(1, COS(RADIANS(?)) * COS(RADIANS(a.departure_lat))
              * COS(RADIANS(a.departure_lng) - RADIANS(?))
              + SIN(RADIANS(?)) * SIN(RADIANS(a.departure_lat)))
           )) AS distance_km
    FROM announcements a
    JOIN users u ON u.id = a.user_id
    WHERE a.departure_lat IS NOT NULL AND a.departure_lng IS NOT NULL
      AND a.seats > 0`;
  if (fromDate) {
    query += ' AND a.datetime >= ?';
    params.push(fromDate);
  }
  query += ' HAVING distance_km <= ? ORDER BY distance_km ASC LIMIT 50';
  params.push(radiusKm);
  const [rows] = await pool.query(query, params);
  return rows;
}

async function getAnnouncements(filters = {}) {
  let query = 'SELECT * FROM announcements WHERE 1=1';
  const params = [];
  if (filters.departure) {
    query += ' AND LOWER(departure) LIKE ?';
    params.push('%' + filters.departure.toLowerCase() + '%');
  }
  if (filters.destination) {
    query += ' AND LOWER(destination) LIKE ?';
    params.push('%' + filters.destination.toLowerCase() + '%');
  }
  if (filters.seats) {
    query += ' AND seats >= ?';
    params.push(filters.seats);
  }
  query += ' ORDER BY datetime ASC';
  const [rows] = await pool.query(query, params);
  return rows;
}

app.get('/api/items', async (req, res) => {
  try {
    const { q } = req.query;
    const rows = q ? await searchItems(q) : await getItems();
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

app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const booking = await createBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await getBookingsByUser(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/bookings/:id/confirm', authenticateToken, async (req, res) => {
  try {
    const booking = await confirmBooking(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    if (booking.email) {
      await sendEmail(
        booking.email,
        'Confirmation de réservation',
        `Votre réservation du ${booking.travel_date} est confirmée.`
      );
    }
    if (booking.phone) {
      await sendSMS(
        booking.phone,
        `Réservation confirmée pour le ${booking.travel_date}`
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/announcements', authenticateToken, async (req, res) => {
  const { departure, destination, datetime, seats, departure_lat, departure_lng, description } =
    req.body;
  if (!departure || !destination || !datetime || !seats) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (new Date(datetime).getTime() < Date.now() - 60 * 1000) {
    return res.status(400).json({ error: 'La date/heure est dans le passé' });
  }
  try {
    // Si le client ne fournit pas les coordonnées, on géocode automatiquement
    let lat = departure_lat;
    let lng = departure_lng;
    if (lat == null || lng == null) {
      const geo = await geocodeAddress(departure);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      }
    }
    const ann = await createAnnouncement(req.user.id, {
      departure,
      destination,
      datetime,
      seats,
      departure_lat: lat,
      departure_lng: lng,
      description: description || null,
    });
    res.status(201).json(ann);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Recherche de covoitureurs proches d'une position géographique
app.get('/api/announcements/nearby', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = req.query.radius ? parseFloat(req.query.radius) : 20;
  const fromDate = req.query.from || null;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'lat/lng requis et numériques' });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Coordonnées hors bornes' });
  }
  if (radius <= 0 || radius > 500) {
    return res.status(400).json({ error: 'Rayon invalide (1-500 km)' });
  }

  try {
    const rows = await getNearbyAnnouncements({ lat, lng, radiusKm: radius, fromDate });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Itinéraire transports en commun vers l'église via Navitia (si NAVITIA_TOKEN configuré)
// Fallback silencieux : si pas de token, renvoie { available: false } et le client utilisera les deep-links.
app.get('/api/transit/journeys', async (req, res) => {
  const fromLat = parseFloat(req.query.from_lat);
  const fromLng = parseFloat(req.query.from_lng);
  const toLat = parseFloat(req.query.to_lat);
  const toLng = parseFloat(req.query.to_lng);
  const datetime = req.query.datetime; // format YYYYMMDDTHHMMSS (optionnel)

  if ([fromLat, fromLng, toLat, toLng].some(Number.isNaN)) {
    return res.status(400).json({ error: 'Coordonnées invalides' });
  }

  const token = process.env.NAVITIA_TOKEN;
  if (!token) {
    return res.json({ available: false, reason: 'NAVITIA_TOKEN non configuré' });
  }

  try {
    const params = new URLSearchParams({
      from: `${fromLng};${fromLat}`,
      to: `${toLng};${toLat}`,
      max_nb_journeys: '3',
    });
    if (datetime) params.set('datetime', datetime);

    const url = `https://api.navitia.io/v1/coverage/fr-idf/journeys?${params.toString()}`;
    const r = await fetch(url, { headers: { Authorization: token } });
    if (!r.ok) {
      const msg = await r.text();
      console.error('Navitia error:', r.status, msg);
      return res.status(502).json({ available: false, reason: 'Navitia indisponible' });
    }
    const data = await r.json();
    // On ne renvoie que ce qui est utile au client pour alléger la payload
    const journeys = (data.journeys || []).map((j) => ({
      duration: j.duration, // secondes
      departure_date_time: j.departure_date_time,
      arrival_date_time: j.arrival_date_time,
      nb_transfers: j.nb_transfers,
      sections: (j.sections || [])
        .filter((s) => s.type !== 'waiting')
        .map((s) => ({
          type: s.type,
          mode: s.mode || (s.display_informations && s.display_informations.commercial_mode),
          line: s.display_informations && s.display_informations.label,
          direction: s.display_informations && s.display_informations.direction,
          from: s.from && s.from.name,
          to: s.to && s.to.name,
          duration: s.duration,
        })),
    }));
    res.json({ available: true, journeys });
  } catch (err) {
    console.error('Transit journeys error:', err);
    res.status(502).json({ available: false, reason: 'Erreur serveur transit' });
  }
});

// Proxy de géocodage vers l'API Adresse Gouv (évite les soucis CORS côté client)
app.get('/api/geocode', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 3) return res.json({ features: [] });
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(502).json({ error: 'Service de géocodage indisponible' });
  }
});

app.get('/api/announcements', async (req, res) => {
  try {
    const anns = await getAnnouncements({
      departure: req.query.departure,
      destination: req.query.destination,
      seats: req.query.seats ? parseInt(req.query.seats, 10) : undefined,
    });
    res.json(anns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err || !user.is_admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

app.post('/api/users/register', async (req, res) => {
  const { name, first_name, gender, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hash, phone, first_name, gender);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '1h',
      }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        first_name: user.first_name,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user || !user.is_admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, is_admin: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    res.json({
      token,
      admin: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    await removeUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (parseInt(req.params.id, 10) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const updated = await updateUser(req.user.id, req.body);
    res.json(updated);
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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
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
 *     summary: List items
 *     parameters:
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter items by name
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

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departure:
 *                 type: string
 *               arrival:
 *                 type: string
 *               travel_date:
 *                 type: string
 *               travel_time:
 *                 type: string
 *               seats:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Booking created
 *   get:
 *     summary: List user bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of bookings
 * /api/bookings/{id}/confirm:
 *   post:
 *     summary: Confirm a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking confirmed
 */

/**
 * @swagger
 * /api/announcements:
 *   post:
 *     summary: Publish a new trip announcement
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departure:
 *                 type: string
 *               destination:
 *                 type: string
 *               datetime:
 *                 type: string
 *               seats:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Announcement created
 *   get:
 *     summary: List published trips
 *     parameters:
 *       - in: query
 *         name: departure
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: destination
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: seats
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of announcements
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already in use
 *
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated user with token
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user profile
 */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
