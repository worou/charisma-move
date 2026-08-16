const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ── Database ──────────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'charisma_move.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    first_name TEXT,
    gender     TEXT,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    phone      TEXT,
    is_admin   INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    departure   TEXT,
    arrival     TEXT,
    travel_date TEXT,
    travel_time TEXT,
    seats       INTEGER,
    price       REAL DEFAULT 0,
    status      TEXT DEFAULT 'pending',
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    departure   TEXT NOT NULL,
    destination TEXT NOT NULL,
    datetime    TEXT NOT NULL,
    seats       INTEGER NOT NULL,
    price       REAL,
    description TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// CREATE TABLE IF NOT EXISTS n'ajoute pas de colonne à une base déjà créée :
// on rattache les réservations au trajet réservé par une migration explicite.
if (!db.prepare('PRAGMA table_info(bookings)').all().some(c => c.name === 'announcement_id')) {
  db.exec('ALTER TABLE bookings ADD COLUMN announcement_id INTEGER REFERENCES announcements(id)');
  console.log('Migration : bookings.announcement_id ajouté');
}

// Seed default admin
const adminCount = db.prepare('SELECT COUNT(*) as c FROM users WHERE is_admin = 1').get();
if (adminCount.c === 0) {
  const email    = process.env.ADMIN_EMAIL    || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name     = process.env.ADMIN_NAME     || 'Admin';
  const hash     = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 1)').run(name, email, hash);
  console.log(`Admin créé: ${email}`);
}
console.log('Base de données SQLite prête');

// ── Auth middleware ───────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function authenticateAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || !user.is_admin) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// ── Items ─────────────────────────────────────────────────────────────────────
app.get('/api/items', (req, res) => {
  const { q } = req.query;
  const rows = q
    ? db.prepare('SELECT id, name FROM items WHERE LOWER(name) LIKE ?').all(`%${q.toLowerCase()}%`)
    : db.prepare('SELECT id, name FROM items').all();
  res.json(rows);
});

app.post('/api/items', (req, res) => {
  const result = db.prepare('INSERT INTO items (name) VALUES (?)').run(req.body.name);
  res.status(201).json({ id: result.lastInsertRowid, name: req.body.name });
});

// ── User auth ─────────────────────────────────────────────────────────────────
app.post('/api/users/register', async (req, res) => {
  const { name, first_name, gender, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const hash   = await bcrypt.hash(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, first_name, gender, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, first_name || null, gender || null, email, hash, phone || null);
  res.status(201).json({ id: result.lastInsertRowid, name, first_name, gender, email, phone, is_admin: false });
});

app.post(['/api/users/login', '/api/auth/login'], async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, is_admin: !!user.is_admin }, JWT_SECRET, { expiresIn: '1h' });
  res.json({
    token,
    user: { id: user.id, name: user.name, first_name: user.first_name, gender: user.gender, email: user.email, phone: user.phone, is_admin: !!user.is_admin },
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, name, first_name, gender, email, phone, is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const user = db.prepare('SELECT id, name, first_name, gender, email, phone, is_admin FROM users WHERE id = ?').get(req.user.id);
  res.json(user || {});
});

app.put('/api/users/:id', authenticateToken, (req, res) => {
  if (parseInt(req.params.id) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  const { name, first_name, gender, phone } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), first_name = COALESCE(?, first_name), gender = COALESCE(?, gender), phone = COALESCE(?, phone) WHERE id = ?')
    .run(name, first_name, gender, phone, req.user.id);
  const user = db.prepare('SELECT id, name, first_name, gender, email, phone, is_admin FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ── Admin: login ──────────────────────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_admin = 1').get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, is_admin: true }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin: { id: user.id, name: user.name, email: user.email } });
});

// ── Admin: users ──────────────────────────────────────────────────────────────
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  res.json(db.prepare('SELECT id, name, first_name, email, phone, is_admin FROM users ORDER BY id ASC').all());
});

app.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if (password.length < 8) return res.status(400).json({ error: 'Password too short' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const hash = await bcrypt.hash(password, 12);
  let result;
  try {
    result = db.prepare(
      'INSERT INTO users (name, email, password, phone, is_admin) VALUES (?, ?, ?, ?, 1)'
    ).run(name, email, hash, phone || null);
  } catch (e) {
    // email est UNIQUE : rattrape la collision entre le pré-contrôle et l'insertion
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'Email already in use' });
    throw e;
  }
  res.status(201).json({ id: result.lastInsertRowid, name, email, phone: phone || null, is_admin: true });
});

app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ? AND is_admin = 0').run(req.params.id);
  res.json({ success: true });
});

// ── Admin: stats ──────────────────────────────────────────────────────────────
app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
  const total_users    = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const total_trips    = db.prepare('SELECT COUNT(*) as c FROM announcements').get().c;
  const total_bookings = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const active_trips   = db.prepare("SELECT COUNT(*) as c FROM announcements WHERE datetime > datetime('now')").get().c;
  res.json({ total_users, total_trips, total_bookings, active_trips });
});

// ── Admin: announcements ──────────────────────────────────────────────────────
app.get('/api/admin/announcements', authenticateAdmin, (req, res) => {
  res.json(db.prepare(`
    SELECT a.*, u.name as driver_name, u.email as driver_email
    FROM announcements a JOIN users u ON a.user_id = u.id
    ORDER BY a.datetime DESC
  `).all());
});

app.delete('/api/admin/announcements/:id', authenticateAdmin, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Admin: bookings ───────────────────────────────────────────────────────────
app.get('/api/admin/bookings', authenticateAdmin, (req, res) => {
  res.json(db.prepare(`
    SELECT b.*, u.name as user_name, u.email as user_email
    FROM bookings b JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all());
});

// ── Announcements ─────────────────────────────────────────────────────────────
app.post('/api/announcements', authenticateToken, (req, res) => {
  const { departure, destination, datetime, seats } = req.body;
  if (!departure || !destination || !datetime || !seats) return res.status(400).json({ error: 'Missing fields' });
  const result = db.prepare(
    'INSERT INTO announcements (user_id, departure, destination, datetime, seats) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, departure, destination, datetime, seats);
  res.status(201).json({ id: result.lastInsertRowid, departure, destination, datetime, seats });
});

app.get('/api/announcements', (req, res) => {
  // route publique : on expose le nom du conducteur, jamais son email ni son user_id
  let query = `
    SELECT a.id, a.departure, a.destination, a.datetime, a.seats, a.price, a.description, u.name AS driver_name
    FROM announcements a JOIN users u ON a.user_id = u.id
    WHERE 1=1`;
  const params = [];
  if (req.query.departure)   { query += ' AND LOWER(a.departure) LIKE ?';   params.push(`%${req.query.departure.toLowerCase()}%`); }
  if (req.query.destination) { query += ' AND LOWER(a.destination) LIKE ?'; params.push(`%${req.query.destination.toLowerCase()}%`); }
  if (req.query.seats)       { query += ' AND a.seats >= ?';                params.push(parseInt(req.query.seats)); }
  if (req.query.date)        { query += ' AND date(a.datetime) = ?';        params.push(req.query.date); }
  query += ' ORDER BY a.datetime ASC';
  res.json(db.prepare(query).all(...params));
});

// ── Bookings ──────────────────────────────────────────────────────────────────
// Réserver décrémente les places restantes du trajet. Les colonnes à plat
// (departure/arrival/travel_date/travel_time) sont dérivées du trajet et non
// envoyées par le client : MyBookingsPage et l'admin les lisent encore.
const bookSeats = db.transaction((userId, announcementId, seats) => {
  const trip = db.prepare('SELECT * FROM announcements WHERE id = ?').get(announcementId);
  if (!trip) return { error: 'Trip not found', status: 404 };
  if (seats > trip.seats) return { error: 'Not enough seats', status: 409, available: trip.seats };

  const [travel_date, travel_time] = String(trip.datetime).split('T');
  db.prepare('UPDATE announcements SET seats = seats - ? WHERE id = ?').run(seats, announcementId);
  const result = db.prepare(
    'INSERT INTO bookings (user_id, announcement_id, departure, arrival, travel_date, travel_time, seats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(userId, announcementId, trip.departure, trip.destination, travel_date, travel_time || null, seats, trip.price || 0);

  return {
    booking: {
      id: result.lastInsertRowid,
      announcement_id: announcementId,
      departure: trip.departure,
      arrival: trip.destination,
      travel_date,
      travel_time: travel_time || null,
      seats,
      price: trip.price || 0,
      status: 'pending',
    },
    seats_left: trip.seats - seats,
  };
});

app.post('/api/bookings', authenticateToken, (req, res) => {
  const announcement_id = parseInt(req.body.announcement_id);
  const seats = parseInt(req.body.seats);
  if (!announcement_id) return res.status(400).json({ error: 'Missing announcement_id' });
  if (!seats || seats < 1) return res.status(400).json({ error: 'Invalid seats' });

  const out = bookSeats(req.user.id, announcement_id, seats);
  if (out.error) return res.status(out.status).json({ error: out.error, available: out.available });
  res.status(201).json({ ...out.booking, seats_left: out.seats_left });
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  res.json(db.prepare(
    'SELECT id, departure, arrival, travel_date, travel_time, seats, price, status, created_at FROM bookings WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id));
});

// Ne touche pas aux places : elles sont déjà déduites à la création de la réservation.
// L'admin confirme n'importe quelle réservation (AdminBookings), un utilisateur
// seulement les siennes.
app.post('/api/bookings/:id/confirm', authenticateToken, (req, res) => {
  const result = req.user.is_admin
    ? db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ?").run(req.params.id)
    : db.prepare("UPDATE bookings SET status = 'confirmed' WHERE id = ? AND user_id = ?").run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true });
});

// Annuler rend les places au trajet, sinon elles seraient perdues définitivement.
const cancelBooking = db.transaction((bookingId, userId) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, userId);
  if (!booking) return { deleted: false };
  db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  if (booking.announcement_id) {
    db.prepare('UPDATE announcements SET seats = seats + ? WHERE id = ?').run(booking.seats, booking.announcement_id);
  }
  return { deleted: true };
});

app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const { deleted } = cancelBooking(parseInt(req.params.id), req.user.id);
  if (!deleted) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
