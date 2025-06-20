import React from 'react';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { useApp } from './context';
import DataList from './DataList';

const AboutPage = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => setCurrentPage('home')} className="flex items-center text-purple-600 hover:text-purple-800 mb-6">
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-purple-600">contact@charismamove.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-purple-600">+33 1 23 45 67 89</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Données</h2>
            <DataList />
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
