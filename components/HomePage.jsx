import React, { useState } from 'react';
import {
  Search,
  Car,
  DollarSign,
  Leaf,
  Heart,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import Toast from './Toast';
import { useApp } from './context';

const HomePage = () => {
  const { setCurrentPage } = useApp();
  const [activeTab, setActiveTab] = useState('search');
  const [toast, setToast] = useState(null);
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleSearchSubmit = () => {
    if (!searchForm.departure || !searchForm.arrival || !searchForm.date) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    showToast('Recherche en cours...');
    setTimeout(() => {
      setCurrentPage('search-results');
    }, 1000);
  };

  const handlePublishSubmit = () => {
    if (!publishForm.departure || !publishForm.arrival || !publishForm.datetime || !publishForm.price) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    showToast('Trajet publié avec succès !');
    setTimeout(() => {
      setCurrentPage('my-trips');
    }, 1500);
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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Voyagez avec
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Charisma'Move
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
                    activeTab === 'search' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Search className="inline-block w-5 h-5 mr-2" />
                  Rechercher un trajet
                </button>
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                    activeTab === 'publish' ? 'bg-white text-purple-600 shadow-md' : 'text-gray-600 hover:text-purple-600'
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
                        onChange={(e) => setSearchForm({ ...searchForm, departure: e.target.value })}
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
                        onChange={(e) => setSearchForm({ ...searchForm, arrival: e.target.value })}
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
                        onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre de passagers
                      </label>
                      <select
                        value={searchForm.passengers}
                        onChange={(e) => setSearchForm({ ...searchForm, passengers: parseInt(e.target.value) })}
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
                        onChange={(e) => setPublishForm({ ...publishForm, departure: e.target.value })}
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
                        onChange={(e) => setPublishForm({ ...publishForm, arrival: e.target.value })}
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
                        onChange={(e) => setPublishForm({ ...publishForm, datetime: e.target.value })}
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
                        onChange={(e) => setPublishForm({ ...publishForm, price: e.target.value })}
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
                      onChange={(e) => setPublishForm({ ...publishForm, seats: parseInt(e.target.value) })}
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir Charisma'Move ?</h2>
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

export default HomePage;
