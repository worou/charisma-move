# Charisma Move

This project contains a React application and a simple Node.js backend. The backend stores data in a MySQL database and exposes REST APIs documented with Swagger. The React interface demonstrates how to consume these APIs.

## Backend setup

1. Navigate to the `backend` directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

   *(Network access is required to download packages.)*

2. Copy `.env.example` to `.env` and adjust credentials to match your MySQL instance. You can also set the initial administrator credentials here using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

3. Create tables for demo data and users (the `users` table now includes an `is_admin` column to flag administrators):

   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL UNIQUE,
       password VARCHAR(255) NOT NULL,
       is_admin BOOLEAN DEFAULT FALSE
   );

   CREATE TABLE items (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL
   );
   ```

4. Start the server:

   ```bash
   npm start
   ```

   The API will be available on `http://localhost:3001` and documentation on `http://localhost:3001/api-docs`.

### User API

The backend now exposes simple authentication endpoints. A default administrator account is created on first run using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables (defaults are `admin@example.com`/`admin123`).

#### Endpoints

* `POST /api/users/register` – create a user. Body fields: `name`, `email`, `password`.
* `POST /api/users/login` – obtain a JWT token. Body fields: `email`, `password`.
* `POST /api/admin/login` – login as administrator. Body fields: `email`, `password`.
* `GET /api/users/:id` – retrieve a user profile (requires `Authorization: Bearer <token>`).

## React usage

The React `AboutPage` now includes a small example component (`DataList`) that fetches and adds items using the backend API.

Install the frontend dependencies in the project root and start the Vite dev server. The configuration proxies any `/api` calls to the backend on port `3001` so that registration and login work during development.

```bash
npm install
npm run dev
```

## Docker usage

You can launch a full development stack with Docker. Ensure Docker and Docker Compose are installed, then run:

```bash
docker-compose up --build
```

This will start a MySQL instance and the backend on port `3001`. The frontend
container installs its dependencies automatically and serves the React app on
port `3000`.
