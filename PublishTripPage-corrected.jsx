import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from './context.jsx';

export default function PublishTripPage() {
  const { setCurrentPage, token } = useApp();
  const [form, setForm] = useState({
    departure: '',
    destination: '',
    datetime: '',
    seats: 1,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation des données
  const validateForm = () => {
    const { departure, destination, datetime, seats } = form;
    
    if (!departure.trim()) {
      setError('La ville de départ est obligatoire');
      return false;
    }
    
    if (!destination.trim()) {
      setError('La destination est obligatoire');
      return false;
    }
    
    if (!datetime) {
      setError('La date et l\'heure sont obligatoires');
      return false;
    }
    
    // Vérifier que la date est dans le futur
    const selectedDate = new Date(datetime);
    const now = new Date();
    if (selectedDate <= now) {
      setError('La date doit être dans le futur');
      return false;
    }
    
    if (seats < 1 || seats > 4) {
      setError('Le nombre de places doit être entre 1 et 4');
      return false;
    }
    
    if (departure.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('La ville de départ et la destination doivent être différentes');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          departure: form.departure.trim(),
          destination: form.destination.trim(),
          datetime: form.datetime,
          seats: form.seats,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 401) {
          throw new Error('Non autorisé. Veuillez vous reconnecter.');
        } else if (res.status === 400) {
          throw new Error(errorData?.message || 'Données invalides');
        } else if (res.status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        } else {
          throw new Error('Erreur lors de la publication du trajet');
        }
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur lors de la saisie
    if (error) {
      setError(null);
    }
  };

  // Obtenir la date minimale (maintenant + 1 heure)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trajet publié avec succès !</h1>
          <p className="text-gray-600 mb-6">Votre trajet a été publié et est maintenant visible par les autres utilisateurs.</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6 font-medium transition-colors duration-200"
          disabled={isLoading}
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour à l'accueil
        </button>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Publier un trajet</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="departure" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Ville de départ <span className="text-red-500">*</span>
              </label>
              <input
                id="departure"
                type="text"
                value={form.departure}
                onChange={(e) => handleInputChange('departure', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Paris"
                required
                disabled={isLoading}
                aria-describedby="departure-error"
              />
            </div>
            
            <div>
              <label 
                htmlFor="destination" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                id="destination"
                type="text"
                value={form.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Lyon"
                required
                disabled={isLoading}
                aria-describedby="destination-error"
              />
            </div>
            
            <div>
              <label 
                htmlFor="datetime" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Date et heure <span className="text-red-500">*</span>
              </label>
              <input
                id="datetime"
                type="datetime-local"
                value={form.datetime}
                onChange={(e) => handleInputChange('datetime', e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={getMinDateTime()}
                required
                disabled={isLoading}
                aria-describedby="datetime-error"
              />
            </div>
            
            <div>
              <label 
                htmlFor="seats" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Places disponibles
              </label>
              <select
                id="seats"
                value={form.seats}
                onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value={1}>1 place</option>
                <option value={2}>2 places</option>
                <option value={3}>3 places</option>
                <option value={4}>4 places</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publication en cours...
                </>
              ) : (
                'Publier le trajet'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}