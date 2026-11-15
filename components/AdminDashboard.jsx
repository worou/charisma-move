import React, { useEffect, useState } from 'react';
import { Users, Car, Calendar, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAdmin } from './AdminContext.jsx';

const StatCard = ({ title, value, icon: Icon, bg }) => (
  <div className="bg-white rounded-xl border shadow-sm p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value != null ? Number(value).toLocaleString('fr-FR') : '—'}
      </p>
    </div>
    <div className={`p-3 rounded-lg ${bg}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

// Date locale au format AAAA-MM-JJ (comparable aux dates de service)
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Statut d'une réservation de bus : validée à la montée, à venir, ou non utilisée
const bookingStatus = (b, today) => {
  if (b.validated_at) return { label: 'Validé', cls: 'bg-green-100 text-green-700' };
  if (b.service_date < today) return { label: 'Non utilisé', cls: 'bg-gray-200 text-gray-700' };
  return { label: 'À venir', cls: 'bg-blue-100 text-blue-700' };
};

const formatTimeUTC = (ts) => {
  // MySQL renvoie « AAAA-MM-JJ HH:MM:SS » en UTC (fuseau Z configuré côté serveur)
  const d = new Date(String(ts).replace(' ', 'T') + 'Z');
  return isNaN(d) ? '' : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const BusBookingsTable = ({ bookings, today }) => {
  const counts = bookings.reduce((acc, b) => {
    const s = bookingStatus(b, today).label;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const summary = [
    ['Validé', 'bg-green-100 text-green-700'],
    ['À venir', 'bg-blue-100 text-blue-700'],
    ['Non utilisé', 'bg-gray-200 text-gray-700'],
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-800">Réservations de bus</h2>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {summary.map(([label, cls]) => (
            <span key={label} className={`px-2.5 py-1 rounded-full ${cls}`}>
              {label} : {counts[label] || 0}
            </span>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">Aucune réservation de bus pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4 font-medium">Date du service</th>
                <th className="py-2 pr-4 font-medium">Ligne</th>
                <th className="py-2 pr-4 font-medium">Voyageur</th>
                <th className="py-2 pr-4 font-medium">Places</th>
                <th className="py-2 pr-4 font-medium">Réservé le</th>
                <th className="py-2 pr-4 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const st = bookingStatus(b, today);
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 whitespace-nowrap">{b.service_date}</td>
                    <td className="py-2 pr-4">{b.line_name}</td>
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900">{b.user_first_name || b.user_name}</div>
                      <div className="text-xs text-gray-500">{b.user_email}</div>
                    </td>
                    <td className="py-2 pr-4">{b.seats}</td>
                    <td className="py-2 pr-4 whitespace-nowrap text-gray-500">
                      {String(b.created_at).slice(0, 10)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                      {b.validated_at && (
                        <span className="ml-2 text-xs text-gray-500">à {formatTimeUTC(b.validated_at)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { token, logout } = useAdmin();
  const [stats, setStats] = useState(null);
  const [busBookings, setBusBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/admin/stats', { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setStats)
      // jeton expiré en cours de session : reconnexion plutôt qu'un message
      // d'erreur dont on ne peut pas sortir
      .catch(status => {
        if (status === 401 || status === 403) logout();
        else setError('Impossible de charger les statistiques');
      });
    fetch('/api/admin/bus-bookings', { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setBusBookings)
      .catch(status => {
        if (status === 401 || status === 403) logout();
        else setError('Impossible de charger les réservations de bus');
      });
  }, [token]);

  const chartData = stats
    ? [
        { name: 'Utilisateurs',    value: stats.total_users   },
        { name: 'Trajets publiés', value: stats.total_trips   },
        { name: 'Réservations',    value: stats.total_bookings },
        { name: 'Trajets actifs',  value: stats.active_trips  },
      ]
    : [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Utilisateurs"   value={stats?.total_users}    icon={Users}    bg="bg-blue-500"   />
        <StatCard title="Trajets publiés" value={stats?.total_trips}   icon={Car}      bg="bg-green-500"  />
        <StatCard title="Réservations"   value={stats?.total_bookings} icon={Calendar} bg="bg-yellow-500" />
        <StatCard title="Trajets actifs" value={stats?.active_trips}   icon={Activity} bg="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Vue d'ensemble</h2>
        {stats ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={v => v.toLocaleString('fr-FR')} />
              <Bar dataKey="value" name="Total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Chargement des données…
          </div>
        )}
      </div>

      <BusBookingsTable bookings={busBookings} today={todayLocal()} />
    </div>
  );
};

export default AdminDashboard;
