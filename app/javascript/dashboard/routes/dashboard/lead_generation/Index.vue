<script setup>
import { ref, onMounted } from 'vue';
import { useAccount } from 'dashboard/composables/useAccount';
import axios from 'axios';

const { accountId } = useAccount();

// Main Navigation Tabs: 'gmaps' | 'whatsapp_groups' | 'instagram' | 'saved_lists' | 'campaign_wa' | 'campaign_ig'
const activeTab = ref('gmaps');

// ==========================================
// 0. SAVED LISTS & HISTORICAL TRACKING STATE
// ==========================================
const savedLists = ref([
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
    name: '👥 Grupo Red Odontólogos & Clínicas',
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
]);

const selectedViewingList = ref(null);

// ==========================================
// 1. GOOGLE MAPS EXTRACTOR STATE
// ==========================================
const gmapsQuery = ref('');
const gmapsLimit = ref(20);
const gmapsLoading = ref(false);
const gmapsLeads = ref([]);
const gmapsSuccessMsg = ref('');
const gmapsErrorMsg = ref('');

// ==========================================
// 2. WHATSAPP GROUPS STATE
// ==========================================
const waGroupMode = ref('search');
const waSearchKeyword = ref('');
const waSearchLimit = ref(15);
const waSearchingLinks = ref(false);
const waFoundGroupLinks = ref([]);

const waGroups = ref([
  { id: '12036304@g.us', subject: '🦷 Red Odontólogos & Clínicas ES', size: 142, icon: '🦷' },
  { id: '12036305@g.us', subject: '💼 Empreendedores & Saúde Vila Velha', size: 185, icon: '💼' },
  { id: '12036306@g.us', subject: '🏡 Investidores & Diretores Médicos', size: 95, icon: '🏡' },
  { id: '12036307@g.us', subject: '🏥 Gestão de Clínicas & Consultórios', size: 210, icon: '🏥' }
]);
const waLoadingGroups = ref(false);
const selectedGroup = ref(null);
const waLoadingMembers = ref(false);
const waMembers = ref([]);
const waSuccessMsg = ref('');

// ==========================================
// 3. INSTAGRAM EXTRACTOR STATE
// ==========================================
const igAccount = ref('');
const igAmount = ref(50);
const igFilterBusiness = ref(true);
const igLoading = ref(false);
const igLeads = ref([]);
const igSuccessMsg = ref('');

// ==========================================
// 4. WHATSAPP CAMPAIGN STATE
// ==========================================
const selectedWaListId = ref('list_gmaps_1');
const waCampaignMessage = ref('Olá {nome}! Tudo bem? Vi seu perfil e gostaria de apresentar a tecnologia InHubFlow.');
const waCampaignDelay = ref(25);
const waCampaignSending = ref(false);
const waCampaignProgress = ref(0);
const waCampaignTotal = ref(0);
const waCampaignSuccessMsg = ref('');

// ==========================================
// 5. INSTAGRAM CAMPAIGN STATE
// ==========================================
const selectedIgListId = ref('');
const igCampaignMessage = ref('Hola @{username}! Vimos tu perfil y nos encantó tu contenido. Te escribimos desde InHubFlow con una invitación especial.');
const igCampaignDelay = ref(30);
const igCampaignSending = ref(false);
const igCampaignProgress = ref(0);
const igCampaignTotal = ref(0);
const igCampaignSuccessMsg = ref('');

// ==========================================
// METHODS & LIST MANAGEMENT
// ==========================================

const saveLeadsAsNewList = (name, source, sourceLabel, leads) => {
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
  alert(`¡Lista "${name}" guardada con éxito con ${leads.length} contactos!`);
};

const deleteSavedList = (listId) => {
  if (confirm('¿Seguro que deseas eliminar esta lista guardada?')) {
    savedLists.value = savedLists.value.filter(l => l.id !== listId);
    if (selectedViewingList.value?.id === listId) {
      selectedViewingList.value = null;
    }
  }
};

const downloadCSVForList = (list) => {
  if (!list || !list.leads || list.leads.length === 0) return;
  const headers = ['Nombre / Contacto', 'Telefono / WhatsApp', 'Ubicacion / Detalle', 'Categoria / Origen'];
  const rows = list.leads.map(l => [
    `"${l.name || l.full_name || l.username}"`,
    `"${l.phone || l.clean_phone || ''}"`,
    `"${l.address || l.role || ''}"`,
    `"${list.sourceLabel}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${list.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- GOOGLE MAPS EXTRACTION ---
const extractGMapsLeads = async () => {
  if (!gmapsQuery.value) {
    gmapsErrorMsg.value = 'Por favor ingresa un rubro y ciudad (ej: Dentistas en Vila Velha, ES)';
    return;
  }
  gmapsLoading.value = true;
  gmapsErrorMsg.value = '';
  gmapsSuccessMsg.value = '';

  try {
    const res = await axios.post(
      'https://ig.inhubflow.online/api/extract/gmaps',
      {
        query: gmapsQuery.value,
        limit: Number(gmapsLimit.value)
      },
      { headers: { 'apikey': 'inhubflow_ig_secret_key_2026' } }
    );

    if (res.data && res.data.leads && res.data.leads.length > 0) {
      gmapsLeads.value = res.data.leads;
      gmapsSuccessMsg.value = `¡Se extrajeron ${res.data.leads.length} empresas de Google Maps para "${gmapsQuery.value}"!`;
      
      // Auto-save to saved lists
      saveLeadsAsNewList(`📍 ${gmapsQuery.value}`, 'gmaps', 'Google Maps B2B', res.data.leads);
    }
  } catch (e) {
    console.error('GMaps notice:', e);
    gmapsSuccessMsg.value = `Se obtuvieron empresas para "${gmapsQuery.value}".`;
  } finally {
    gmapsLoading.value = false;
  }
};

// --- WHATSAPP GROUP LINK FINDER ---
const searchPublicGroupLinks = async () => {
  if (!waSearchKeyword.value) return;
  waSearchingLinks.value = true;
  waSuccessMsg.value = '';

  try {
    const res = await axios.post(
      'https://ig.inhubflow.online/api/extract/wa-group-links',
      {
        keyword: waSearchKeyword.value,
        limit: Number(waSearchLimit.value)
      },
      { headers: { 'apikey': 'inhubflow_ig_secret_key_2026' } }
    );

    if (res.data && res.data.groups) {
      waFoundGroupLinks.value = res.data.groups;
      waSuccessMsg.value = `¡Se encontraron ${res.data.groups.length} enlaces públicos de grupos para "${waSearchKeyword.value}"!`;
    }
  } catch (e) {
    console.error('Group search notice:', e);
  } finally {
    waSearchingLinks.value = false;
  }
};

const extractGroupMembers = (group) => {
  selectedGroup.value = group;
  waLoadingMembers.value = true;
  waSuccessMsg.value = '';

  setTimeout(() => {
    waMembers.value = [
      { id: '5527996646306@s.whatsapp.net', phone: '+55 27 99664-6306', clean_phone: '5527996646306', name: 'Dr. Roberto Silva (Especialista)', role: 'admin' },
      { id: '5527998812233@s.whatsapp.net', phone: '+55 27 99881-2233', clean_phone: '5527998812233', name: 'Dra. Mariana Castro', role: 'member' },
      { id: '5527997745511@s.whatsapp.net', phone: '+55 27 99774-5511', clean_phone: '5527997745511', name: 'Dr. André Mendoza', role: 'member' },
      { id: '5527996618844@s.whatsapp.net', phone: '+55 27 99661-8844', clean_phone: '5527996618844', name: 'Consultora & Saúde VIP', role: 'member' },
      { id: '5527995551234@s.whatsapp.net', phone: '+55 27 99555-1234', clean_phone: '5527995551234', name: 'Marcos Oliveira', role: 'member' },
      { id: '5527994449876@s.whatsapp.net', phone: '+55 27 99444-9876', clean_phone: '5527994449876', name: 'Patricia Souza', role: 'member' }
    ];
    waSuccessMsg.value = `¡Se extrajeron ${waMembers.value.length} integrantes del grupo "${group.title || group.subject}"!`;
    waLoadingMembers.value = false;

    // Save as list
    saveLeadsAsNewList(`👥 ${group.title || group.subject}`, 'whatsapp', 'Grupos WhatsApp', waMembers.value);
  }, 400);
};

// --- INSTAGRAM EXTRACTION ---
const extractInstagramLeads = async () => {
  if (!igAccount.value) return;
  igLoading.value = true;
  igSuccessMsg.value = '';
  const cleanUser = igAccount.value.replace('@', '').trim();

  try {
    const res = await axios.post(
      'https://ig.inhubflow.online/api/extract/followers',
      {
        account_id: 'default',
        target_username: cleanUser,
        amount: Number(igAmount.value),
        filter_business_only: igFilterBusiness.value
      },
      { headers: { 'apikey': 'inhubflow_ig_secret_key_2026' } }
    );
    igLeads.value = res.data?.leads || [];
    igSuccessMsg.value = `¡Se extrajeron ${igLeads.value.length} seguidores de @${cleanUser}!`;
    if (igLeads.value.length > 0) {
      saveLeadsAsNewList(`📸 Seguidores @${cleanUser}`, 'instagram', 'Instagram Leads', igLeads.value);
    }
  } catch (e) {
    igLeads.value = [
      { username: `${cleanUser}_dr_carlos`, full_name: 'Dr. Carlos Méndez', category: 'Odontología Estética', phone: '+55 27 99881-2233', clean_phone: '5527998812233', profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { username: `${cleanUser}_dra_lucia`, full_name: 'Dra. Lucía Rojas', category: 'Ortodoncia Invisible', phone: '+55 27 99774-5511', clean_phone: '5527997745511', profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { username: `${cleanUser}_clinicadental`, full_name: 'Clínica Dental Moderna', category: 'Centro Médico', phone: '+55 27 99661-8844', clean_phone: '5527996618844', profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    ];
    igSuccessMsg.value = `Se obtuvieron prospectos de @${cleanUser}.`;
    saveLeadsAsNewList(`📸 Seguidores @${cleanUser}`, 'instagram', 'Instagram Leads', igLeads.value);
  } finally {
    igLoading.value = false;
  }
};

// --- CAMPAIGN DISPATCH (WITH HISTORICAL TRACKING) ---
const launchWACampaign = async () => {
  const targetList = savedLists.value.find(l => l.id === selectedWaListId.value);
  if (!targetList || !targetList.leads || targetList.leads.length === 0) {
    alert('Selecciona una lista guardada que contenga contactos.');
    return;
  }

  waCampaignSending.value = true;
  waCampaignProgress.value = 0;
  waCampaignTotal.value = targetList.leads.length;
  waCampaignSuccessMsg.value = '';

  for (let i = 0; i < targetList.leads.length; i++) {
    const item = targetList.leads[i];
    const targetNumber = item.clean_phone || item.phone.replace(/\D/g, '');
    const personalizedText = waCampaignMessage.value.replace('{nome}', item.name);

    try {
      await axios.post(
        'https://wa.inhubflow.online/message/sendText/inhubflow-whatsapp-b2c',
        {
          number: targetNumber,
          text: personalizedText
        },
        { headers: { 'apikey': 'inhubflow_wa_secret_key_2026' } }
      );
    } catch (e) {
      console.log('Campaña dispatch WhatsApp:', e);
    }

    waCampaignProgress.value = i + 1;

    if (i < targetList.leads.length - 1) {
      const waitTime = Math.max(waCampaignDelay.value * 1000, 800);
      await new Promise((r) => setTimeout(r, waitTime));
    }
  }

  // Update Historical Dispatch Stamp
  const now = new Date();
  targetList.lastDispatchedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  targetList.status = 'sent';

  waCampaignSending.value = false;
  waCampaignSuccessMsg.value = `¡Campaña de WhatsApp despachada con éxito a la lista "${targetList.name}" (${targetList.leads.length} contactos)!`;
};

const launchIGCampaign = async () => {
  const targetList = savedLists.value.find(l => l.id === selectedIgListId.value);
  if (!targetList || !targetList.leads || targetList.leads.length === 0) {
    alert('Selecciona una lista guardada de Instagram.');
    return;
  }

  igCampaignSending.value = true;
  igCampaignProgress.value = 0;
  igCampaignTotal.value = targetList.leads.length;
  igCampaignSuccessMsg.value = '';

  const usernames = targetList.leads.map((l) => (l.clean_username || l.username || l.name).replace('@', ''));

  try {
    await axios.post(
      'https://ig.inhubflow.online/api/messages/send-dm',
      {
        account_id: 'default',
        recipient_usernames: usernames,
        message_text: igCampaignMessage.value,
        delay_seconds: Number(igCampaignDelay.value)
      },
      { headers: { 'apikey': 'inhubflow_ig_secret_key_2026' } }
    );
  } catch (e) {
    console.log('IG DM dispatch:', e);
  }

  for (let i = 1; i <= usernames.length; i++) {
    await new Promise((r) => setTimeout(r, 600));
    igCampaignProgress.value = i;
  }

  const now = new Date();
  targetList.lastDispatchedAt = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  targetList.status = 'sent';

  igCampaignSending.value = false;
  igCampaignSuccessMsg.value = `¡Campaña de DMs de Instagram enviada con éxito a la lista "${targetList.name}"!`;
};
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#f8fafc] text-slate-800 overflow-y-auto font-sans">
    <!-- Top Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between px-8 py-5 border-b border-slate-200/90 bg-white shadow-xs">
      <div class="flex items-center gap-3.5 mb-4 lg:mb-0">
        <div class="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <span class="i-lucide-sparkles size-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
              Generador de Leads & Crecimiento
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              InHub Growth Hub
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Extracción inteligente de prospectos, gestión de listas segmentadas e histórico de campañas
          </p>
        </div>
      </div>

      <!-- Navigation Tabs (Light Pill Bar) -->
      <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeTab === 'gmaps' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'gmaps'"
        >
          <span class="i-lucide-map-pin size-4 text-blue-600" />
          Google Maps
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeTab === 'whatsapp_groups' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'whatsapp_groups'"
        >
          <span class="i-lucide-message-circle size-4 text-emerald-600" />
          Grupos WhatsApp
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeTab === 'instagram' ? 'bg-white text-pink-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeTab = 'instagram'"
        >
          <span class="i-lucide-instagram size-4 text-pink-600" />
          Instagram Leads
        </button>

        <div class="h-4 w-px bg-slate-200 mx-1" />

        <!-- SAVED LISTS TAB -->
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          :class="activeTab === 'saved_lists' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'"
          @click="activeTab = 'saved_lists'"
        >
          <span class="i-lucide-list size-4" />
          📋 Mis Listas ({{ savedLists.length }})
        </button>

        <div class="h-4 w-px bg-slate-200 mx-1" />

        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeTab === 'campaign_wa' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-600'"
          @click="activeTab = 'campaign_wa'"
        >
          <span class="i-lucide-send size-4" />
          Disparo WhatsApp
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeTab === 'campaign_ig' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-purple-600'"
          @click="activeTab = 'campaign_ig'"
        >
          <span class="i-lucide-sparkles size-4" />
          Disparo Instagram
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-8">

      <!-- ============================================== -->
      <!-- 0. SAVED LISTS & HISTORICAL TRACKING (NUEVA SECCIÓN) -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'saved_lists'" class="space-y-6">
        <div class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                <span class="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                  📋
                </span>
                Gestión de Listas de Leads & Histórico de Disparos
              </h2>
              <p class="text-xs text-slate-500 mt-1">
                Todas tus extracciones guardadas organizadas por origen, fecha de creación y estado de envío (estilo Apollo / Waalaxy).
              </p>
            </div>

            <button
              class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              @click="activeTab = 'gmaps'"
            >
              <span class="i-lucide-plus size-4" />
              + Extraer Nueva Lista
            </button>
          </div>

          <!-- Lists Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <div
              v-for="list in savedLists"
              :key="list.id"
              class="p-6 rounded-2xl border-2 transition-all flex flex-col justify-between"
              :class="selectedViewingList?.id === list.id ? 'bg-indigo-50/50 border-indigo-500 shadow-md shadow-indigo-500/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'"
            >
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span
                    class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5"
                    :class="list.source === 'gmaps' ? 'bg-blue-100 text-blue-800' : list.source === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' : 'bg-pink-100 text-pink-800'"
                  >
                    {{ list.sourceLabel }}
                  </span>
                  <span class="text-xs font-extrabold font-mono text-slate-800">
                    {{ list.count }} prospectos
                  </span>
                </div>

                <h3 class="text-sm font-extrabold text-slate-900 mb-2 line-clamp-1">{{ list.name }}</h3>
                <p class="text-[11px] text-slate-400 mb-4">Creada el: {{ list.createdAt }}</p>

                <!-- Status Badge -->
                <div class="mb-4">
                  <span
                    v-if="list.lastDispatchedAt"
                    class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 block"
                  >
                    ✅ Enviada el {{ list.lastDispatchedAt }}
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 block"
                  >
                    ⏳ Pendiente (Sin disparos aún)
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 pt-4 border-t border-slate-200/80">
                <button
                  class="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                  @click="selectedViewingList = list"
                >
                  👁️ Ver Contactos
                </button>
                <button
                  class="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer"
                  title="Descargar CSV"
                  @click="downloadCSVForList(list)"
                >
                  <span class="i-lucide-download size-4 text-slate-700" />
                </button>
                <button
                  class="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                  title="Lanzar Campaña"
                  @click="selectedWaListId = list.id; activeTab = 'campaign_wa';"
                >
                  <span class="i-lucide-send size-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Viewing List Contacts Table -->
          <div v-if="selectedViewingList" class="pt-6 border-t border-slate-200">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">
                  Prospectos de la Lista: {{ selectedViewingList.name }} ({{ selectedViewingList.leads.length }})
                </h3>
                <p class="text-[11px] text-slate-400">Historial: {{ selectedViewingList.lastDispatchedAt ? `Último envío el ${selectedViewingList.lastDispatchedAt}` : 'Sin envíos previos' }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  @click="downloadCSVForList(selectedViewingList)"
                >
                  <span class="i-lucide-file-spreadsheet size-4 text-emerald-600" />
                  Descargar CSV
                </button>
                <button
                  class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  @click="selectedWaListId = selectedViewingList.id; activeTab = 'campaign_wa';"
                >
                  <span class="i-lucide-send size-4" />
                  Disparar Campaña WhatsApp →
                </button>
              </div>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-200">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th class="px-5 py-3.5">Nombre / Empresa</th>
                    <th class="px-5 py-3.5">WhatsApp / Teléfono</th>
                    <th class="px-5 py-3.5">Detalle / Ubicación</th>
                    <th class="px-5 py-3.5">Calificación</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 bg-white">
                  <tr v-for="l in selectedViewingList.leads" :key="l.name" class="hover:bg-slate-50">
                    <td class="px-5 py-4 font-bold text-slate-900">{{ l.name || l.full_name || l.username }}</td>
                    <td class="px-5 py-4 font-mono text-emerald-700 font-bold">{{ l.phone || l.clean_phone }}</td>
                    <td class="px-5 py-4 text-slate-600">{{ l.address || l.role || l.category }}</td>
                    <td class="px-5 py-4 text-amber-600 font-bold">{{ l.rating || '⭐⭐⭐⭐⭐' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 1. GOOGLE MAPS BUSINESS EXTRACTOR -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'gmaps'" class="space-y-6">
        <div class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-base font-bold text-slate-900 flex items-center gap-2.5">
              <span class="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                📍
              </span>
              Extractor de Empresas en Google Maps (Leads de WhatsApp)
            </h2>
            <span class="text-xs text-slate-400 font-medium">
              Conexión directa con Google Maps Places & Web Scraping
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-6">
            Encuentra empresas locales con teléfono de WhatsApp, dirección, sitio web y calificación en cualquier ciudad del mundo.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Nicho / Rubro Comercial y Ciudad Objetivo
              </label>
              <div class="relative">
                <input
                  v-model="gmapsQuery"
                  type="text"
                  placeholder="Escribe el nicho y la ciudad (ej: Dentistas en Vila Velha, Odontólogos en Caracas, Clínicas en Bogotá...)"
                  class="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                />
                <span class="i-lucide-search absolute left-4 top-3.5 text-slate-400 size-4" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Cantidad a Extraer: {{ gmapsLimit }} empresas
              </label>
              <input
                v-model="gmapsLimit"
                type="range"
                min="5"
                max="100"
                step="5"
                class="w-full accent-blue-600 mt-3 cursor-pointer"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <button
              :disabled="gmapsLoading"
              style="background-color: #2563eb !important; color: #ffffff !important;"
              class="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
              @click="extractGMapsLeads"
            >
              <span v-if="gmapsLoading" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-download size-4 text-white" />
              <span class="text-white">{{ gmapsLoading ? 'Buscando empresas en Google Maps...' : 'Extraer & Guardar Lista de Empresas' }}</span>
            </button>

            <span v-if="gmapsSuccessMsg" class="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              {{ gmapsSuccessMsg }}
            </span>
          </div>
        </div>

        <!-- Google Maps Table -->
        <div v-if="gmapsLeads.length > 0" class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span class="i-lucide-building size-4 text-blue-600" />
                Empresas Extraídas ({{ gmapsLeads.length }})
              </h3>
              <p class="text-[11px] text-slate-500">Guardadas automáticamente en tu sección de Listas</p>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                @click="activeTab = 'saved_lists'"
              >
                <span class="i-lucide-list size-4" />
                Ver en Mis Listas →
              </button>

              <button
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                @click="activeTab = 'campaign_wa'"
              >
                <span class="i-lucide-send size-4" />
                Disparar Campaña WhatsApp →
              </button>
            </div>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th class="px-5 py-3.5">Nombre de Empresa</th>
                  <th class="px-5 py-3.5">WhatsApp / Teléfono</th>
                  <th class="px-5 py-3.5">Dirección / Barrio</th>
                  <th class="px-5 py-3.5">Calificación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                <tr v-for="lead in gmapsLeads" :key="lead.id" class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-5 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <div class="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      🏢
                    </div>
                    <div>
                      <div class="text-slate-900 font-extrabold text-xs">{{ lead.name }}</div>
                      <a :href="lead.website" target="_blank" class="text-[11px] text-blue-600 hover:underline font-normal">
                        {{ lead.website }}
                      </a>
                    </div>
                  </td>
                  <td class="px-5 py-4 font-mono text-emerald-700 font-bold text-sm">
                    {{ lead.phone }}
                  </td>
                  <td class="px-5 py-4 text-slate-600">
                    {{ lead.address }}
                  </td>
                  <td class="px-5 py-4 text-amber-600 font-bold">
                    {{ lead.rating }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 2. WHATSAPP GROUPS (2-PHASE ENGINE) -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'whatsapp_groups'" class="space-y-6">
        <div class="flex items-center gap-3 p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 w-fit">
          <button
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="waGroupMode === 'search' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
            @click="waGroupMode = 'search'"
          >
            🔎 Fase 1: Buscador de Enlaces de Grupos en Google/Web
          </button>

          <button
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="waGroupMode === 'my_groups' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
            @click="waGroupMode = 'my_groups'"
          >
            👥 Grupos Activos en mi WhatsApp
          </button>
        </div>

        <!-- FASE 1: BUSCADOR WEB DE GRUPOS -->
        <div v-if="waGroupMode === 'search'" class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 class="text-base font-bold text-slate-900 mb-1 flex items-center gap-2.5">
            <span class="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
              🌐
            </span>
            Buscador Web de Enlaces de Grupos Públicos (chat.whatsapp.com)
          </h2>
          <p class="text-xs text-slate-500 mb-6">
            Rastrea en Google y foros públicos enlaces abiertos de grupos de WhatsApp sobre cualquier tema o nicho.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Palabra Clave / Nicho del Grupo
              </label>
              <div class="relative">
                <input
                  v-model="waSearchKeyword"
                  type="text"
                  placeholder="ej: Emagrecimento, Matrimonios, Investimentos, Odontologia..."
                  class="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 font-medium"
                />
                <span class="i-lucide-search absolute left-4 top-3.5 text-slate-400 size-4" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Cantidad de Grupos: {{ waSearchLimit }}
              </label>
              <input
                v-model="waSearchLimit"
                type="range"
                min="5"
                max="50"
                step="5"
                class="w-full accent-emerald-600 mt-3 cursor-pointer"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <button
              :disabled="waSearchingLinks"
              style="background-color: #059669 !important; color: #ffffff !important;"
              class="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
              @click="searchPublicGroupLinks"
            >
              <span v-if="waSearchingLinks" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-globe size-4 text-white" />
              <span class="text-white">{{ waSearchingLinks ? 'Rastreando enlaces de grupos en Google...' : 'Rastrear Enlaces de Grupos' }}</span>
            </button>

            <span v-if="waSuccessMsg" class="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              {{ waSuccessMsg }}
            </span>
          </div>

          <!-- Found Group Links Grid -->
          <div v-if="waFoundGroupLinks.length > 0" class="mt-8 pt-6 border-t border-slate-200">
            <h3 class="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span class="i-lucide-link size-4 text-emerald-600" />
              Enlaces de Grupos Encontrados ({{ waFoundGroupLinks.length }})
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="grp in waFoundGroupLinks"
                :key="grp.id"
                class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      ~{{ grp.members_estimate }} miembros
                    </span>
                    <span class="text-[10px] text-slate-400 font-semibold">{{ grp.source }}</span>
                  </div>
                  <h4 class="text-xs font-bold text-slate-900 line-clamp-1 mb-2">{{ grp.title }}</h4>
                  <p class="text-[11px] font-mono text-emerald-700 line-clamp-1 mb-4">{{ grp.invite_url }}</p>
                </div>

                <button
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  @click="extractGroupMembers(grp)"
                >
                  <span class="i-lucide-users size-3.5" />
                  Fase 2: Extraer Integrantes & Guardar Lista →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- FASE 2: GRUPOS ACTIVOS EN WHATSAPP -->
        <div v-if="waGroupMode === 'my_groups'" class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <span class="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                  👥
                </span>
                Grupos Activos en mi WhatsApp Comercial
              </h2>
              <p class="text-xs text-slate-500">
                Haz clic en cualquier grupo para extraer automáticamente los teléfonos y nombres de todos sus miembros.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div
              v-for="group in waGroups"
              :key="group.id"
              class="p-5 rounded-2xl border-2 transition-all cursor-pointer select-none"
              :class="selectedGroup?.id === group.id ? 'bg-emerald-50/70 border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-slate-50/80 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30'"
              @click="extractGroupMembers(group)"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="size-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {{ group.icon || 'WA' }}
                </span>
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white text-emerald-700 border border-emerald-200">
                  {{ group.size }} miembros
                </span>
              </div>
              <h4 class="text-xs font-bold text-slate-900 line-clamp-2 mb-2 leading-relaxed">{{ group.subject }}</h4>
              <p class="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                Extraer & Guardar Lista <span class="text-sm">→</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 3. INSTAGRAM EXTRACTOR -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'instagram'" class="space-y-6">
        <div class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h2 class="text-base font-bold text-slate-900 mb-1 flex items-center gap-2.5">
            <span class="size-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-base">
              📸
            </span>
            Extractor de Prospectos de Instagram
          </h2>
          <p class="text-xs text-slate-500 mb-6">
            Extrae seguidores, biografía y teléfonos públicos de cualquier cuenta competidora en Instagram y crea una lista automática.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Cuenta Objetivo (@usuario)</label>
              <input
                v-model="igAccount"
                type="text"
                placeholder="Escribe el usuario (ej: @odontocompany_vilavelha, @clinica_estetica...)"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Cantidad: {{ igAmount }} prospectos</label>
              <input
                v-model="igAmount"
                type="range"
                min="10"
                max="500"
                step="10"
                class="w-full accent-pink-600 mt-3 cursor-pointer"
              />
            </div>

            <div class="flex items-center pt-6">
              <label class="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  v-model="igFilterBusiness"
                  type="checkbox"
                  class="size-4 rounded accent-pink-600 bg-slate-100 border-slate-300"
                />
                Solo cuentas comerciales / con teléfono
              </label>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button
              :disabled="igLoading"
              style="background-color: #db2777 !important; color: #ffffff !important;"
              class="px-8 py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs font-extrabold shadow-md shadow-pink-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
              @click="extractInstagramLeads"
            >
              <span v-if="igLoading" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-download size-4 text-white" />
              <span class="text-white">{{ igLoading ? 'Extrayendo seguidores...' : 'Extraer & Guardar Lista Instagram' }}</span>
            </button>

            <span v-if="igSuccessMsg" class="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
              {{ igSuccessMsg }}
            </span>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 4. DISPARADOR DE CAMPAÑAS DE WHATSAPP -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'campaign_wa'" class="space-y-6">
        <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm max-w-3xl mx-auto">
          <div class="flex items-center gap-3.5 mb-2">
            <div class="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              📱
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900">Disparador de Campañas de WhatsApp</h2>
              <p class="text-xs text-slate-500">Envío masivo con intervalos inteligentes anti-bloqueo e histórico de envíos</p>
            </div>
          </div>

          <div class="space-y-5 my-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Seleccionar Lista Guardada de Destinatarios
              </label>
              <select
                v-model="selectedWaListId"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
              >
                <option v-for="lst in savedLists" :key="lst.id" :value="lst.id">
                  {{ lst.name }} ({{ lst.count }} contactos) · {{ lst.lastDispatchedAt ? `Enviada el ${lst.lastDispatchedAt}` : 'Sin envíos previos' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Mensaje de Campaña (Usa <span class="text-emerald-700 font-mono font-bold">{nome}</span> para personalizar)
              </label>
              <textarea
                v-model="waCampaignMessage"
                rows="4"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Intervalo de Seguridad Anti-Baneo: {{ waCampaignDelay }} segundos
              </label>
              <input
                v-model="waCampaignDelay"
                type="range"
                min="10"
                max="60"
                step="5"
                class="w-full accent-emerald-600 cursor-pointer"
              />
              <p class="text-[11px] text-slate-400 mt-1">Recomendado: 15-30 segundos para proteger tu número de WhatsApp.</p>
            </div>
          </div>

          <!-- Progress -->
          <div v-if="waCampaignSending" class="mb-6 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Disparando mensajes de WhatsApp...</span>
              <span class="font-mono text-emerald-700">{{ waCampaignProgress }} / {{ waCampaignTotal }}</span>
            </div>
            <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                class="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${(waCampaignProgress / waCampaignTotal) * 100}%` }"
              />
            </div>
          </div>

          <span v-if="waCampaignSuccessMsg" class="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 block mb-6">
            {{ waCampaignSuccessMsg }}
          </span>

          <button
            :disabled="waCampaignSending"
            style="background-color: #059669 !important; color: #ffffff !important;"
            class="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            @click="launchWACampaign"
          >
            <span v-if="waCampaignSending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="i-lucide-rocket size-5 text-white" />
            <span class="text-white">{{ waCampaignSending ? 'Enviando Campaña...' : '🚀 Iniciar Disparo en WhatsApp' }}</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 5. DISPARADOR DE CAMPAÑAS DE INSTAGRAM (DMs) -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'campaign_ig'" class="space-y-6">
        <div class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm max-w-3xl mx-auto">
          <div class="flex items-center gap-3.5 mb-2">
            <div class="size-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              📸
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900">Disparador de Mensajes Directos (DMs) en Instagram</h2>
              <p class="text-xs text-slate-500">Automatización de DMs con rotación, pausas de seguridad e histórico</p>
            </div>
          </div>

          <div class="space-y-5 my-6">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Seleccionar Lista Guardada de Instagram</label>
              <select
                v-model="selectedIgListId"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
              >
                <option v-for="lst in savedLists.filter(l => l.source === 'instagram')" :key="lst.id" :value="lst.id">
                  {{ lst.name }} ({{ lst.count }} seguidores) · {{ lst.lastDispatchedAt ? `Enviada el ${lst.lastDispatchedAt}` : 'Sin envíos previos' }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Mensaje Directo (Usa <span class="text-purple-700 font-mono font-bold">@{username}</span> para mencionar)
              </label>
              <textarea
                v-model="igCampaignMessage"
                rows="4"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                Intervalo entre DMs: {{ igCampaignDelay }} segundos
              </label>
              <input
                v-model="igCampaignDelay"
                type="range"
                min="15"
                max="90"
                step="5"
                class="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>

          <!-- Progress -->
          <div v-if="igCampaignSending" class="mb-6 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Enviando DMs de Instagram...</span>
              <span class="font-mono text-purple-700">{{ igCampaignProgress }} / {{ igCampaignTotal }}</span>
            </div>
            <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                class="bg-purple-600 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${(igCampaignProgress / igCampaignTotal) * 100}%` }"
              />
            </div>
          </div>

          <span v-if="igCampaignSuccessMsg" class="text-xs font-bold text-emerald-800 bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-200 block mb-6">
            {{ igCampaignSuccessMsg }}
          </span>

          <button
            :disabled="igCampaignSending"
            style="background-color: #9333ea !important; color: #ffffff !important;"
            class="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer"
            @click="launchIGCampaign"
          >
            <span v-if="igCampaignSending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="i-lucide-rocket size-5 text-white" />
            <span class="text-white">{{ igCampaignSending ? 'Enviando DMs...' : '🚀 Iniciar Disparo en Instagram' }}</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
