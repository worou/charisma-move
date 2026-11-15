import React, { useCallback, useEffect, useState } from 'react';
import { Shield, Mail, ExternalLink, Server, Save, RotateCcw } from 'lucide-react';
import { useAdmin } from './AdminContext.jsx';

// Champs du .env modifiables. Un champ secret n'affiche jamais sa valeur.
const SourceBadge = ({ source }) => {
  const map = {
    base: ['Enregistré', 'bg-purple-100 text-purple-700'],
    '.env': ['Depuis .env', 'bg-gray-100 text-gray-600'],
    vide: ['Vide', 'bg-amber-100 text-amber-700'],
  };
  const [label, cls] = map[source] || map.vide;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

const ConfigCard = () => {
  const { token, logout } = useAdmin();
  const [groups, setGroups] = useState(null);
  // drafts : clé -> texte saisi ; null = réinitialiser (revenir au .env)
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => { setGroups(data); setDrafts({}); })
      .catch(status => {
        if (status === 401 || status === 403) logout();
        else setError('Impossible de charger les réglages');
      });
  }, [token, logout]);

  useEffect(() => { load(); }, [load]);

  const setDraft = (key, value) => setDrafts(d => ({ ...d, [key]: value }));

  const save = async () => {
    // Un champ secret laissé vide reste inchangé ; les autres vides reviennent au .env
    const payload = {};
    for (const [key, value] of Object.entries(drafts)) {
      const field = groups?.flatMap(g => g.items).find(f => f.key === key);
      if (field?.secret && value === '') continue;
      payload[key] = value;
    }
    if (Object.keys(payload).length === 0) {
      setMessage({ type: 'info', text: 'Aucune modification à enregistrer.' });
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });
      if (res.status === 401 || res.status === 403) return logout();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Enregistrement impossible');
        return;
      }
      setMessage({
        type: 'ok',
        text: 'Réglages enregistrés. Redémarrez le serveur backend pour les appliquer.',
      });
      load();
    } catch {
      setError('Enregistrement impossible : le serveur ne répond pas');
    } finally {
      setSaving(false);
    }
  };

  const dirtyCount = Object.keys(drafts).length;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="text-base font-semibold text-gray-800">Configuration de l'application</h2>
        <button
          onClick={save}
          disabled={saving || dirtyCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Enregistrement…' : `Enregistrer${dirtyCount ? ` (${dirtyCount})` : ''}`}
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Les valeurs saisies remplacent celles du fichier <code>.env</code>. Les accès à la base de données restent dans le <code>.env</code>.
      </p>

      {message && (
        <div className={`text-sm p-3 rounded-lg mb-4 ${message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
          {message.text}
        </div>
      )}
      {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {!groups ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <section key={group.group}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">{group.group}</h3>
              <div className="space-y-4">
                {group.items.map(f => {
                  const draft = drafts[f.key];
                  const isDirty = f.key in drafts;
                  const shown = isDirty ? (draft ?? '') : (f.value ?? '');
                  return (
                    <div key={f.key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-start">
                      <div>
                        <label htmlFor={f.key} className="text-sm font-medium text-gray-800">{f.label}</label>
                        <div className="text-xs text-gray-400 font-mono">{f.key}</div>
                        <div className="mt-1"><SourceBadge source={f.source} /></div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex gap-2">
                          <input
                            id={f.key}
                            type={f.secret ? 'password' : 'text'}
                            autoComplete="off"
                            value={shown}
                            placeholder={f.secret && f.has_value ? '•••••••• (laisser vide pour ne pas changer)' : ''}
                            onChange={e => setDraft(f.key, e.target.value)}
                            className={`flex-1 min-w-0 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDirty ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                          />
                          {f.source === 'base' && (
                            <button
                              type="button"
                              title="Revenir à la valeur du .env"
                              onClick={() => setDraft(f.key, null)}
                              className="px-2.5 border rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {f.help && <p className="text-xs text-gray-400 mt-1">{f.help}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminSettings = () => {
  const { adminUser } = useAdmin();

  return (
    <div className="space-y-6 max-w-3xl">
      <ConfigCard />

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Compte administrateur</h2>
        <dl className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-purple-500 flex-shrink-0" />
            <dt className="text-gray-500 w-24">Rôle</dt>
            <dd className="font-medium text-gray-900">Administrateur</dd>
          </div>
          {adminUser && (
            <>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <dt className="text-gray-500 w-24">Email</dt>
                <dd className="font-medium text-gray-900">{adminUser.email}</dd>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <dt className="text-gray-500 w-24">Nom</dt>
                <dd className="font-medium text-gray-900">{adminUser.name}</dd>
              </div>
            </>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Server className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <dt className="text-gray-500 w-24">API</dt>
            <dd className="font-medium text-gray-900">http://localhost:3001</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Documentation API</h2>
        <p className="text-sm text-gray-600 mb-4">
          Consultez la documentation Swagger pour explorer et tester tous les endpoints de l'API.
        </p>
        <a
          href="http://localhost:3001/api-docs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir Swagger UI
        </a>
      </div>
    </div>
  );
};

export default AdminSettings;
