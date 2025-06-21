import React, { useEffect, useState } from 'react';
import { useApp } from './context.jsx';

export default function ProfilePage() {
  const { user, token, setCurrentPage, setIsAuthenticated, setUser, setToken } = useApp();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!token || !user) return;
    fetch(`/api/users/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data));
  }, [token, user]);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    setCurrentPage('home');
  };

  if (!profile) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <p className="mb-2"><strong>Nom:</strong> {profile.name}</p>
      <p className="mb-2"><strong>Prénom:</strong> {profile.first_name}</p>
      <p className="mb-2"><strong>Téléphone:</strong> {profile.phone}</p>
      <p className="mb-2"><strong>Genre:</strong> {profile.gender}</p>
      <p className="mb-4"><strong>Email:</strong> {profile.email}</p>
      <button onClick={logout} className="text-purple-600">Se déconnecter</button>
    </div>
  );
}
