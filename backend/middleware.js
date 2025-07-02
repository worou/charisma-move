const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware de validation des données
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

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware d'authentification admin
const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Accès administrateur requis' });
    }
    next();
  });
};

// Middleware de gestion d'erreurs
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);
  
  // Erreurs de validation MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Données en conflit',
      message: 'Cette ressource existe déjà'
    });
  }

  // Erreurs de connexion MySQL
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ 
      error: 'Service indisponible',
      message: 'Base de données inaccessible'
    });
  }

  // Erreurs de validation JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Token invalide',
      message: 'Veuillez vous reconnecter'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Token expiré',
      message: 'Votre session a expiré'
    });
  }

  // Erreur générique
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
};

// Middleware de logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// Middleware de validation des données d'entrée
const validateUserData = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (!validateEmail(email)) {
    errors.push('Adresse email invalide');
  }

  if (!validatePassword(password)) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Données invalides',
      messages: errors
    });
  }

  next();
};

// Middleware de validation des données de trajet
const validateTripData = (req, res, next) => {
  const { departure, destination, datetime, seats } = req.body;
  const errors = validateRequired(req.body, ['departure', 'destination', 'datetime', 'seats']);

  if (seats && (seats < 1 || seats > 8)) {
    errors.push('Le nombre de places doit être entre 1 et 8');
  }

  if (datetime && new Date(datetime) <= new Date()) {
    errors.push('La date de départ doit être dans le futur');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Données invalides',
      messages: errors
    });
  }

  next();
};

// Middleware de rate limiting simple
const rateLimiter = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!rateLimiter.has(ip)) {
      rateLimiter.set(ip, []);
    }

    const requests = rateLimiter.get(ip).filter(time => time > windowStart);
    requests.push(now);
    rateLimiter.set(ip, requests);

    if (requests.length > max) {
      return res.status(429).json({ 
        error: 'Trop de requêtes',
        message: 'Veuillez réessayer plus tard'
      });
    }

    next();
  };
};

// Nettoyage périodique du rate limiter
setInterval(() => {
  const now = Date.now();
  for (const [ip, requests] of rateLimiter.entries()) {
    const validRequests = requests.filter(time => now - time < 15 * 60 * 1000);
    if (validRequests.length === 0) {
      rateLimiter.delete(ip);
    } else {
      rateLimiter.set(ip, validRequests);
    }
  }
}, 60 * 1000); // Nettoyage toutes les minutes

module.exports = {
  validateEmail,
  validatePassword,
  validateRequired,
  authenticateToken,
  authenticateAdmin,
  errorHandler,
  requestLogger,
  validateUserData,
  validateTripData,
  rateLimit
}; 