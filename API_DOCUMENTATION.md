# Documentation API - Charisma'Move

## Base URL
```
http://localhost:3001
```

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer <votre_token_jwt>
```

## Endpoints

### 🔐 Authentification

#### POST /api/users/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "name": "Dupont",
  "first_name": "Jean",
  "email": "jean.dupont@email.com",
  "password": "motdepasse123",
  "phone": "0612345678",
  "gender": "M"
}
```

**Réponse:**
```json
{
  "id": 1,
  "name": "Dupont",
  "first_name": "Jean",
  "email": "jean.dupont@email.com",
  "phone": "0612345678",
  "gender": "M",
  "is_admin": false
}
```

#### POST /api/users/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

**Réponse:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Dupont",
    "first_name": "Jean",
    "email": "jean.dupont@email.com",
    "phone": "0612345678",
    "gender": "M",
    "is_admin": false
  }
}
```

#### POST /api/admin/login
Connexion administrateur.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### GET /api/auth/me
Récupérer les informations de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

### 👥 Utilisateurs

#### GET /api/users/:id
Récupérer un utilisateur par ID.

**Headers:** `Authorization: Bearer <token>`

#### PUT /api/users/:id
Mettre à jour un utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nouveau Nom",
  "first_name": "Nouveau Prénom",
  "phone": "0612345678",
  "gender": "F"
}
```

#### GET /api/admin/users
Liste de tous les utilisateurs (admin seulement).

**Headers:** `Authorization: Bearer <token>`

#### DELETE /api/admin/users/:id
Supprimer un utilisateur (admin seulement).

**Headers:** `Authorization: Bearer <token>`

### 🚗 Trajets

#### POST /api/announcements
Publier un nouveau trajet.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "departure": "Paris",
  "destination": "Lyon",
  "datetime": "2024-01-15T14:30:00",
  "seats": 3,
  "price": 25.50,
  "description": "Trajet confortable avec arrêt possible"
}
```

#### GET /api/announcements
Rechercher des trajets.

**Query Parameters:**
- `departure`: Ville de départ
- `destination`: Ville de destination
- `seats`: Nombre de places minimum
- `date`: Date de départ (YYYY-MM-DD)

**Exemple:**
```
GET /api/announcements?departure=Paris&destination=Lyon&seats=2&date=2024-01-15
```

#### GET /api/announcements/:id
Récupérer un trajet spécifique.

#### PUT /api/announcements/:id
Modifier un trajet (propriétaire seulement).

**Headers:** `Authorization: Bearer <token>`

#### DELETE /api/announcements/:id
Supprimer un trajet (propriétaire seulement).

**Headers:** `Authorization: Bearer <token>`

### 📅 Réservations

#### POST /api/bookings
Créer une réservation.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "announcement_id": 1,
  "seats": 2,
  "message": "Bonjour, je souhaite réserver 2 places"
}
```

#### GET /api/bookings
Liste des réservations de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/bookings/:id
Récupérer une réservation spécifique.

**Headers:** `Authorization: Bearer <token>`

#### PUT /api/bookings/:id/confirm
Confirmer une réservation (propriétaire du trajet).

**Headers:** `Authorization: Bearer <token>`

#### DELETE /api/bookings/:id
Annuler une réservation.

**Headers:** `Authorization: Bearer <token>`

### 📊 Administration

#### GET /api/admin/stats
Statistiques générales (admin seulement).

**Headers:** `Authorization: Bearer <token>`

**Réponse:**
```json
{
  "total_users": 1250,
  "total_trips": 456,
  "total_bookings": 1234,
  "monthly_revenue": 45678.90,
  "active_trips": 89
}
```

#### GET /api/admin/analytics
Données analytiques (admin seulement).

**Headers:** `Authorization: Bearer <token>`

### 🔧 Utilitaires

#### GET /api/items
Liste des éléments (pour tests).

#### POST /api/items
Ajouter un élément (pour tests).

**Body:**
```json
{
  "name": "Nouvel élément"
}
```

#### GET /api/items?q=search
Rechercher des éléments.

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: email déjà utilisé) |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

## Exemples d'utilisation

### JavaScript (Fetch API)

```javascript
// Connexion
const login = async (email, password) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error('Connexion échouée');
};

// Récupérer des trajets
const getTrips = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/announcements?${params}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Erreur lors de la récupération des trajets');
};

// Publier un trajet
const publishTrip = async (tripData) => {
  const response = await fetch('/api/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(tripData)
  });
  
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Erreur lors de la publication');
};
```

### cURL

```bash
# Connexion
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Récupérer des trajets
curl -X GET "http://localhost:3001/api/announcements?departure=Paris&destination=Lyon" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Publier un trajet
curl -X POST http://localhost:3001/api/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"departure":"Paris","destination":"Lyon","datetime":"2024-01-15T14:30:00","seats":3}'
```

## Notes importantes

1. **Sécurité**: Tous les mots de passe sont hachés avec bcrypt
2. **Validation**: Toutes les données sont validées côté serveur
3. **Rate Limiting**: Limitation de 100 requêtes par 15 minutes par IP
4. **CORS**: Configuré pour accepter les requêtes depuis le frontend
5. **Logs**: Toutes les requêtes sont loggées avec leur durée d'exécution

## Support

Pour toute question concernant l'API, consultez la documentation Swagger disponible à :
```
http://localhost:3001/api-docs
``` 