// Lieux de culte Charisma pré-configurés.
// Ajouter/modifier ici pour enrichir la liste proposée au formulaire de publication.
// `label` : nom affiché à l'utilisateur
// `address` : valeur sauvegardée en BDD dans announcements.destination (déclenche le géocodage serveur si besoin)
export const WORSHIP_PLACES = [
  {
    id: 'paris-principal',
    label: 'Église Charisma — Paris (culte principal)',
    address: 'Église Charisma, Paris',
  },
  {
    id: 'annexe-banlieue',
    label: 'Annexe Charisma — Île-de-France',
    address: 'Annexe Charisma, Île-de-France',
  },
  {
    id: 'autre',
    label: 'Autre lieu (saisie libre)',
    address: '',
  },
];

// Services récurrents : preset d'horaires pour éviter une saisie libre
export const SERVICE_PRESETS = [
  { id: 'dim-matin', label: 'Dimanche matin — 10:00', time: '10:00' },
  { id: 'dim-soir', label: 'Dimanche soir — 18:00', time: '18:00' },
  { id: 'autre', label: 'Autre horaire', time: '' },
];

// Retourne la date (YYYY-MM-DD) du prochain dimanche (ou aujourd'hui si on est dimanche avant le service)
export function nextSunday(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = dimanche
  const offset = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}
