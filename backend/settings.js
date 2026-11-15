// Réglages modifiables depuis le backoffice (onglet Paramètres).
// Les valeurs enregistrées dans la table `settings` remplacent celles du .env au démarrage.
// Le .env garde la connexion à la base de données (DB_*, SSH_TUNNEL_*) et PORT / NODE_ENV :
// un mauvais réglage ici ne doit pas couper l'accès à la base depuis le backoffice.
// Une modification demande un redémarrage du serveur.

// Mémorise les valeurs du .env avant tout remplacement (pour afficher leur origine)
const initialEnv = {};

const CATALOG = [
  {
    group: 'Général',
    items: [
      { key: 'FRONTEND_URL', label: 'URL du site', help: 'Adresse du site public (CORS et liens).' },
      { key: 'API_PUBLIC_URL', label: 'URL publique de l\'API', help: 'Adresse publique du backend (retours OAuth).' },
    ],
  },
  {
    group: 'Sécurité',
    items: [
      { key: 'JWT_SECRET', label: 'Clé JWT', secret: true, help: 'Changer cette clé déconnecte tous les utilisateurs.' },
      { key: 'JWT_EXPIRES_IN', label: 'Durée de session', help: 'Ex. 7d, 12h. Appliqué aux nouvelles connexions.' },
    ],
  },
  {
    group: 'Compte administrateur initial',
    items: [
      { key: 'ADMIN_EMAIL', label: 'Email' },
      { key: 'ADMIN_NAME', label: 'Nom' },
      { key: 'ADMIN_PHONE', label: 'Téléphone' },
      { key: 'ADMIN_PASSWORD', label: 'Mot de passe', secret: true, help: 'Utilisé uniquement à la création du premier administrateur.' },
    ],
  },
  {
    group: 'Email (SMTP Brevo)',
    items: [
      { key: 'SMTP_HOST', label: 'Serveur SMTP', help: 'Ex. smtp-relay.brevo.com. Vide : aucun email envoyé.' },
      { key: 'SMTP_PORT', label: 'Port SMTP', help: 'Généralement 587.' },
      { key: 'SMTP_SECURE', label: 'SSL direct (true / false)', help: 'false pour le port 587, true pour le 465.' },
      { key: 'SMTP_USER', label: 'Login SMTP' },
      { key: 'SMTP_PASS', label: 'Clé SMTP', secret: true },
      { key: 'FROM_EMAIL', label: 'Adresse expéditeur', help: 'Domaine vérifié dans Brevo.' },
    ],
  },
  {
    group: 'Transports en commun',
    items: [
      { key: 'CHURCH_NAME', label: 'Nom de l\'église' },
      { key: 'CHURCH_ADDRESS', label: 'Adresse de l\'église' },
      { key: 'PRIM_API_KEY', label: 'Clé API PRIM', secret: true },
      { key: 'PRIM_JOURNEYS_URL', label: 'URL du calculateur PRIM', help: 'Laisser vide pour la valeur par défaut.' },
    ],
  },
  {
    group: 'Connexion Google / GitHub',
    items: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google : Client ID' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google : Client secret', secret: true },
      { key: 'GITHUB_CLIENT_ID', label: 'GitHub : Client ID' },
      { key: 'GITHUB_CLIENT_SECRET', label: 'GitHub : Client secret', secret: true },
    ],
  },
  {
    group: 'Autres',
    items: [
      { key: 'SENDGRID_API_KEY', label: 'Clé SendGrid (inutilisée)', secret: true },
      { key: 'TEXTBELT_KEY', label: 'Clé Textbelt (inutilisée)', secret: true },
      { key: 'BCRYPT_ROUNDS', label: 'Rounds bcrypt (inutilisé)' },
      { key: 'RATE_LIMIT_WINDOW', label: 'Limite : fenêtre en minutes (inutilisé)' },
      { key: 'RATE_LIMIT_MAX', label: 'Limite : requêtes max (inutilisé)' },
    ],
  },
];

const FIELDS = CATALOG.flatMap(g => g.items.map(f => ({ ...f, group: g.group })));
const FIELD_BY_KEY = new Map(FIELDS.map(f => [f.key, f]));

// Accès à la base et au .env : jamais modifiables depuis le backoffice
const LOCKED = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_POOL_SIZE', 'SSH_TUNNEL_USER', 'SSH_TUNNEL_HOST', 'PORT', 'NODE_ENV'];

const MAX_LENGTH = 1000;

const createTable = (db) => db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(64) PRIMARY KEY,
    setting_value TEXT NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

// Appelé avant le démarrage du serveur : les valeurs de la base remplacent celles du .env
async function loadSettingsIntoEnv(db) {
  for (const f of FIELDS) initialEnv[f.key] = process.env[f.key];
  await createTable(db);
  const rows = await db.all('SELECT setting_key, setting_value FROM settings');
  let applied = 0;
  for (const { setting_key, setting_value } of rows) {
    if (!FIELD_BY_KEY.has(setting_key) || setting_value === null) continue;
    process.env[setting_key] = setting_value;
    applied++;
  }
  console.info(`Réglages chargés depuis la base : ${applied}`);
  return applied;
}

// Vue pour le backoffice : les secrets ne sont jamais renvoyés en clair
async function getSettingsView(db) {
  const rows = await db.all('SELECT setting_key, setting_value FROM settings');
  const stored = new Map(rows.map(r => [r.setting_key, r.setting_value]));
  return CATALOG.map(group => ({
    group: group.group,
    items: group.items.map(f => {
      const fromBase = stored.has(f.key) && stored.get(f.key) !== null;
      const envValue = initialEnv[f.key];
      const hasEnv = envValue !== undefined && envValue !== '';
      const value = fromBase ? stored.get(f.key) : (envValue ?? '');
      return {
        key: f.key,
        label: f.label,
        help: f.help || null,
        secret: !!f.secret,
        source: fromBase ? 'base' : (hasEnv ? '.env' : 'vide'),
        has_value: fromBase || hasEnv,
        value: f.secret ? null : value,
      };
    }),
  }));
}

// changes : { CLE: 'valeur' } ; { CLE: null } ou { CLE: '' } revient à la valeur du .env
async function updateSettings(db, changes) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    throw Object.assign(new Error('Format invalide'), { status: 400 });
  }
  const entries = Object.entries(changes);
  for (const [key, value] of entries) {
    if (LOCKED.includes(key) || !FIELD_BY_KEY.has(key)) {
      throw Object.assign(new Error(`Réglage non modifiable : ${key}`), { status: 400 });
    }
    if (value !== null && typeof value !== 'string') {
      throw Object.assign(new Error(`Valeur invalide pour ${key}`), { status: 400 });
    }
    if (value && (value.length > MAX_LENGTH || /[\r\n]/.test(value))) {
      throw Object.assign(new Error(`Valeur trop longue ou sur plusieurs lignes pour ${key}`), { status: 400 });
    }
  }
  for (const [key, value] of entries) {
    if (value === null || value === '') {
      await db.run('DELETE FROM settings WHERE setting_key = ?', key);
    } else {
      await db.run(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
        key, value
      );
    }
  }
  return entries.length;
}

module.exports = { loadSettingsIntoEnv, getSettingsView, updateSettings };
