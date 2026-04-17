import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MapPin,
  Navigation as NavIcon,
  Bus,
  Train,
  ExternalLink,
  Loader,
  Church,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from './context.jsx';
import { CHURCH } from './church';

// Format Navitia datetime: "20260419T090000" -> "09:00"
function formatNavitiaTime(s) {
  if (!s || s.length < 13) return '';
  return `${s.slice(9, 11)}:${s.slice(11, 13)}`;
}
function formatDuration(seconds) {
  if (seconds == null) return '';
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h${String(m % 60).padStart(2, '0')}`;
}
function modeIcon(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('bus')) return <Bus className="w-4 h-4" />;
  if (m.includes('tram')) return <Train className="w-4 h-4" />;
  if (m.includes('train') || m.includes('rer') || m.includes('transilien'))
    return <Train className="w-4 h-4" />;
  if (m.includes('walk') || m.includes('street')) return <NavIcon className="w-4 h-4" />;
  return <Bus className="w-4 h-4" />;
}

export default function TransitToChurchPage() {
  const { setCurrentPage } = useApp();

  const [address, setAddress] = useState('');
  const [origin, setOrigin] = useState(null); // { lat, lng, label }
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [journeys, setJourneys] = useState([]);
  const [navitiaAvailable, setNavitiaAvailable] = useState(null); // null=unknown, true/false
  const debounceRef = useRef(null);

  // Autocomplete
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
      setError("La géolocalisation n'est pas disponible.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Ma position actuelle',
        };
        setOrigin(o);
        setAddress(o.label);
        setLoading(false);
        fetchJourneys(o);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Autorisation refusée. Saisissez votre adresse manuellement."
            : "Impossible de récupérer votre position."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const pickSuggestion = (feature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const o = { lat, lng, label: feature.properties.label };
    setOrigin(o);
    setAddress(o.label);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const fetchJourneys = async (pos = origin) => {
    if (!pos) {
      setError("Veuillez indiquer votre adresse de départ.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from_lat: pos.lat,
        from_lng: pos.lng,
        to_lat: CHURCH.lat,
        to_lng: CHURCH.lng,
      });
      const res = await fetch(`/api/transit/journeys?${params.toString()}`);
      const data = await res.json();
      setNavitiaAvailable(!!data.available);
      setJourneys(data.journeys || []);
    } catch {
      setNavitiaAvailable(false);
      setJourneys([]);
    } finally {
      setLoading(false);
    }
  };

  // Deep-links vers les planners externes (fonctionnent sans clé API)
  const buildExternalLinks = () => {
    const toAddr = encodeURIComponent(CHURCH.address);
    const fromParam = origin
      ? origin.label === 'Ma position actuelle'
        ? ''
        : encodeURIComponent(origin.label)
      : '';
    return {
      google: `https://www.google.com/maps/dir/?api=1&origin=${fromParam}&destination=${toAddr}&travelmode=transit`,
      citymapper: origin
        ? `https://citymapper.com/directions?endcoord=${CHURCH.lat}%2C${CHURCH.lng}&startcoord=${origin.lat}%2C${origin.lng}&endname=${toAddr}`
        : `https://citymapper.com/directions?endcoord=${CHURCH.lat}%2C${CHURCH.lng}&endname=${toAddr}`,
      idfm: `https://www.vianavigo.com/fr/itineraires?dep=${fromParam}&arr=${toAddr}`,
    };
  };

  const links = buildExternalLinks();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Venir à l'église en transports en commun
        </h1>
        <p className="text-gray-600 mb-2">
          <Church className="inline w-4 h-4 mr-1 text-purple-600" />
          Arrivée : <strong>{CHURCH.name}</strong> — {CHURCH.address}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Bus, tram, RER, train, métro — tous les modes IDF pris en charge.
        </p>

        {/* Saisie d'adresse */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-4">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre point de départ
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setOrigin(null);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Votre adresse ou votre ville..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
              />
            </div>
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

          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
          >
            <NavIcon className="w-4 h-4 mr-2" />
            Utiliser ma position actuelle
          </button>

          <button
            onClick={() => fetchJourneys()}
            disabled={!origin || loading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Bus className="w-5 h-5 mr-2" />
            )}
            Calculer l'itinéraire
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Résultats Navitia (si disponible) */}
        {navitiaAvailable && journeys.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {journeys.length} itinéraire(s) proposé(s)
            </h2>
            {journeys.map((j, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatNavitiaTime(j.departure_date_time)}
                      <ArrowRight className="inline w-4 h-4 mx-2 text-gray-400" />
                      {formatNavitiaTime(j.arrival_date_time)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {j.nb_transfers} correspondance{j.nb_transfers > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600 flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      {formatDuration(j.duration)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {j.sections.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-0.5 w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {modeIcon(s.mode || s.type)}
                      </div>
                      <div className="flex-1">
                        {s.line ? (
                          <span className="font-semibold">
                            {s.mode || 'Transport'} {s.line}
                          </span>
                        ) : (
                          <span className="font-semibold">
                            {s.type === 'street_network' ? 'Marche' : s.mode || 'Trajet'}
                          </span>
                        )}
                        {s.direction && (
                          <span className="text-gray-500"> → {s.direction}</span>
                        )}
                        <div className="text-xs text-gray-500">
                          {s.from}
                          {s.to && ` → ${s.to}`} · {formatDuration(s.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deep-links vers planners externes — toujours disponibles */}
        {origin && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {navitiaAvailable
                ? 'Ouvrir dans un autre planificateur'
                : 'Planifier votre trajet'}
            </h3>
            {!navitiaAvailable && navitiaAvailable !== null && (
              <p className="text-sm text-gray-500 mb-4">
                Nos partenaires officiels fournissent les horaires temps réel et les
                perturbations.
              </p>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              <a
                href={links.idfm}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
              >
                <Train className="w-5 h-5" />
                Île-de-France Mobilités
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={links.google}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900"
              >
                <MapPin className="w-5 h-5" />
                Google Maps
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={links.citymapper}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700"
              >
                <Bus className="w-5 h-5" />
                Citymapper
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
