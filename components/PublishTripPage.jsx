import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from './context.jsx';

export default function PublishTripPage() {
  const { setCurrentPage } = useApp();
  const [form, setForm] = useState({
    departure: '',
    destination: '',
    datetime: '',
    seats: 1,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const { departure, destination, datetime } = form;
    if (!departure || !destination || !datetime) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Publication de trajet:', form);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Trajet publié !</h1>
        <button
          onClick={() => setCurrentPage('home')}
          className="text-purple-600"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour à l'accueil
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Publier un trajet</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ville de départ
            </label>
            <input
              type="text"
              value={form.departure}
              onChange={(e) => setForm({ ...form, departure: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date et heure
            </label>
            <input
              type="datetime-local"
              value={form.datetime}
              onChange={(e) => setForm({ ...form, datetime: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Places disponibles
            </label>
            <select
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) })}
              className="w-full border px-3 py-2 rounded"
            >
              <option value={1}>1 place</option>
              <option value={2}>2 places</option>
              <option value={3}>3 places</option>
              <option value={4}>4 places</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded font-semibold"
          >
            Publier le trajet
          </button>
        </form>
      </div>
    </div>
  );
}
