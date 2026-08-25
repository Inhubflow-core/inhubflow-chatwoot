import { ref, watch } from 'vue';

const STORAGE_KEY = 'inhubflow_lead_hub_lists';

const defaultLists = [
  {
    id: 'list_gmaps_1',
    name: '📍 Dentistas em Vila Velha, ES',
    source: 'gmaps',
    sourceLabel: 'Google Maps',
    count: 20,
    createdAt: '25/08/2026 14:45',
    lastDispatchedAt: null,
    status: 'pending',
    leads: [
      { name: 'OdontoCompany Vila Velha', phone: '+55 27 99881-2233', clean_phone: '5527998812233', address: 'Praia da Costa, Vila Velha', rating: '4.9 ⭐', website: 'https://www.odontocompany.com.br' },
      { name: 'Sorridents Glória', phone: '+55 27 99774-5511', clean_phone: '5527997745511', address: 'Glória, Vila Velha', rating: '4.8 ⭐', website: 'https://www.sorridents.com.br' },
      { name: 'Clínica Oral Sin Implantes', phone: '+55 27 99661-8844', clean_phone: '5527996618844', address: 'Itapuã, Vila Velha', rating: '4.9 ⭐', website: 'https://www.oralsin.com.br' }
    ]
  },
  {
    id: 'list_wa_1',
    name: '👥 Grupo Red Odontólogos & Clínicas ES',
    source: 'whatsapp',
    sourceLabel: 'Grupos WhatsApp',
    count: 5,
    createdAt: '25/08/2026 13:30',
    lastDispatchedAt: '25/08/2026 14:10',
    status: 'sent',
    leads: [
      { name: 'Dr. Roberto Silva (Especialista)', phone: '+55 27 99664-6306', clean_phone: '5527996646306', role: 'admin' },
      { name: 'Dra. Mariana Castro', phone: '+55 27 99881-2233', clean_phone: '5527998812233', role: 'member' }
    ]
  }
];

// Load from localStorage or use defaults
let initialLists = defaultLists;
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    initialLists = JSON.parse(stored);
  }
} catch (e) {
  console.log('Lead hub storage notice:', e);
}

const savedLists = ref(initialLists);

// Persist changes
watch(savedLists, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
  } catch (e) {
    console.error('Failed to save lead lists to localStorage:', e);
  }
}, { deep: true });

export function useLeadHub() {
  const saveNewList = (name, source, sourceLabel, leads) => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newList = {
      id: `list_${Date.now()}`,
      name: name,
      source: source,
      sourceLabel: sourceLabel,
      count: leads.length,
      createdAt: dateStr,
      lastDispatchedAt: null,
      status: 'pending',
      leads: [...leads]
    };

    savedLists.value.unshift(newList);
    return newList;
  };

  const deleteList = (listId) => {
    savedLists.value = savedLists.value.filter(l => l.id !== listId);
  };

  const markListDispatched = (listId) => {
    const target = savedLists.value.find(l => l.id === listId);
    if (target) {
      const now = new Date();
      target.lastDispatchedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      target.status = 'sent';
    }
  };

  return {
    savedLists,
    saveNewList,
    deleteList,
    markListDispatched
  };
}
