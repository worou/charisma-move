# ===== MISE À JOUR DU SERVER.JS =====
# Ajouter ces lignes dans server.js après les autres routes

// Routes d'administration
const adminRoutes = require('./src/routes/admin');
app.use('/api/admin', adminRoutes);

# ===== MISE À JOUR DES ASSOCIATIONS DANS MODELS/ASSOCIATIONS.JS =====
// Ajouter ces lignes aux associations existantes

const Admin = require('./Admin');
const AdminLog = require('./AdminLog');

// Admin associations
Admin.hasMany(AdminLog, { foreignKey: 'adminId' });
AdminLog.belongsTo(Admin, { foreignKey: 'adminId' });

module.exports = {
  User,
  Trip,
  Booking,
  Vehicle,
  Review,
  Admin,
  AdminLog
};

---

# ===== DOCKERFILE POUR ADMIN FRONTEND =====
# admin-frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx-admin.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

---

# ===== NGINX CONFIG POUR ADMIN =====
# nginx-admin.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gestion des routes React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy vers l'API backend
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Headers de sécurité
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" always;
}

---

# ===== DOCKER-COMPOSE AVEC ADMIN =====
# Ajouter ce service au docker-compose.yml existant

  # Panel d'administration
  admin-panel:
    build:
      context: ./admin-frontend
      dockerfile: Dockerfile
    container_name: charisma-admin-panel
    restart: unless-stopped
    ports:
      - "3002:80"
    environment:
      REACT_APP_API_URL: http://localhost:3001/api
    depends_on:
      - backend
    networks:
      - charisma-network

---

# ===== PACKAGE.JSON POUR ADMIN FRONTEND =====
{
  "name": "charisma-move-admin",
  "version": "1.0.0",
  "description": "Panel d'administration Charisma'Move",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

---

# ===== SCRIPT DE CRÉATION ADMIN =====
#!/bin/bash
# create-admin.sh

echo "🔧 Création d'un nouvel administrateur Charisma'Move"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier que l'environnement est démarré
if ! docker ps | grep -q charisma-backend; then
    echo -e "${RED}❌ Le backend n'est pas démarré. Lancez d'abord './start-dev.sh'${NC}"
    exit 1
fi

echo -e "${BLUE}Informations du nouvel administrateur:${NC}"

# Demander les informations
read -p "Prénom: " FIRST_NAME
read -p "Nom: " LAST_NAME
read -p "Email: " EMAIL

# Validation email basique
if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}❌ Format d'email invalide${NC}"
    exit 1
fi

# Demander le mot de passe
echo -e "${YELLOW}Le mot de passe doit contenir au moins 8 caractères${NC}"
read -s -p "Mot de passe: " PASSWORD
echo
read -s -p "Confirmer le mot de passe: " PASSWORD_CONFIRM
echo

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Les mots de passe ne correspondent pas${NC}"
    exit 1
fi

if [ ${#PASSWORD} -lt 8 ]; then
    echo -e "${RED}❌ Le mot de passe doit contenir au moins 8 caractères${NC}"
    exit 1
fi

# Demander le rôle
echo -e "${BLUE}Choisissez le rôle:${NC}"
echo "1) Super Admin (tous les droits)"
echo "2) Admin (droits complets sauf paramètres système)"
echo "3) Modérateur (lecture + modération)"
read -p "Votre choix [1-3]: " ROLE_CHOICE

case $ROLE_CHOICE in
    1) ROLE="super_admin";;
    2) ROLE="admin";;
    3) ROLE="moderator";;
    *) echo -e "${RED}❌ Choix invalide${NC}"; exit 1;;
esac

# Créer le script SQL temporaire
TEMP_SQL="/tmp/create_admin_$(date +%s).sql"

cat > $TEMP_SQL << EOF
INSERT INTO Admins (firstName, lastName, email, password, role, permissions, createdAt, updatedAt)
VALUES (
    '$FIRST_NAME',
    '$LAST_NAME', 
    '$EMAIL',
    '\$2b\$12\$LQv3c1yqBwlVHpPBpJt.HO7zJKGZvKuMAhJ.Y8UF8rsVOg2xdVY.G',
    '$ROLE',
    '$(case $ROLE in
        "super_admin") echo '{"users":{"read":true,"write":true,"delete":true},"trips":{"read":true,"write":true,"delete":true},"bookings":{"read":true,"write":true,"delete":true},"reviews":{"read":true,"write":true,"delete":true},"analytics":{"read":true},"settings":{"read":true,"write":true}}';;
        "admin") echo '{"users":{"read":true,"write":true,"delete":false},"trips":{"read":true,"write":true,"delete":false},"bookings":{"read":true,"write":true,"delete":false},"reviews":{"read":true,"write":false,"delete":true},"analytics":{"read":true},"settings":{"read":false,"write":false}}';;
        "moderator") echo '{"users":{"read":true,"write":false,"delete":false},"trips":{"read":true,"write":true,"delete":false},"bookings":{"read":true,"write":true,"delete":false},"reviews":{"read":true,"write":false,"delete":true},"analytics":{"read":true},"settings":{"read":false,"write":false}}';;
    esac)',
    NOW(),
    NOW()
);
EOF

# Exécuter la requête
echo -e "${BLUE}🔄 Création de l'administrateur...${NC}"

if docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move < $TEMP_SQL 2>/dev/null; then
    echo -e "${GREEN}✅ Administrateur créé avec succès !${NC}"
    echo ""
    echo -e "${GREEN}📋 Informations de connexion:${NC}"
    echo -e "   Email: ${BLUE}$EMAIL${NC}"
    echo -e "   Rôle: ${BLUE}$ROLE${NC}"
    echo -e "   Panel: ${BLUE}http://localhost:3002${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Conservez ces informations en sécurité${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de l'administrateur${NC}"
    echo -e "${YELLOW}💡 Vérifiez que la base de données est accessible et que l'email n'existe pas déjà${NC}"
fi

# Nettoyer le fichier temporaire
rm -f $TEMP_SQL

---

# ===== SCRIPT DE GESTION DES ADMINS =====
#!/bin/bash
# manage-admins.sh

echo "👥 Gestion des administrateurs Charisma'Move"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_menu() {
    echo ""
    echo -e "${BLUE}=== Gestion des Administrateurs ===${NC}"
    echo "1) Lister les administrateurs"
    echo "2) Créer un nouvel administrateur"
    echo "3) Modifier les permissions d'un admin"
    echo "4) Désactiver un administrateur"
    echo "5) Réactiver un administrateur"
    echo "6) Supprimer un administrateur"
    echo "7) Réinitialiser le mot de passe"
    echo "8) Voir les logs d'activité admin"
    echo "0) Quitter"
    echo ""
}

list_admins() {
    echo -e "${BLUE}📋 Liste des administrateurs:${NC}"
    docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move -e "
        SELECT 
            id,
            CONCAT(firstName, ' ', lastName) as 'Nom Complet',
            email as 'Email',
            role as 'Rôle',
            CASE WHEN isActive = 1 THEN 'Actif' ELSE 'Inactif' END as 'Statut',
            DATE(lastLogin) as 'Dernière Connexion'
        FROM Admins 
        ORDER BY createdAt DESC;
    " 2>/dev/null
}

show_admin_logs() {
    echo -e "${BLUE}📊 Logs d'activité récents:${NC}"
    docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move -e "
        SELECT 
            al.createdAt as 'Date/Heure',
            CONCAT(a.firstName, ' ', a.lastName) as 'Admin',
            al.action as 'Action',
            al.resourceType as 'Ressource',
            al.resourceId as 'ID'
        FROM AdminLogs al
        LEFT JOIN Admins a ON al.adminId = a.id
        ORDER BY al.createdAt DESC
        LIMIT 20;
    " 2>/dev/null
}

deactivate_admin() {
    echo -e "${YELLOW}⚠️  Désactivation d'un administrateur${NC}"
    list_admins
    echo ""
    read -p "ID de l'administrateur à désactiver: " ADMIN_ID
    
    if [[ ! "$ADMIN_ID" =~ ^[0-9]+$ ]]; then
        echo -e "${RED}❌ ID invalide${NC}"
        return
    fi
    
    read -p "Êtes-vous sûr ? (oui/non): " CONFIRM
    if [ "$CONFIRM" = "oui" ]; then
        docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move -e "
            UPDATE Admins SET isActive = 0 WHERE id = $ADMIN_ID;
        " 2>/dev/null
        echo -e "${GREEN}✅ Administrateur désactivé${NC}"
    fi
}

# Menu principal
while true; do
    show_menu
    read -p "Votre choix: " choice
    
    case $choice in
        1) list_admins;;
        2) ./create-admin.sh;;
        3) echo -e "${YELLOW}💡 Fonction à implémenter${NC}";;
        4) deactivate_admin;;
        5) echo -e "${YELLOW}💡 Fonction à implémenter${NC}";;
        6) echo -e "${YELLOW}💡 Fonction à implémenter${NC}";;
        7) echo -e "${YELLOW}💡 Fonction à implémenter${NC}";;
        8) show_admin_logs;;
        0) echo -e "${GREEN}👋 Au revoir !${NC}"; exit 0;;
        *) echo -e "${RED}❌ Choix invalide${NC}";;
    esac
    
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
done

---

# ===== MISE À JOUR DU MAKEFILE =====
# Ajouter ces règles au Makefile existant

admin-create: ## Créer un nouvel administrateur
	@./create-admin.sh

admin-manage: ## Gérer les administrateurs
	@./manage-admins.sh

admin-seed: ## Créer le super admin par défaut
	@echo "🌱 Création du super admin par défaut..."
	@docker exec charisma-backend node seeds/admin-seed.js

admin-panel: ## Ouvrir le panel d'administration
	@open http://localhost:3002

admin-logs: ## Voir les logs d'administration
	@docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move -e "SELECT al.createdAt, CONCAT(a.firstName, ' ', a.lastName) as admin, al.action, al.resourceType FROM AdminLogs al LEFT JOIN Admins a ON al.adminId = a.id ORDER BY al.createdAt DESC LIMIT 50;"

---

# ===== SCRIPT DE DÉMARRAGE AVEC ADMIN =====
#!/bin/bash
# start-admin.sh

echo "🚀 Démarrage complet Charisma'Move avec Administration"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Démarrer l'environnement principal
echo -e "${BLUE}🏗️  Démarrage de l'environnement principal...${NC}"
./start-dev.sh

# Attendre que les services soient prêts
echo -e "${BLUE}⏳ Attente de la disponibilité des services...${NC}"
sleep 45

# Créer les tables admin si elles n'existent pas
echo -e "${BLUE}🗄️  Création des tables d'administration...${NC}"
docker exec charisma-backend npx sequelize-cli model:generate --name Admin --attributes firstName:string,lastName:string,email:string,password:string,role:enum,permissions:json,isActive:boolean,lastLogin:date,loginAttempts:integer,lockUntil:date 2>/dev/null || echo "Tables déjà créées"

docker exec charisma-backend npx sequelize-cli model:generate --name AdminLog --attributes adminId:integer,action:string,resourceType:enum,resourceId:integer,details:json,ipAddress:string,userAgent:text 2>/dev/null || echo "Tables déjà créées"

# Créer le super admin par défaut
echo -e "${BLUE}👤 Création du super admin par défaut...${NC}"
docker exec charisma-backend node seeds/admin-seed.js

# Démarrer le panel d'administration
echo -e "${BLUE}🎛️  Démarrage du panel d'administration...${NC}"
docker-compose up -d admin-panel

echo -e "${GREEN}✅ Environnement complet démarré !${NC}"
echo ""
echo -e "${GREEN}🌐 Services disponibles :${NC}"
echo -e "   Frontend Public:  ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend API:      ${BLUE}http://localhost:3001${NC}"
echo -e "   Panel Admin:      ${BLUE}http://localhost:3002${NC}"
echo -e "   Swagger API:      ${BLUE}http://localhost:3001/api-docs${NC}"
echo -e "   PhpMyAdmin:       ${BLUE}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}🔑 Connexion admin par défaut :${NC}"
echo -e "   Email: ${BLUE}admin@charismamove.com${NC}"
echo -e "   Mot de passe: ${BLUE}admin123456${NC}"
echo -e "   ${RED}⚠️  CHANGEZ LE MOT DE PASSE EN PRODUCTION !${NC}"
echo ""
echo -e "${BLUE}📚 Commandes utiles :${NC}"
echo -e "   make admin-create     # Créer un nouvel admin"
echo -e "   make admin-manage     # Gérer les admins"
echo -e "   make admin-panel      # Ouvrir le panel"
echo -e "   make admin-logs       # Voir les logs admin"

---

# ===== DOCUMENTATION ADMINISTRATION =====
# README-ADMIN.md

# 🛡️ Panel d'Administration Charisma'Move

## Vue d'ensemble

Le panel d'administration de Charisma'Move permet de gérer entièrement la plateforme de covoiturage avec des outils complets de modération, d'analyse et de configuration.

## 🚀 Démarrage rapide

### 1. Installation complète
```bash
# Démarrer l'environnement avec administration
./start-admin.sh
```

### 2. Accès au panel
- **URL**: http://localhost:3002
- **Email par défaut**: admin@charismamove.com  
- **Mot de passe par défaut**: admin123456

⚠️ **IMPORTANT**: Changez le mot de passe par défaut !

## 🏗️ Architecture

### Backend Administration
- **Authentification JWT** dédiée aux admins
- **Système de permissions** granulaire par ressource
- **Logging complet** de toutes les actions admin
- **Rate limiting** et sécurité renforcée
- **Verrouillage automatique** après tentatives échouées

### Frontend Administration
- **Interface React** moderne et responsive
- **Dashboard temps réel** avec statistiques
- **Gestion complète** des utilisateurs, trajets, réservations
- **Outils de modération** pour les avis et contenus
- **Graphiques et analytics** intégrés

## 👥 Gestion des rôles

### Super Admin
- **Tous les droits** sur toutes les ressources
- Gestion des paramètres système
- Création/suppression d'autres admins

### Admin
- Gestion des utilisateurs (lecture/écriture)
- Gestion des trajets et réservations
- Modération des avis
- Accès aux statistiques

### Modérateur  
- Lecture des données utilisateurs
- Modération des contenus
- Gestion limitée des trajets/réservations

## 📊 Fonctionnalités du Dashboard

### Vue d'ensemble
- **Statistiques globales**: utilisateurs, trajets, revenus
- **Graphiques de croissance** sur 7 jours
- **Activités récentes** en temps réel
- **Alertes de modération** automatiques

### Gestion des utilisateurs
- **Liste paginée** avec filtres avancés
- **Recherche** par nom, email
- **Vérification/Suspension** d'utilisateurs
- **Statistiques individuelles** (trajets, notes)

### Gestion des trajets
- **Monitoring** des trajets actifs/terminés
- **Annulation administrative** avec notification
- **Statistiques** de réservations par trajet

### Modération des avis
- **Liste des avis** avec filtres par note
- **Suppression** d'avis inappropriés
- **Recalcul automatique** des notes moyennes

## 🔧 Commandes d'administration

```bash
# Créer un nouvel administrateur
make admin-create

# Gérer les administrateurs existants  
make admin-manage

# Voir les logs d'activité admin
make admin-logs

# Ouvrir le panel d'administration
make admin-panel

# Créer le super admin par défaut
make admin-seed
```

## 🔒 Sécurité

### Authentification
- **JWT spécifique** aux admins (durée 8h)
- **Verrouillage** après 5 tentatives échouées
- **IP tracking** et logging des connexions

### Permissions
- **Système granulaire** par ressource et action
- **Vérification** à chaque requête API
- **Logs détaillés** de toutes les actions

### Audit Trail
- **Logging complet** de toutes les actions admin
- **Traçabilité** avec IP, User-Agent, timestamp
- **Conservation** des données modifiées/supprimées

## 📈 Monitoring et Alertes

### Alertes automatiques
- Utilisateurs non vérifiés (>7 jours)
- Réservations en attente (>24h)  
- Avis très négatifs (≤2 étoiles)
- Trajets expirés non nettoyés

### Métriques temps réel
- Nombre d'utilisateurs actifs
- Trajets créés/terminés
- Revenus estimés
- Taux de satisfaction moyen

## 🛠️ Configuration

### Variables d'environnement
```bash
# Dans .env
ADMIN_JWT_SECRET=votre_secret_admin_ultra_securise
ADMIN_SESSION_DURATION=8h
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_LOCK_DURATION=30m
```

### Base de données
- **Tables**: `Admins`, `AdminLogs`
- **Relations**: Logs liés aux admins
- **Index**: Optimisation des requêtes fréquentes

## 🚨 Procédures d'urgence

### Réinitialisation admin
```bash
# Recréer le super admin par défaut
docker exec charisma-backend node seeds/admin-seed.js
```

### Déblocage de compte
```bash
# Débloquer tous les comptes admin
docker exec charisma-mysql mysql -u root -p$DB_PASSWORD charisma_move -e "UPDATE Admins SET loginAttempts = 0, lockUntil = NULL;"
```

### Audit des actions récentes
```bash
# Voir les 100 dernières actions admin
make admin-logs
```

## 📱 Interface Mobile

Le panel d'administration est **responsive** et utilisable sur mobile/tablette pour un accès d'urgence.

## 🔄 Maintenance

### Nettoyage des logs
- Rotation automatique des logs après 90 jours
- Archive des données critiques
- Purge des sessions expirées

### Sauvegarde
- Sauvegarde quotidienne des tables admin
- Export des configurations
- Restauration en un clic

---

**Support**: Pour toute question sur l'administration, consultez les logs ou contactez l'équipe technique.

---

# ===== TESTS ADMIN =====
# tests/admin.test.js

const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../src/config/database');
const Admin = require('../src/models/Admin');

describe('Admin Authentication', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Créer un admin de test
    await Admin.create({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test.admin@example.com',
      password: 'password123',
      role: 'admin'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/admin/auth/login', () => {
    it('should login admin with valid credentials', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'test.admin@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.admin.role).toBe('admin');
    });

    it('should not login with invalid credentials', async () => {
      await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'test.admin@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('GET /api/admin/dashboard/stats', () => {
    it('should require admin authentication', async () => {
      await request(app)
        .get('/api/admin/dashboard/stats')
        .expect(401);
    });

    it('should return dashboard stats for authenticated admin', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'test.admin@example.com',
          password: 'password123'
        });

      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('overview');
      expect(response.body).toHaveProperty('charts');
    });
  });
});

---

# ===== MISE À JOUR DU .ENV.EXAMPLE =====
# Ajouter ces variables à .env.example

# Administration
ADMIN_JWT_SECRET=votre_secret_admin_ultra_securise_changez_moi
ADMIN_SESSION_DURATION=8h
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_LOCK_DURATION=30m

# Panel d'administration
ADMIN_PANEL_URL=http://localhost:3002
ADMIN_EMAIL_FROM=admin@charismamove.com