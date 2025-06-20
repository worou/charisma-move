# Charisma Move

This project contains a React application and a simple Node.js backend. The backend stores data in a MySQL database and exposes REST APIs documented with Swagger. The React interface demonstrates how to consume these APIs.

## Backend setup

1. Navigate to the `backend` directory and install dependencies:

   ```bash
   cd backend
   npm install
   ```

   *(Network access is required to download packages.)*

2. Copy `.env.example` to `.env` and adjust credentials to match your MySQL instance.

3. Create a table for demo data:

   ```sql
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

## React usage

The React `AboutPage` now includes a small example component (`DataList`) that fetches and adds items using the backend API.

Run your favorite React bundler to serve the frontend and ensure requests are proxied to the Node server.

## Docker usage

You can launch a full development stack with Docker. Ensure Docker and Docker Compose are installed, then run:

```bash
docker-compose up --build
```

This will start a MySQL instance and the backend on port `3001`.
