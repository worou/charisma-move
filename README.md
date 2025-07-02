# Charisma'Move - Plateforme de Covoiturage

Une plateforme moderne de covoiturage développée avec React et Node.js.

## 🚀 Fonctionnalités

- **Recherche de trajets** : Trouvez des covoiturages disponibles
- **Publication de trajets** : Proposez vos trajets à la communauté
- **Système de réservation** : Réservez facilement vos places
- **Gestion de profil** : Gérez vos informations personnelles
- **Interface admin** : Tableau de bord administrateur complet
- **Notifications** : Système de notifications en temps réel
- **Responsive design** : Interface adaptée à tous les appareils

## 🛠️ Technologies utilisées

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (icônes)
- Recharts (graphiques)

### Backend
- Node.js
- Express.js
- MySQL
- JWT (authentification)
- bcryptjs (hachage des mots de passe)

## 📋 Prérequis

- Node.js (version 16 ou supérieure)
- MySQL (version 5.7 ou supérieure)
- npm ou yarn

## 🔧 Installation

1. **Cloner le repository**
   ```bash
   git clone <url-du-repo>
   cd charisma-move
   ```

2. **Installer les dépendances**
   ```bash
   npm run setup
   ```

3. **Configurer la base de données**
   - Créer une base de données MySQL nommée `charisma_move`
   - Copier le fichier `env.example` vers `.env`
   - Modifier les variables d'environnement dans `.env`

4. **Démarrer l'application**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Backend
   cd backend
   npm start
   ```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` dans le dossier racine avec les variables suivantes :

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=charisma_move

# Serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d

# Admin par défaut
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin

# Email (optionnel)
SENDGRID_API_KEY=votre_cle_api_sendgrid
FROM_EMAIL=noreply@charisma-move.com

# SMS (optionnel)
TEXTBELT_KEY=votre_cle_textbelt
```

## 🚀 Démarrage rapide

1. **Installation automatique**
   ```bash
   npm run setup
   ```

2. **Démarrage des services**
   ```bash
   # Frontend (http://localhost:3000)
   npm run dev
   
   # Backend (http://localhost:3001)
   cd backend && npm start
   ```

3. **Accès à l'application**
   - Application principale : http://localhost:3000
   - Interface admin : http://localhost:3000/admin
   - API documentation : http://localhost:3001/api-docs

## 📁 Structure du projet

```
charisma-move/
├── components/          # Composants React
│   ├── AdminApp.jsx    # Interface administrateur
│   ├── CharismaMoveApp.jsx # Application principale
│   ├── context.jsx     # Contexte global
│   └── ...
├── backend/            # Serveur Node.js
│   ├── index.js       # Point d'entrée du serveur
│   └── package.json   # Dépendances backend
├── main.jsx           # Point d'entrée React
├── home.jsx           # Composant racine
├── vite.config.js     # Configuration Vite
└── package.json       # Dépendances frontend
```

## 🔐 Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection CORS configurée
- Rate limiting (à implémenter)

## 🧪 Tests

```bash
# Tests frontend (à implémenter)
npm test

# Tests backend (à implémenter)
cd backend && npm test
```

## 📦 Build de production

```bash
# Build frontend
npm run build

# Build backend
cd backend && npm run build
```

## 🐳 Docker (optionnel)

```bash
# Construire l'image
docker-compose build

# Démarrer les services
docker-compose up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🔄 Changelog

### Version 1.0.0
- Interface utilisateur complète
- Système d'authentification
- Gestion des trajets et réservations
- Interface administrateur
- API REST complète
