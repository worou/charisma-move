import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MapPin,
  Navigation as NavIcon,
  Phone,
  Mail,
  Users,
  Calendar,
  X,
  Search,
  Loader,
} from 'lucide-react';
import { useApp } from './context.jsx';

export default function NearbyCarpoolPage() {
  const { setCurrentPage } = useApp();

  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [position, setPosition] = useState(null); // { lat, lng, label }
  const [radius, setRadius] = useState(20);
  const [fromDate, setFromDate] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const debounceRef = useRef(null);

  // Autocomplétion sur saisie d'adresse (via proxy /api/geocode)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!address || address.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [address]);

  const useMyLocation = () => {
    setError(null);
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur votre appareil.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Ma position actuelle',
        };
        setPosition(p);
        setAddress(p.label);
        setLoading(false);
        searchNearby(p);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Autorisation refusée. Veuillez saisir votre adresse manuellement."
            : 'Impossible de récupérer votre position.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectSuggestion = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const p = { lat, lng, label: feature.properties.label };
    setPosition(p);
    setAddress(p.label);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const searchNearby = async (pos = position) => {
    if (!pos) {
      setError('Veuillez indiquer votre position.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: pos.lat,
        lng: pos.lng,
        radius: String(radius),
      });
      if (fromDate) params.set('from', fromDate);
      const res = await fetch(`/api/announcements/nearby?${params.toString()}`);
      if (!res.ok) throw new Error('Recherche échouée');
      const data = await res.json();
      setResults(data);
      if (data.length === 0) {
        setError(`Aucun covoitureur trouvé dans un rayon de ${radius} km.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trouver un covoitureur près de moi
        </h1>
        <p className="text-gray-600 mb-8">
          Où que vous soyez en France, trouvez les membres qui partent vers le culte depuis
          votre secteur.
        </p>

        {/* Panneau de recherche */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre adresse ou ville
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setShowSuggestions(true);
                  setPosition(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="12 rue de la Paix, Paris..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-64 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => selectSuggestion(s)}
                    className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                  >
                    {s.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <NavIcon className="w-4 h-4 mr-2" />
            Utiliser ma position actuelle
          </button>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rayon de recherche
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                À partir du (optionnel)
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => searchNearby()}
            disabled={loading || !position}
            className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            Rechercher les covoitureurs proches
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Résultats */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              {results.length} covoitureur(s) trouvé(s)
            </h2>
            {results.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelected(trip)}
                className="w-full text-left bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold">
                      {(trip.driver_first_name || trip.driver_name || '?')
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {trip.driver_first_name || trip.driver_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {trip.departure} → {trip.destination}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDateTime(trip.datetime)}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {trip.seats} place(s)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {Number(trip.distance_km).toFixed(1)} km
                  </div>
                  <div className="text-xs text-gray-500">de vous</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Modal coordonnées */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Contacter le covoitureur
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl">
                  {(selected.driver_first_name || selected.driver_name || '?')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    {selected.driver_first_name} {selected.driver_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selected.departure} → {selected.destination}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(selected.datetime)} · {selected.seats} place(s)
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selected.driver_phone && (
                  <a
                    href={`tel:${selected.driver_phone}`}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
                  >
                    <Phone className="w-5 h-5" />
                    Appeler — {selected.driver_phone}
                  </a>
                )}
                {selected.driver_phone && (
                  <a
                    href={`https://wa.me/${selected.driver_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </a>
                )}
                {selected.driver_email && (
                  <a
                    href={`mailto:${selected.driver_email}?subject=Réservation covoiturage Charisma'Move`}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                  >
                    <Mail className="w-5 h-5" />
                    Envoyer un email
                  </a>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Contactez directement ce membre pour réserver votre place.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
