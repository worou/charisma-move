import React, { useState } from 'react';
import {
  DollarSign,
  Leaf,
  Heart,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react';
import Toast from './Toast';
import { useApp } from './context.jsx';

const FEATURES = [
  {
    icon: <DollarSign className="w-8 h-8" />,
    title: 'Économique',
    description: "Partagez les frais de route et voyagez jusqu'à 3x moins cher qu'en train ou en avion."
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: 'Écologique',
    description: "Réduisez votre empreinte carbone en partageant votre véhicule avec d'autres voyageurs."
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Sécurisé',
    description: 'Profils vérifiés, avis des membres et assistance 24h/7j pour voyager en toute sérénité.'
  },
  {
    icon: <Smartphone className="w-8 h-8" />,
    title: 'Simple',
    description: 'Réservez en quelques clics sur notre site ou notre application mobile.'
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Partout',
    description: 'Service disponible dans toute la France avec des millions de trajets quotidiens.'
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Convivial',
    description: 'Rencontrez de nouvelles personnes et créez des liens lors de vos voyages.'
  }
];

const STATS = [
  { number: '50K+', label: 'Membres actifs' },
  { number: '500+', label: 'Villes desservies' },
  { number: '10K', label: 'Trajets par mois' },
  { number: '4.9★', label: 'Satisfaction client' }
];

export default function HomePage() {
  const { setCurrentPage } = useApp();
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    depart: '',
    destination: '',
    date: '',
    passengers: '1 passager'
  });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleSearch = () => {
    if (!form.depart || !form.destination || !form.date) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }
    showToast('Recherche en cours...');
    setTimeout(() => setCurrentPage('search-results'), 1000);
  };

  const handlePublish = () => {
    setCurrentPage('publish');
  };

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Hero */}
      <section className="text-center text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Voyagez avec Charisma'Move</h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto">
          La plateforme de covoiturage nouvelle génération qui allie économie, écologie et convivialité
        </p>
      </section>

      {/* Search Form */}
      <section className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl -mt-12 mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ville de départ</label>
            <input
              type="text"
              value={form.depart}
              onChange={(e) => setForm({ ...form, depart: e.target.value })}
              placeholder="Paris, Gare de Lyon..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              placeholder="Lyon, Part-Dieu..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de départ</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de passagers</label>
            <select
              value={form.passengers}
              onChange={(e) => setForm({ ...form, passengers: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
            >
              <option>1 passager</option>
              <option>2 passagers</option>
              <option>3 passagers</option>
              <option>4+ passagers</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={handleSearch}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors"
          >
            Rechercher des trajets
          </button>
          <button
            onClick={handlePublish}
            className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors"
          >
            Publier un trajet
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pourquoi choisir Charisma'Move ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience de covoiturage réinventée pour répondre à tous vos besoins de mobilité
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 text-center cursor-pointer" onClick={() => setCurrentPage('features')}>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat, index) => (
              <div key={index} className="transform hover:scale-105 transition-transform cursor-pointer" onClick={() => setCurrentPage('about')}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
