import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, MapPin, Church, Calendar, Users, MessageSquare } from 'lucide-react';
import { useApp } from './context.jsx';
import { WORSHIP_PLACES, SERVICE_PRESETS, nextSunday } from './worshipPlaces';

export default function PublishTripPage() {
  const { setCurrentPage, token } = useApp();

  // Lieu de départ avec autocomplete + lat/lng
  const [departure, setDeparture] = useState('');
  const [departureCoords, setDepartureCoords] = useState(null); // { lat, lng }
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  // Lieu de culte (preset ou saisie libre)
  const [placeId, setPlaceId] = useState(WORSHIP_PLACES[0].id);
  const [customPlace, setCustomPlace] = useState('');

  // Service preset + date + heure
  const [servicePresetId, setServicePresetId] = useState(SERVICE_PRESETS[0].id);
  const [date, setDate] = useState(nextSunday());
  const [time, setTime] = useState(SERVICE_PRESETS[0].time);

  // Places + commentaire
  const [seats, setSeats] = useState(1);
  const [description, setDescription] = useState('');

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Autocomplete du lieu de départ
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!departure || departure.length < 3 || departureCoords) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(departure)}`);
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [departure, departureCoords]);

  const pickSuggestion = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    setDeparture(feature.properties.label);
    setDepartureCoords({ lat, lng });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const onPresetChange = (id) => {
    setServicePresetId(id);
    const preset = SERVICE_PRESETS.find((p) => p.id === id);
    if (preset && preset.time) setTime(preset.time);
  };

  const resolvedDestination = useMemo(() => {
    const place = WORSHIP_PLACES.find((p) => p.id === placeId);
    if (!place || place.id === 'autre') return customPlace.trim();
    return place.address;
  }, [placeId, customPlace]);

  const datetime = useMemo(() => {
    if (!date || !time) return null;
    return `${date}T${time}`;
  }, [date, time]);

  const isInPast = useMemo(() => {
    if (!datetime) return false;
    return new Date(datetime).getTime() < Date.now();
  }, [datetime]);

  const canSubmit =
    departure.trim().length >= 3 &&
    resolvedDestination.length >= 2 &&
    datetime &&
    !isInPast &&
    seats >= 1 &&
    !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError(
        isInPast
          ? 'La date/heure est dans le passé.'
          : 'Veuillez compléter les champs obligatoires.'
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          departure: departure.trim(),
          destination: resolvedDestination,
          datetime,
          seats,
          departure_lat: departureCoords?.lat ?? null,
          departure_lng: departureCoords?.lng ?? null,
          description: description.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Erreur lors de l'enregistrement du trajet.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trajet publié !</h1>
          <p className="text-gray-600 mb-6">
            Les membres proches de votre lieu de départ pourront vous trouver dès maintenant.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('home')}
              className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setDeparture('');
                setDepartureCoords(null);
                setDescription('');
              }}
              className="px-5 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              Publier un autre trajet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Publier un trajet</h1>
        <p className="text-gray-600 mb-8">
          Proposez votre véhicule aux membres Charisma pour le prochain culte.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow">
          {/* 1. Lieu de départ avec autocomplete */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1 text-purple-600" />
              D'où partez-vous ?
            </label>
            <div className="relative">
              <input
                type="text"
                value={departure}
                onChange={(e) => {
                  setDeparture(e.target.value);
                  setDepartureCoords(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="12 rue de la Paix, 75002 Paris..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-56 overflow-auto">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      onClick={() => pickSuggestion(s)}
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm"
                    >
                      {s.properties.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {departureCoords && (
              <p className="text-xs text-green-700 mt-1">
                ✓ Position localisée — les passagers proches vous trouveront automatiquement.
              </p>
            )}
          </section>

          {/* 2. Lieu de culte */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Church className="inline w-4 h-4 mr-1 text-purple-600" />
              Vers quel lieu de culte ?
            </label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            >
              {WORSHIP_PLACES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {placeId === 'autre' && (
              <input
                type="text"
                value={customPlace}
                onChange={(e) => setCustomPlace(e.target.value)}
                placeholder="Nom ou adresse du lieu"
                className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            )}
          </section>

          {/* 3. Quand : preset + date + heure */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1 text-purple-600" />
              Quand ?
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SERVICE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPresetChange(p.id)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    servicePresetId === p.id
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Heure</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setServicePresetId('autre');
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDate(nextSunday())}
              className="mt-2 text-sm text-purple-600 hover:text-purple-800"
            >
              📅 Sélectionner le prochain dimanche
            </button>
          </section>

          {/* 4. Places */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1 text-purple-600" />
              Places disponibles
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSeats(n)}
                  className={`flex-1 py-3 rounded-xl font-semibold border transition ${
                    seats === n
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* 5. Commentaire optionnel */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="inline w-4 h-4 mr-1 text-purple-600" />
              Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Point de rendez-vous précis, retour prévu après le culte, etc."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </section>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publication…' : 'Publier le trajet'}
          </button>
        </form>
      </div>
    </div>
  );
}
