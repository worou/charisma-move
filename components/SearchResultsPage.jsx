import React, { memo } from 'react';
import { ArrowRight, Star, MapPin, Clock, Users } from 'lucide-react';
import { useApp } from './context.jsx';

const MOCK_TRIPS = [
  {
    id: 1,
    driver: { name: "Alice Martin", rating: 4.8, reviews: 15, photo: "👩‍🦰" },
    departure: { city: "Paris", address: "Gare de Lyon", time: "14:00" },
    arrival: { city: "Lyon", address: "Part-Dieu", time: "18:00" },
    seats: 2,
    vehicle: "Renault Clio (2020)",
    instant: true
  },
  {
    id: 2,
    driver: { name: "Bob Dupont", rating: 4.5, reviews: 8, photo: "👨‍💼" },
    departure: { city: "Paris", address: "Porte de Versailles", time: "15:30" },
    arrival: { city: "Lyon", address: "Perrache", time: "19:30" },
    seats: 3,
    vehicle: "Peugeot 308 (2019)",
    instant: false
  }
];

const SearchResultsPage = () => {
  const { setCurrentPage, searchParams } = useApp();

  const filteredTrips = React.useMemo(() => {
    if (!searchParams) return MOCK_TRIPS;
    const depart = searchParams.depart.toLowerCase();
    const destination = searchParams.destination.toLowerCase();
    const passengers = searchParams.passengers || 1;
    return MOCK_TRIPS.filter((t) =>
      t.departure.city.toLowerCase().includes(depart) &&
      t.arrival.city.toLowerCase().includes(destination) &&
      t.seats >= passengers
    ).sort((a, b) => b.driver.rating - a.driver.rating);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => setCurrentPage('home')} className="flex items-center text-purple-600 hover:text-purple-800 mb-4">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Retour à la recherche
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trajets disponibles</h1>
          {searchParams ? (
            <p className="text-gray-600">
              {searchParams.depart} → {searchParams.destination} • {filteredTrips.length} trajet(s) trouvé(s)
            </p>
          ) : (
            <p className="text-gray-600">{filteredTrips.length} trajet(s) trouvé(s)</p>
          )}
        </div>

        <div className="space-y-6">
          {filteredTrips.map((trip) => (
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
                  <div className="text-2xl font-bold text-purple-600 mb-2">Gratuit</div>
                  <button onClick={() => setCurrentPage('booking')} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Réserver
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

export default memo(SearchResultsPage);
