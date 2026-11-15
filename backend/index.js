// Point d'entrée : charge les réglages enregistrés depuis le backoffice, puis lance le serveur.
require('dotenv').config();
const db = require('./db');
const { loadSettingsIntoEnv } = require('./settings');

loadSettingsIntoEnv(db)
  .catch((err) => console.error('Réglages non chargés depuis la base :', err.message))
  .then(() => require('./server'));
