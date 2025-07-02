import React, { useEffect, useState, memo } from 'react';
import { Search, Plus, Loader2, AlertCircle } from 'lucide-react';

function DataList() {
  const [items, setItems] = useState([]);
  const [value, setValue] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = `/api/items${search ? `?q=${encodeURIComponent(search)}` : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [search]);

  const handleAdd = async () => {
    if (!value.trim()) return;
    
    try {
      setIsAdding(true);
      setError(null);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout');
      }
      
      const item = await response.json();
      setItems(prev => [...prev, item]);
      setValue('');
    } catch (err) {
      setError(err.message);
      console.error('Erreur:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Liste des éléments</h2>
      
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement...</span>
        </div>
      )}

      {/* Items List */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow-sm border">
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? 'Aucun résultat trouvé' : 'Aucun élément disponible'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map(item => (
                <li key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <span className="text-gray-900">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Add Form */}
      <div className="mt-6 flex space-x-2">
        <input
          type="text"
          placeholder="Nouvel élément..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={isAdding || !value.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Ajouter</span>
        </button>
      </div>
    </div>
  );
}

export default memo(DataList);
