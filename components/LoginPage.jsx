import React, { useState } from 'react';
import { useApp } from './context.jsx';

export default function LoginPage() {
  const { setCurrentPage, setUser, setIsAuthenticated, setToken } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        setCurrentPage('profile');
      } else if (res.status === 401) {
        setError('Email ou mot de passe invalide');
      } else {
        setError("Erreur lors de la connexion. Veuillez réessayer plus tard.");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
          Se connecter
        </button>
      </form>
    </div>
  );
}
