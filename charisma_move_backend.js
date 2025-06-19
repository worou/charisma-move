import React, { useState, useEffect } from 'react';
import { Search, Car, Users, Shield, Smartphone, Globe, DollarSign, Leaf, Heart, Menu, X, User, Settings, Calendar, Star, MapPin, Clock, ArrowRight, ChevronDown, Home, BookOpen, Phone, Mail } from 'lucide-react';

// Context pour la gestion de l'état global
const AppContext = React.createContext();

// Hook pour utiliser le contexte
const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Provider pour l'état global
const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    currentPage,
    setCurrentPage,
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    searchResults,
    setSearchResults,
    isLoading,
    setIsLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Page d'accueil
const HomePage = () => {
  const { setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState('search');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchForm, setSearchForm] = useState({
    departure: '',
    arrival: '',
    date: '',
    passengers: 1
  });
  const [publishForm, setPublishForm] = useState({
    departure: '',
    arrival: '',
    datetime: '',
    price: '',
    seats: 1,
    description: ''
  });

  const handleSearchSubmit = () => {
    if (!searchForm.departure || !searchForm.arrival || !searchForm.date) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Recherche:', searchForm);
    setCurrentPage('search-results');
  };

  const handlePublishSubmit = () => {
    if (!publishForm.departure || !publishForm.arrival || !publishForm.datetime || !publishForm.price) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    console.log('Publication:', publishForm);
    setCurrentPage('my-trips');
  };

  const features = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Économique",
      description: "Partagez les frais de route et voyagez jusqu'à 3x moins cher qu'en train ou en avion."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Écologique",
      description: "Réduisez votre empreinte carbone en partageant votre véhicule avec d'autres voyageurs."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Convivial",
      description: "Rencontrez de nouvelles personnes et rendez vos trajets plus agréables grâce au covoiturage."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Sécurisé",
      description: "Profils vérifiés, avis des membres et assistance 24h/7j pour voyager en toute sérénité."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Simple",
      description: "Réservez en quelques clics sur notre site ou notre application mobile."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Partout",
      description: "Service disponible dans toute la France avec des milliers de trajets quotidiens."
    }
  ];

  const stats = [
    { number: "50K+", label: "Membres actifs" },
    { number: "500+", label: "Villes desservies" },
    { number: "10K", label: "Trajets par mois" },
    { number: "4.9★", label: "Satisfaction client" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Voyagez avec
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Charisma
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
              La plateforme de covoiturage nouvelle génération qui allie économie, écologie et convivialité
            </p>
          </div>

          {/* Search Container */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              {/* Tabs */}
              <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'search'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Search className="inline-block w-5 h-5 mr-2" />
                  Rechercher un trajet
                </button>
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'publish'
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Car className="inline-block w-5 h-5 mr-2" />
                  Publier un trajet
                </button>
              </div>

              {/* Search Form */}
              {activeTab === 'search' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville de départ
                      </label>
                      <input
                        type="text"
                        value={searchForm.departure}
                        onChange={(e) => setSearchForm({...searchForm, departure: e.target.value})}
                        placeholder="Paris, Gare de Lyon..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={searchForm.arrival}
                        onChange={(e) => setSearchForm({...searchForm, arrival: e.target.value})}
                        placeholder="Lyon, Part-Dieu..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date de départ
                      </label>
                      <input
                        type="date"
                        value={searchForm.date}
                        onChange={(e) => setSearchForm({...searchForm, date: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre de passagers
                      </label>
                      <select
                        value={searchForm.passengers}
                        onChange={(e) => setSearchForm({...searchForm, passengers: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      >
                        <option value={1}>1 passager</option>
                        <option value={2}>2 passagers</option>
                        <option value={3}>3 passagers</option>
                        <option value={4}>4+ passagers</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Rechercher des trajets
                  </button>
                </div>
              )}

              {/* Publish Form */}
              {activeTab === 'publish' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ville de départ
                      </label>
                      <input
                        type="text"
                        value={publishForm.departure}
                        onChange={(e) => setPublishForm({...publishForm, departure: e.target.value})}
                        placeholder="Votre ville de départ..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={publishForm.arrival}
                        onChange={(e) => setPublishForm({...publishForm, arrival: e.target.value})}
                        placeholder="Votre destination..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date et heure
                      </label>
                      <input
                        type="datetime-local"
                        value={publishForm.datetime}
                        onChange={(e) => setPublishForm({...publishForm, datetime: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prix par passager (€)
                      </label>
                      <input
                        type="number"
                        value={publishForm.price}
                        onChange={(e) => setPublishForm({...publishForm, price: e.target.value})}
                        placeholder="25"
                        min="1"
                        max="100"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Places disponibles
                    </label>
                    <select
                      value={publishForm.seats}
                      onChange={(e) => setPublishForm({...publishForm, seats: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                    >
                      <option value={1}>1 place</option>
                      <option value={2}>2 places</option>
                      <option value={3}>3 places</option>
                      <option value={4}>4 places</option>
                    </select>
                  </div>
                  <button
                    onClick={handlePublishSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Publier le trajet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Charisma'Move ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience de covoiturage réinventée pour répondre à tous vos besoins de mobilité
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 group cursor-pointer"
                onClick={() => setCurrentPage('features')}
              >
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setCurrentPage('about')}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-purple-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Page de résultats de recherche
const SearchResultsPage = () => {
  const { setCurrentPage } = useApp();
  
  const mockTrips = [
    {
      id: 1,
      driver: { name: "Alice Martin", rating: 4.8, reviews: 15, photo: "👩‍🦰" },
      departure: { city: "Paris", address: "Gare de Lyon", time: "14:00" },
      arrival: { city: "Lyon", address: "Part-Dieu", time: "18:00" },
      price: 25,
      seats: 2,
      vehicle: "Renault Clio (2020)",
      instant: true
    },
    {
      id: 2,
      driver: { name: "Bob Dupont", rating: 4.5, reviews: 8, photo: "👨‍💼" },
      departure: { city: "Paris", address: "Porte de Versailles", time: "15:30" },
      arrival: { city: "Lyon", address: "Perrache", time: "19:30" },
      price: 22,
      seats: 3,
      vehicle: "Peugeot 308 (2019)",
      instant: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Retour à la recherche
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trajets disponibles</h1>
          <p className="text-gray-600">Paris → Lyon • {mockTrips.length} trajet(s) trouvé(s)</p>
        </div>

        <div className="space-y-6">
          {mockTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-4">{trip.driver.photo}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{trip.driver.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        {trip.driver.rating} • {trip.driver.reviews} avis
                      </div>
                    </div>
                    {trip.instant && (
                      <span className="ml-4 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        Réservation instantanée
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{trip.departure.city}</div>
                        <div className="text-sm text-gray-600">{trip.departure.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{trip.departure.time} → {trip.arrival.time}</div>
                        <div className="text-sm text-gray-600">4h de trajet</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{trip.seats} place(s)</div>
                        <div className="text-sm text-gray-600">{trip.vehicle}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-purple-600 mb-2">{trip.price}€</div>
                  <button 
                    onClick={() => setCurrentPage('trip-details')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Voir le trajet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Page de détails d'un trajet
const TripDetailsPage = () => {
  const { setCurrentPage } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setCurrentPage('search-results')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour aux résultats
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Paris → Lyon</h1>
            <p className="text-gray-600">Demain, 14h00</p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Conducteur</h3>
                <div className="flex items-center mb-4">
                  <div className="text-5xl mr-4">👩‍🦰</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Alice Martin</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      4.8 • 15 avis • Membre depuis 2020
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Conductrice expérimentée, j'aime voyager et rencontrer de nouvelles personnes. 
                  Je conduis prudemment et j'apprécie la ponctualité.
                </p>
                <button 
                  onClick={() => setCurrentPage('profile')}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Voir le profil complet
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Détails du trajet</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix par passager</span>
                    <span className="font-semibold">25€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Places disponibles</span>
                    <span className="font-semibold">2 places</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Véhicule</span>
                    <span className="font-semibold">Renault Clio (2020)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confort</span>
                    <span className="font-semibold">Standard</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Préférences</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">🎵 Musique OK</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">🚭 Non-fumeur</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">🐕 Animaux OK</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Itinéraire</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                  <div>
                    <div className="font-medium">Paris - Gare de Lyon</div>
                    <div className="text-sm text-gray-600">14h00</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
                  <div>
                    <div className="font-medium">Lyon - Part-Dieu</div>
                    <div className="text-sm text-gray-600">18h00 (estimé)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setCurrentPage('booking')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                Réserver ce trajet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page de réservation
const BookingPage = () => {
  const { setCurrentPage } = useApp();
  const [bookingForm, setBookingForm] = useState({
    seats: 1,
    pickupPoint: '',
    note: '',
    paymentMethod: 'cash'
  });

  const handleBookingSubmit = () => {
    alert('Réservation confirmée ! Vous allez recevoir un email de confirmation.');
    setCurrentPage('my-bookings');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setCurrentPage('trip-details')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour aux détails
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Réserver ce trajet</h1>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Récapitulatif du trajet</h3>
            <div className="text-sm text-gray-600">
              <p>Paris → Lyon • Demain 14h00</p>
              <p>Conducteur : Alice Martin (4.8★)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de places
              </label>
              <select
                value={bookingForm.seats}
                onChange={(e) => setBookingForm({...bookingForm, seats: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={1}>1 place</option>
                <option value={2}>2 places</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Point de rendez-vous (optionnel)
              </label>
              <input
                type="text"
                value={bookingForm.pickupPoint}
                onChange={(e) => setBookingForm({...bookingForm, pickupPoint: e.target.value})}
                placeholder="Précisez un lieu de rendez-vous"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message au conducteur (optionnel)
              </label>
              <textarea
                value={bookingForm.note}
                onChange={(e) => setBookingForm({...bookingForm, note: e.target.value})}
                placeholder="Présentez-vous ou posez une question..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement
              </label>
              <select
                value={bookingForm.paymentMethod}
                onChange={(e) => setBookingForm({...bookingForm, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte bancaire</option>
                <option value="paypal">PayPal</option>
                <option value="bank_transfer">Virement bancaire</option>
              </select>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total à payer</span>
                <span className="text-2xl font-bold text-purple-600">
                  {25 * bookingForm.seats}€
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {bookingForm.seats} place(s) × 25€
              </p>
            </div>

            <button
              onClick={handleBookingSubmit}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Confirmer la réservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page des réservations
const MyBookingsPage = () => {
  const { setCurrentPage } = useApp();
  
  const mockBookings = [
    {
      id: 1,
      trip: {
        departure: "Paris",
        arrival: "Lyon",
        date: "2024-01-15",
        time: "14:00"
      },
      driver: "Alice Martin",
      status: "confirmed",
      seats: 1,
      price: 25
    },
    {
      id: 2,
      trip: {
        departure: "Lyon",
        arrival: "Marseille",
        date: "2024-01-20",
        time: "10:30"
      },
      driver: "Bob Dupont",
      status: "pending",
      seats: 2,
      price: 40
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes réservations</h1>
        
        <div className="space-y-6">
          {mockBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.trip.departure} → {booking.trip.arrival}
                  </h3>
                  <p className="text-gray-600">
                    {booking.trip.date} à {booking.trip.time}
                  </p>
                  <p className="text-gray-600">
                    Conducteur : {booking.driver}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  {booking.seats} place(s) • {booking.price}€
                </div>
                <div className="space-x-2">
                  <button 
                    onClick={() => setCurrentPage('trip-details')}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Voir le trajet
                  </button>
                  {booking.status === 'confirmed' && (
                    <button 
                      onClick={() => setCurrentPage('chat')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Contacter
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Page du profil
const ProfilePage = () => {
  const { setCurrentPage } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon profil</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-8xl mb-4">👩‍🦰</div>
              <h2 className="text-xl font-semibold text-gray-900">Alice Martin</h2>
              <div className="flex items-center justify-center mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                <span className="text-gray-600">4.8 (15 avis)</span>
              </div>
              <p className="text-gray-600 mt-2">Membre depuis 2020</p>
              <button 
                onClick={() => setCurrentPage('edit-profile')}
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Modifier le profil
              </button>
            </div>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span>alice@charismamove.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Téléphone</span>
                  <span>+33 6 12 34 56 78</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Âge</span>
                  <span>34 ans</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vérification</span>
                  <span className="text-green-600">✓ Profil vérifié</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Préférences de voyage</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">🎵 Musique</span>
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">🚭 Non-fumeur</span>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">🐕 Animaux</span>
                <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">💬 Bavard</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Mes véhicules</h3>
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Renault Clio (2020)</h4>
                    <p className="text-gray-600">4 places • Essence • Climatisation</p>
                  </div>
                  <button 
                    onClick={() => setCurrentPage('edit-vehicle')}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Modifier
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setCurrentPage('add-vehicle')}
                className="mt-4 text-purple-600 hover:text-purple-800 font-medium"
              >
                + Ajouter un véhicule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page à propos
const AboutPage = () => {
  const { setCurrentPage } = useApp();
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour à l'accueil
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">À propos de Charisma'Move</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Charisma'Move révolutionne le covoiturage en France en proposant une plateforme moderne, 
              sécurisée et conviviale. Notre objectif est de rendre les déplacements plus économiques, 
              écologiques et sociaux.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nos valeurs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🌱 Écologie</h3>
                <p className="text-gray-600">Réduire l'empreinte carbone du transport en optimisant l'utilisation des véhicules.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🤝 Convivialité</h3>
                <p className="text-gray-600">Favoriser les rencontres et créer du lien social à travers le voyage partagé.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">💰 Économie</h3>
                <p className="text-gray-600">Permettre à chacun de voyager à moindre coût en partageant les frais.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Sécurité</h3>
                <p className="text-gray-600">Garantir la sécurité et la confiance grâce à la vérification des profils.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">L'équipe</h2>
            <p className="text-gray-600 leading-relaxed">
              Charisma'Move est développé par une équipe passionnée de développeurs, designers et experts 
              en mobilité. Nous mettons notre expertise au service d'une vision : démocratiser le covoiturage 
              et transformer la façon dont nous nous déplaçons.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <a href="mailto:contact@charismamove.com" className="text-purple-600 hover:text-purple-800">
                  contact@charismamove.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <a href="tel:+33123456789" className="text-purple-600 hover:text-purple-800">
                  +33 1 23 45 67 89
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Page comment ça marche
const HowItWorksPage = () => {
  const { setCurrentPage } = useApp();
  
  const steps = [
    {
      number: 1,
      title: "Recherchez votre trajet",
      description: "Indiquez votre ville de départ, destination et date de voyage.",
      icon: <Search className="w-8 h-8" />
    },
    {
      number: 2,
      title: "Choisissez votre conducteur",
      description: "Consultez les profils, avis et préférences des conducteurs.",
      icon: <User className="w-8 h-8" />
    },
    {
      number: 3,
      title: "Réservez votre place",
      description: "Confirmez votre réservation et réglez en ligne ou en espèces.",
      icon: <Calendar className="w-8 h-8" />
    },
    {
      number: 4,
      title: "Voyagez ensemble",
      description: "Retrouvez votre conducteur au point de rendez-vous et partez !",
      icon: <Car className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => setCurrentPage('home')}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Retour à l'accueil
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche ?</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Voyager avec Charisma'Move est simple, rapide et sécurisé. Suivez ces 4 étapes pour votre premier trajet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Prêt à commencer ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Rechercher un trajet
            </button>
            <button 
              onClick={() => setCurrentPage('register')}
              className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 hover:text-white transition-all"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation principale
const Navigation = () => {
  const { currentPage, setCurrentPage, isAuthenticated } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Accueil', icon: <Home className="w-4 h-4" /> },
    { id: 'search-results', label: 'Rechercher', icon: <Search className="w-4 h-4" /> },
    { id: 'how-it-works', label: 'Comment ça marche', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'about', label: 'À propos', icon: <Heart className="w-4 h-4" /> },
  ];

  const userMenuItems = [
    { id: 'profile', label: 'Mon profil', icon: <User className="w-4 h-4" /> },
    { id: 'my-bookings', label: 'Mes réservations', icon: <Calendar className="w-4 h-4" /> },
    { id: 'my-trips', label: 'Mes trajets', icon: <Car className="w-4 h-4" /> },
    { id: 'settings', label: 'Paramètres', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className="flex items-center"
            >
              <Car className="h-8 w-8 text-purple-600 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Charisma'Move
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                    currentPage === item.id
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-900 hover:text-purple-600'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-gray-900 hover:text-purple-600"
                >
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-2">
                    A
                  </div>
                  <span>Alice</span>
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </button>
                    ))}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setCurrentPage('home');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  Se connecter
                </button>
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:text-purple-600"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  {userMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:text-purple-600"
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <button 
                    onClick={() => {
                      setCurrentPage('login');
                      setIsMenuOpen(false);
                    }}
                    className="text-purple-600 hover:text-purple-800 font-medium text-left"
                  >
                    Se connecter
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentPage('register');
                      setIsMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full font-medium"
                  >
                    S'inscrire
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Footer
const Footer = () => {
  const { setCurrentPage } = useApp();
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Car className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Charisma'Move
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              La plateforme de covoiturage qui révolutionne vos déplacements en France. 
              Économique, écologique et convivial.
            </p>
            <div className="flex space-x-4">
              <button className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="sr-only">Facebook</span>
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </button>
              <button className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="sr-only">Twitter</span>
                <div className="w-6 h-6 bg-blue-400 rounded"></div>
              </button>
              <button className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="sr-only">Instagram</span>
                <div className="w-6 h-6 bg-pink-500 rounded"></div>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-purple-400">Entreprise</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setCurrentPage('about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  À propos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('careers')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Carrières
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('press')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Presse
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('blog')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-purple-400">Support</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setCurrentPage('help')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Centre d'aide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('contact')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Nous contacter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('safety')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sécurité
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('community')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Communauté
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Charisma'Move. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

// Composant principal
const CharismaMoveApp = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'search-results':
        return <SearchResultsPage />;
      case 'trip-details':
        return <TripDetailsPage />;
      case 'booking':
        return <BookingPage />;
      case 'my-bookings':
        return <MyBookingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'about':
        return <AboutPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-white">
        <Navigation />
        <main>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
};

// Export avec provider
export default () => (
  <AppProvider>
    <CharismaMoveApp />
  </AppProvider>
);