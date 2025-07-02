import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  Calendar, 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Settings, 
  LogOut, 
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// Données simulées pour la démo
const mockStats = {
  overview: {
    totalUsers: 12847,
    activeTrips: 234,
    totalBookings: 5632,
    monthlyRevenue: 45678
  },
  growth: [
    { date: '13/06', users: 120, trips: 45, bookings: 89 },
    { date: '14/06', users: 145, trips: 52, bookings: 102 },
    { date: '15/06', users: 132, trips: 48, bookings: 95 },
    { date: '16/06', users: 167, trips: 61, bookings: 118 },
    { date: '17/06', users: 189, trips: 58, bookings: 134 },
    { date: '18/06', users: 201, trips: 67, bookings: 142 },
    { date: '19/06', users: 234, trips: 72, bookings: 156 }
  ],
  alerts: [
    { id: 1, type: 'warning', message: '12 utilisateurs non vérifiés depuis plus de 7 jours', count: 12 },
    { id: 2, type: 'error', message: '5 réservations en attente depuis plus de 24h', count: 5 },
    { id: 3, type: 'info', message: '3 nouveaux avis négatifs à modérer', count: 3 }
  ]
};

const mockUsers = [
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@email.com', verified: true, trips: 12, rating: 4.8, status: 'active' },
  { id: 2, name: 'Marie Martin', email: 'marie.martin@email.com', verified: false, trips: 3, rating: 4.2, status: 'pending' },
  { id: 3, name: 'Pierre Durand', email: 'pierre.durand@email.com', verified: true, trips: 25, rating: 4.9, status: 'active' },
  { id: 4, name: 'Sophie Bernard', email: 'sophie.bernard@email.com', verified: true, trips: 8, rating: 4.5, status: 'suspended' }
];

const mockTrips = [
  { id: 1, driver: 'Jean Dupont', from: 'Paris', to: 'Lyon', date: '2025-06-20', seats: 3, booked: 2, status: 'active' },
  { id: 2, driver: 'Marie Martin', from: 'Marseille', to: 'Nice', date: '2025-06-21', seats: 4, booked: 4, status: 'full' },
  { id: 3, driver: 'Pierre Durand', from: 'Toulouse', to: 'Bordeaux', date: '2025-06-19', seats: 2, booked: 1, status: 'expired' }
];

const mockReviews = [
  { id: 1, reviewer: 'Marie Martin', reviewed: 'Jean Dupont', rating: 2, comment: 'Retard de 30 minutes sans prévenir', trip: 'Paris → Lyon', date: '2025-06-18' },
  { id: 2, reviewer: 'Sophie Bernard', reviewed: 'Pierre Durand', rating: 5, comment: 'Excellent conducteur, très ponctuel', trip: 'Toulouse → Bordeaux', date: '2025-06-17' },
  { id: 3, reviewer: 'Jean Dupont', reviewed: 'Marie Martin', rating: 1, comment: 'Comportement inapproprié pendant le trajet', trip: 'Marseille → Nice', date: '2025-06-16' }
];

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState({ name: 'Admin', role: 'super_admin' });
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'trips', name: 'Trajets', icon: Car },
    { id: 'bookings', name: 'Réservations', icon: Calendar },
    { id: 'reviews', name: 'Avis', icon: Star },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% vs hier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ alert }) => {
    const iconColor = alert.type === 'error' ? 'text-red-500' : alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500';
    const bgColor = alert.type === 'error' ? 'bg-red-50' : alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';
    
    return (
      <div className={`p-4 rounded-lg ${bgColor} border border-opacity-20`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`h-5 w-5 ${iconColor} mt-0.5`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{alert.message}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-80 text-gray-800 mt-2">
              {alert.count} éléments
            </span>
          </div>
        </div>
      </div>
    );
  };

  const UserRow = ({ user }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="font-medium text-gray-700">{user.name.charAt(0)}</span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user.verified ? 'Vérifié' : 'En attente'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.trips}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.rating}/5</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.status === 'active' ? 'bg-green-100 text-green-800' :
          user.status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {user.status === 'active' ? 'Actif' : user.status === 'suspended' ? 'Suspendu' : 'En attente'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <XCircle className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const TripRow = ({ trip }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{trip.id}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.driver}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.from} → {trip.to}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.booked}/{trip.seats}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          trip.status === 'active' ? 'bg-green-100 text-green-800' :
          trip.status === 'full' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {trip.status === 'active' ? 'Actif' : trip.status === 'full' ? 'Complet' : 'Expiré'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-blue-600 hover:text-blue-900 mr-3">
          <Eye className="h-4 w-4" />
        </button>
        <button className="text-red-600 hover:text-red-900">
          <XCircle className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const ReviewRow = ({ review }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.reviewer}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.reviewed}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          ))}
          <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{review.comment}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.trip}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {review.rating <= 2 && (
          <button className="text-red-600 hover:text-red-900">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme Charisma'Move</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Utilisateurs totaux" 
          value={mockStats.overview.totalUsers.toLocaleString()} 
          change={12} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Trajets actifs" 
          value={mockStats.overview.activeTrips} 
          change={8} 
          icon={Car} 
          color="green" 
        />
        <StatCard 
          title="Réservations" 
          value={mockStats.overview.totalBookings.toLocaleString()} 
          change={-3} 
          icon={Calendar} 
          color="yellow" 
        />
        <StatCard 
          title="Revenus mensuels" 
          value={`${mockStats.overview.monthlyRevenue.toLocaleString()}€`} 
          change={15} 
          icon={TrendingUp} 
          color="purple" 
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance sur 7 jours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockStats.growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" name="Utilisateurs" />
              <Line type="monotone" dataKey="trips" stroke="#10B981" name="Trajets" />
              <Line type="monotone" dataKey="bookings" stroke="#F59E0B" name="Réservations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des trajets</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={[
                  { name: 'Actifs', value: 45, fill: '#10B981' },
                  { name: 'Complets', value: 30, fill: '#3B82F6' },
                  { name: 'Expirés', value: 20, fill: '#6B7280' },
                  { name: 'Annulés', value: 5, fill: '#EF4444' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Alertes de modération</h3>
          <Bell className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {mockStats.alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérer et modérer les utilisateurs de la plateforme</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vérification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockUsers.map(user => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des trajets</h1>
        <p className="text-gray-600">Superviser et gérer tous les trajets de la plateforme</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conducteur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTrips.map(trip => (
              <TripRow key={trip.id} trip={trip} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modération des avis</h1>
        <p className="text-gray-600">Gérer et modérer les avis utilisateurs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évaluateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évalué</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trajet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockReviews.map(review => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'trips': return renderTrips();
      case 'reviews': return renderReviews();
      default: 
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Section en cours de développement</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">Charisma'Move</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  currentView === item.id ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-gray-600" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;