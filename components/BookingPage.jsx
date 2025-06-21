import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from './context.jsx';

export default function BookingPage() {
  const { setCurrentPage, token } = useApp();
  const [seats, setSeats] = useState(1);
  const handleSubmit = async () => {
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
