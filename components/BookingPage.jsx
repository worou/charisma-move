import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from './context.jsx';

export default function BookingPage() {
  const { setCurrentPage, token, user } = useApp();
  const [seats, setSeats] = useState(1);
  const [profile, setProfile] = useState(null);
  const [info, setInfo] = useState({ name: '', first_name: '', phone: '', gender: '' });
  const [needsInfo, setNeedsInfo] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !user) return;
      try {
        const res = await fetch(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setInfo({
            name: data.name || '',
            first_name: data.first_name || '',
            phone: data.phone || '',
            gender: data.gender || '',
          });
          if (!data.phone || !data.gender || !data.first_name || !data.name) {
            setNeedsInfo(true);
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchProfile();
  }, [token, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(info),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setNeedsInfo(false);
      } else {
        alert('Erreur lors de la mise à jour du profil');
      }
    } catch {
      alert('Erreur lors de la mise à jour du profil');
    }
  };
  const handleSubmit = async () => {
    if (needsInfo) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          departure: 'Paris',
          arrival: 'Lyon',
          travel_date: '2024-01-15',
          travel_time: '14:00',
          seats,
        }),
      });
      if (!res.ok) throw new Error();
      alert('Réservation confirmée !');
      setCurrentPage('my-bookings');
    } catch (err) {
      alert('Erreur lors de la réservation');
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <button
        onClick={() => setCurrentPage('search-results')}
        className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
      >
        <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
        Retour
      </button>
      {needsInfo && (
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4 mb-6">
          <h2 className="font-semibold">Complétez votre profil</h2>
          <input
            type="text"
            placeholder="Nom"
            value={info.name}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Prénom"
            value={info.first_name}
            onChange={(e) => setInfo({ ...info, first_name: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={info.phone}
            onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          <select
            value={info.gender}
            onChange={(e) => setInfo({ ...info, gender: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Genre</option>
            <option value="M">Homme</option>
            <option value="F">Femme</option>
            <option value="O">Autre</option>
          </select>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg">
            Enregistrer
          </button>
        </form>
      )
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de places</label>
          <input
            type="number"
            value={seats}
            min="1"
            onChange={(e) => setSeats(parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg"
        >
          Confirmer la réservation
        </button>
      </div>
    </div>
  );
}
