import React, { useState } from 'react';
import { useApp } from './context.jsx';

export default function RegisterPage() {
  const { setCurrentPage } = useApp();
  const [form, setForm] = useState({ name: '', first_name: '', gender: '', email: '', password: '', phone: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 409) {
        setError('Email déjà utilisé');
        return;
      }
      if (!res.ok) throw new Error('Error');
      setSuccess(true);
    } catch (err) {
      setError("Une erreur s'est produite");
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Inscription réussie !</h1>
        <button onClick={() => setCurrentPage('login')} className="text-purple-600">Se connecter</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inscription</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Prénom"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
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
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Genre</option>
          <option value="M">Homme</option>
          <option value="F">Femme</option>
          <option value="O">Autre</option>
        </select>
        <input
          type="tel"
          placeholder="Téléphone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
          S'inscrire
        </button>
      </form>
    </div>
  );
}
