import React, { useEffect, useState } from 'react';
import { useApp } from './context.jsx';

export default function MyBookingsPage() {
  const { token } = useApp();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setBookings(data);
        }
      } catch {
        /* ignore */
      }
    };
    fetchBookings();
  }, [token]);

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Mes réservations</h1>
      {bookings.map((b) => (
        <div key={b.id} className="border p-4 rounded-lg">
          <div className="font-medium">
            {b.departure} → {b.arrival} le {b.travel_date} à {b.travel_time}
          </div>
          <div className="text-sm text-gray-600">
            {b.seats} place(s) • {b.status} • Gratuit
          </div>
        </div>
      ))}
      {bookings.length === 0 && <p>Aucune réservation.</p>}
    </div>
  );
}
