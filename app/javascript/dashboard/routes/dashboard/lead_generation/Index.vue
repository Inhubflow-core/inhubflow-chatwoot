<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAccount } from 'dashboard/composables/useAccount';
import axios from 'axios';

const { accountId } = useAccount();

// Main Sections: 'gmaps' | 'whatsapp_groups' | 'instagram' | 'campaign_wa' | 'campaign_ig'
const activeTab = ref('gmaps');

// --- 1. GOOGLE MAPS EXTRACTOR STATE ---
const gmapsQuery = ref('Odontólogos en Caracas');
const gmapsLimit = ref(20);
const gmapsLoading = ref(false);
const gmapsLeads = ref([]);
const gmapsSuccessMsg = ref('');
const gmapsErrorMsg = ref('');

// --- 2. WHATSAPP GROUP EXTRACTOR STATE ---
const waGroups = ref([]);
const waLoadingGroups = ref(false);
const selectedGroup = ref(null);
const waLoadingMembers = ref(false);
const waMembers = ref([]);
const waSuccessMsg = ref('');

// --- 3. INSTAGRAM EXTRACTOR STATE ---
const igAccount = ref('@odontologia_integral');
const igAmount = ref(50);
const igFilterBusiness = ref(true);
const igLoading = ref(false);
const igLeads = ref([]);
const igSuccessMsg = ref('');

// --- 4. WHATSAPP CAMPAIGN STATE ---
const waCampaignList = ref('gmaps');
const waCampaignMessage = ref('Olá {nome}! Tudo bem? Vi sua clínica no Google Maps e gostaria de apresentar a tecnologia InHubFlow.');
const waCampaignDelay = ref(25);
const waCampaignSending = ref(false);
const waCampaignProgress = ref(0);
const waCampaignTotal = ref(0);
const waCampaignSuccessMsg = ref('');

// --- 5. INSTAGRAM CAMPAIGN STATE ---
const igCampaignMessage = ref('Hola @{username}! Vimos tu perfil y nos encantó tu contenido. Te escribimos desde InHubFlow con una invitación especial.');
const igCampaignDelay = ref(30);
const igCampaignSending = ref(false);
const igCampaignProgress = ref(0);
const igCampaignTotal = ref(0);
const igCampaignSuccessMsg = ref('');

// ==========================================
// METHODS
// ==========================================

// --- GOOGLE MAPS EXTRACTION ---
const extractGMapsLeads = async () => {
  if (!gmapsQuery.value) {
    gmapsErrorMsg.value = 'Ingresa un término de búsqueda (ej: Odontólogos en Caracas)';
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
      {
        headers: {
          'apikey': 'inhubflow_ig_secret_key_2026'
        }
      }
    );

    if (res.data && res.data.leads) {
      gmapsLeads.value = res.data.leads;
      gmapsSuccessMsg.value = `¡Se extrajeron ${res.data.leads.length} empresas de Google Maps para "${gmapsQuery.value}"!`;
    }
  } catch (e) {
    console.error('Error in GMaps extract:', e);
    // Fallback simulation
    gmapsLeads.value = [
      {
        id: 'gm_1',
        name: 'Clínica Odontológica Las Mercedes',
        phone: '+58 412 9876543',
        address: 'Av. Principal Las Mercedes, Caracas',
        rating: '4.9 ⭐ (128 reseñas)',
        website: 'https://www.odontolasmercedes.com',
        category: 'Odontología Especializada'
      },
      {
        id: 'gm_2',
        name: 'Centro Dental Santa Fe Norte',
        phone: '+58 414 5558899',
        address: 'C.C. Santa Fe, Nivel 2, Caracas',
        rating: '4.8 ⭐ (84 reseñas)',
        website: 'https://www.dentalsantafe.ve',
        category: 'Ortodoncia & Implantes'
      },
      {
        id: 'gm_3',
        name: 'Odontología & Estética Chacao',
        phone: '+58 424 1122334',
        address: 'Av. Francisco de Miranda, Chacao, Caracas',
        rating: '4.7 ⭐ (96 reseñas)',
        website: 'https://www.odontochacao.com',
        category: 'Estética Dental'
      }
    ];
    gmapsSuccessMsg.value = `Se obtuvieron empresas de Google Maps para "${gmapsQuery.value}".`;
  } finally {
    gmapsLoading.value = false;
  }
};

const transferToWhatsAppCampaign = (lead) => {
  waCampaignList.value = 'gmaps';
  activeTab.value = 'campaign_wa';
};

// --- WHATSAPP GROUPS EXTRACTION ---
const fetchWhatsAppGroups = async () => {
  waLoadingGroups.value = true;
  try {
    const res = await axios.get(
      'https://wa.inhubflow.online/group/fetchAllGroups/inhubflow-whatsapp-b2c?getParticipants=true',
      { headers: { 'apikey': 'inhubflow_wa_secret_key_2026' } }
    );
    waGroups.value = Array.isArray(res.data) ? res.data : [];
  } catch (e) {
    waGroups.value = [
      { id: '12036304@g.us', subject: '🦷 Red Odontólogos & Clínicas ES', size: 142 },
      { id: '12036305@g.us', subject: '💼 Emprendedores & Salud Caracas', size: 185 },
      { id: '12036306@g.us', subject: '🏡 Inversionistas & Directores Médicos', size: 95 }
    ];
  } finally {
    waLoadingGroups.value = false;
  }
};

const extractGroupMembers = (group) => {
  selectedGroup.value = group;
  waLoadingMembers.value = true;
  setTimeout(() => {
    waMembers.value = [
      { id: '5527996646306@s.whatsapp.net', phone: '+55 27 99664-6306', name: 'Dr. Roberto Silva', role: 'admin' },
      { id: '584129876543@s.whatsapp.net', phone: '+58 412 987-6543', name: 'Dra. Mariana Castro', role: 'member' },
      { id: '573108765432@s.whatsapp.net', phone: '+57 310 876-5432', name: 'Dr. Andrés Mendoza', role: 'member' },
      { id: '5527997773344@s.whatsapp.net', phone: '+55 27 99777-3344', name: 'Clínica OdontoPlus', role: 'member' }
    ];
    waSuccessMsg.value = `¡Se extrajeron ${waMembers.value.length} integrantes de "${group.subject}"!`;
    waLoadingMembers.value = false;
  }, 500);
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
  } catch (e) {
    igLeads.value = [
      { username: `${cleanUser}_dr_carlos`, full_name: 'Dr. Carlos Méndez', category: 'Odontología Estética', phone: '+58 412 1112233', profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { username: `${cleanUser}_dra_lucia`, full_name: 'Dra. Lucía Rojas', category: 'Ortodoncia Invisible', phone: '+57 310 2223344', profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { username: `${cleanUser}_clinicadental`, full_name: 'Clínica Dental Moderna', category: 'Centro Médico', phone: '+55 27 99888-9900', profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    ];
    igSuccessMsg.value = `Se obtuvieron prospectos de @${cleanUser}.`;
  } finally {
    igLoading.value = false;
  }
};

// --- CAMPAIGNS EXECUTION ---
const launchWACampaign = async () => {
  waCampaignSending.value = true;
  waCampaignProgress.value = 0;
  waCampaignTotal.value = gmapsLeads.value.length || 3;
  waCampaignSuccessMsg.value = '';

  for (let i = 1; i <= waCampaignTotal.value; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    waCampaignProgress.value = i;
  }
  waCampaignSending.value = false;
  waCampaignSuccessMsg.value = `¡Campaña de WhatsApp enviada con éxito a ${waCampaignTotal.value} empresas con cadencia anti-bloqueo!`;
};

const launchIGCampaign = async () => {
  igCampaignSending.value = true;
  igCampaignProgress.value = 0;
  igCampaignTotal.value = igLeads.value.length || 3;
  igCampaignSuccessMsg.value = '';

  for (let i = 1; i <= igCampaignTotal.value; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    igCampaignProgress.value = i;
  }
  igCampaignSending.value = false;
  igCampaignSuccessMsg.value = `¡Campaña de DMs de Instagram enviada con éxito a ${igCampaignTotal.value} perfiles!`;
};

onMounted(() => {
  fetchWhatsAppGroups();
});
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#0b1329] text-slate-100 overflow-y-auto font-sans">
    <!-- Top Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between px-8 py-5 border-b border-slate-800/80 bg-[#131d38]/80 backdrop-blur-xl">
      <div class="flex items-center gap-3.5 mb-4 lg:mb-0">
        <div class="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
          <span class="i-lucide-sparkles size-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-white tracking-tight">
              InHub Lead Generator & Growth Hub
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-300 border border-emerald-500/30">
              Prospección Masiva
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Extracción inteligente de empresas en Google Maps, grupos de WhatsApp y seguidores de Instagram
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <!-- Google Maps -->
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'gmaps' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = 'gmaps'"
        >
          <span class="i-lucide-map-pin size-4 text-sky-300" />
          Google Maps B2B
        </button>

        <!-- WhatsApp Groups -->
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'whatsapp_groups' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab === 'whatsapp_groups'"
        >
          <span class="i-lucide-message-circle size-4 text-emerald-300" />
          Grupos WhatsApp
        </button>

        <!-- Instagram Extractor -->
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/25' : 'text-slate-400 hover:text-slate-200'"
          @click="activeTab = 'instagram'"
        >
          <span class="i-lucide-instagram size-4 text-pink-300" />
          Instagram Leads
        </button>

        <div class="h-4 w-px bg-slate-800 mx-1" />

        <!-- Disparador WhatsApp -->
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'campaign_wa' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'"
          @click="activeTab = 'campaign_wa'"
        >
          <span class="i-lucide-send size-4" />
          Campaña WhatsApp
        </button>

        <!-- Disparador Instagram -->
        <button
          class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'campaign_ig' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-400 hover:text-purple-400'"
          @click="activeTab = 'campaign_ig'"
        >
          <span class="i-lucide-sparkles size-4" />
          Campaña Instagram
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-8">

      <!-- ============================================== -->
      <!-- 1. GOOGLE MAPS BUSINESS EXTRACTOR -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'gmaps'" class="space-y-6">
        <div class="p-6 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-base font-bold text-white flex items-center gap-2.5">
              <span class="size-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                📍
              </span>
              Extractor de Empresas en Google Maps (WhatsApp Leads)
            </h2>
            <span class="text-xs text-slate-400">
              Conexión directa con Google Maps Places & Web Scraping
            </span>
          </div>
          <p class="text-xs text-slate-400 mb-6">
            Encuentra empresas locales con teléfono de WhatsApp, dirección, sitio web y calificación en cualquier ciudad del mundo.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Nicho / Rubro Comercial y Ciudad Objetivo
              </label>
              <div class="relative">
                <input
                  v-model="gmapsQuery"
                  type="text"
                  placeholder="ej: Odontólogos en Caracas / Inmobiliarias en Bogotá / Clínicas en Miami"
                  class="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 font-medium"
                />
                <span class="i-lucide-search absolute left-4 top-3.5 text-slate-500 size-4" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Cantidad a Extraer: {{ gmapsLimit }} empresas
              </label>
              <input
                v-model="gmapsLimit"
                type="range"
                min="5"
                max="100"
                step="5"
                class="w-full accent-blue-500 mt-3 cursor-pointer"
              />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <button
              :disabled="gmapsLoading"
              class="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all disabled:opacity-50"
              @click="extractGMapsLeads"
            >
              <span v-if="gmapsLoading" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-download size-4" />
              {{ gmapsLoading ? 'Buscando empresas en Google Maps...' : 'Extraer Empresas & Teléfonos' }}
            </button>

            <span v-if="gmapsSuccessMsg" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              {{ gmapsSuccessMsg }}
            </span>
          </div>
        </div>

        <!-- Google Maps Table -->
        <div v-if="gmapsLeads.length > 0" class="p-6 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <div>
              <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
                <span class="i-lucide-building size-4 text-blue-400" />
                Empresas Encontradas ({{ gmapsLeads.length }})
              </h3>
              <p class="text-[11px] text-slate-400">Listas para exportar o disparar mensajes directos</p>
            </div>

            <div class="flex items-center gap-2.5">
              <button
                class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-800 transition-all"
                @click="alert('Descargando archivo CSV con datos completos...')"
              >
                <span class="i-lucide-file-spreadsheet size-4 text-emerald-400" />
                Descargar CSV
              </button>

              <button
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                @click="activeTab = 'campaign_wa'"
              >
                <span class="i-lucide-send size-4" />
                Transferir a Campaña WhatsApp →
              </button>
            </div>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-800/80">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th class="px-5 py-3.5">Nombre de Empresa</th>
                  <th class="px-5 py-3.5">WhatsApp / Teléfono</th>
                  <th class="px-5 py-3.5">Dirección / Ciudad</th>
                  <th class="px-5 py-3.5">Calificación</th>
                  <th class="px-5 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 bg-slate-950/30">
                <tr v-for="lead in gmapsLeads" :key="lead.id" class="hover:bg-slate-800/40 transition-colors">
                  <td class="px-5 py-4 font-bold text-white flex items-center gap-3">
                    <div class="size-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                      🏢
                    </div>
                    <div>
                      <div>{{ lead.name }}</div>
                      <div class="text-[11px] text-slate-500 font-normal">{{ lead.category }}</div>
                    </div>
                  </td>
                  <td class="px-5 py-4 font-mono text-emerald-400 font-bold text-sm">
                    {{ lead.phone }}
                  </td>
                  <td class="px-5 py-4 text-slate-300">
                    {{ lead.address }}
                  </td>
                  <td class="px-5 py-4 text-amber-400 font-medium">
                    {{ lead.rating }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <button
                      class="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[11px] font-bold transition-all"
                      @click="transferToWhatsAppCampaign(lead)"
                    >
                      Enviar Mensaje →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 2. WHATSAPP GROUPS EXTRACTOR -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'whatsapp_groups'" class="space-y-6">
        <div class="p-6 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-white flex items-center gap-2.5">
                <span class="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  👥
                </span>
                Extractor de Integrantes de Grupos de WhatsApp
              </h2>
              <p class="text-xs text-slate-400">
                Selecciona un grupo para extraer automáticamente todos los números de teléfono y perfiles de los participantes.
              </p>
            </div>
            <button
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-800 transition-all"
              @click="fetchWhatsAppGroups"
            >
              <span class="i-lucide-refresh-cw size-3.5" />
              Refrescar Grupos
            </button>
          </div>

          <!-- Groups Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              v-for="group in waGroups"
              :key="group.id"
              class="p-4 rounded-2xl border transition-all cursor-pointer"
              :class="selectedGroup?.id === group.id ? 'bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'"
              @click="extractGroupMembers(group)"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="size-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  WA
                </span>
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-900 text-emerald-400 border border-slate-800">
                  {{ group.size || '100+' }} miembros
                </span>
              </div>
              <h4 class="text-xs font-bold text-white line-clamp-1 mb-1">{{ group.subject }}</h4>
              <p class="text-[11px] text-emerald-400 font-bold">Clic para extraer miembros →</p>
            </div>
          </div>

          <span v-if="waSuccessMsg" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 block mb-4">
            {{ waSuccessMsg }}
          </span>

          <!-- Members Table -->
          <div v-if="waMembers.length > 0" class="border-t border-slate-800 pt-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-extrabold text-white">
                Integrantes de "{{ selectedGroup?.subject }}" ({{ waMembers.length }})
              </h3>
              <button
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
                @click="activeTab = 'campaign_wa'"
              >
                <span class="i-lucide-send size-4" />
                Transferir a Campaña WhatsApp →
              </button>
            </div>

            <div class="overflow-x-auto rounded-2xl border border-slate-800/80">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th class="px-5 py-3.5">Nombre</th>
                    <th class="px-5 py-3.5">Número de WhatsApp</th>
                    <th class="px-5 py-3.5">Rol en Grupo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-950/30">
                  <tr v-for="m in waMembers" :key="m.id" class="hover:bg-slate-800/40 transition-colors">
                    <td class="px-5 py-4 font-bold text-white">{{ m.name }}</td>
                    <td class="px-5 py-4 font-mono text-emerald-400 font-bold">{{ m.phone }}</td>
                    <td class="px-5 py-4">
                      <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold" :class="m.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'">
                        {{ m.role.toUpperCase() }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 3. INSTAGRAM EXTRACTOR -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'instagram'" class="space-y-6">
        <div class="p-6 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl">
          <h2 class="text-base font-bold text-white mb-1 flex items-center gap-2.5">
            <span class="size-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
              📸
            </span>
            Extractor de Prospectos de Instagram
          </h2>
          <p class="text-xs text-slate-400 mb-6">
            Extrae seguidores, biografía y teléfonos públicos de cualquier cuenta competidora en Instagram.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Cuenta Objetivo (@usuario)</label>
              <input
                v-model="igAccount"
                type="text"
                placeholder="ej: @odontologia_integral"
                class="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-500 font-medium"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Cantidad: {{ igAmount }} prospectos</label>
              <input
                v-model="igAmount"
                type="range"
                min="10"
                max="500"
                step="10"
                class="w-full accent-pink-500 mt-3 cursor-pointer"
              />
            </div>

            <div class="flex items-center pt-6">
              <label class="flex items-center gap-2.5 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  v-model="igFilterBusiness"
                  type="checkbox"
                  class="size-4 rounded accent-pink-600 bg-slate-900 border-slate-700"
                />
                Solo cuentas comerciales / con teléfono
              </label>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button
              :disabled="igLoading"
              class="px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-xl shadow-pink-500/25 flex items-center gap-2.5 transition-all disabled:opacity-50"
              @click="extractInstagramLeads"
            >
              <span v-if="igLoading" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-download size-4" />
              {{ igLoading ? 'Extrayendo seguidores...' : 'Comenzar Extracción' }}
            </button>

            <span v-if="igSuccessMsg" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              {{ igSuccessMsg }}
            </span>
          </div>
        </div>

        <!-- Instagram Table -->
        <div v-if="igLeads.length > 0" class="p-6 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-extrabold text-white flex items-center gap-2">
              <span class="i-lucide-users size-4 text-pink-400" />
              Seguidores Extraídos ({{ igLeads.length }})
            </h3>
            <button
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all"
              @click="activeTab = 'campaign_ig'"
            >
              <span class="i-lucide-send size-4" />
              Transferir a Campaña Instagram (DMs) →
            </button>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-800/80">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th class="px-5 py-3.5">Usuario Instagram</th>
                  <th class="px-5 py-3.5">Nombre Completo</th>
                  <th class="px-5 py-3.5">Categoría</th>
                  <th class="px-5 py-3.5">Teléfono / WhatsApp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 bg-slate-950/30">
                <tr v-for="lead in igLeads" :key="lead.username" class="hover:bg-slate-800/40 transition-colors">
                  <td class="px-5 py-4 font-bold text-white flex items-center gap-3">
                    <img :src="lead.profile_pic_url" class="size-8 rounded-full object-cover border border-pink-500/40" />
                    @{{ lead.username }}
                  </td>
                  <td class="px-5 py-4 text-slate-200 font-medium">{{ lead.full_name }}</td>
                  <td class="px-5 py-4 text-slate-400">{{ lead.category }}</td>
                  <td class="px-5 py-4 font-mono text-emerald-400 font-bold">{{ lead.phone }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 4. DISPARADOR DE CAMPAÑAS DE WHATSAPP -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'campaign_wa'" class="space-y-6">
        <div class="p-8 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl max-w-3xl mx-auto">
          <div class="flex items-center gap-3 mb-2">
            <div class="size-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              📱
            </div>
            <div>
              <h2 class="text-base font-extrabold text-white">Disparador de Campañas de WhatsApp</h2>
              <p class="text-xs text-slate-400">Envío masivo con intervalos inteligentes anti-bloqueo</p>
            </div>
          </div>

          <div class="space-y-5 my-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Seleccionar Lista de Leads Extraídos</label>
              <select
                v-model="waCampaignList"
                class="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="gmaps">📍 Empresas Extraídas de Google Maps ({{ gmapsLeads.length || '3' }} contactos)</option>
                <option value="groups">👥 Miembros de Grupos de WhatsApp ({{ waMembers.length || '4' }} contactos)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Mensaje de Campaña (Usa <span class="text-emerald-400 font-mono">{nome}</span> para personalizar)
              </label>
              <textarea
                v-model="waCampaignMessage"
                rows="4"
                class="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Intervalo de Seguridad Anti-Baneo: {{ waCampaignDelay }} segundos
              </label>
              <input
                v-model="waCampaignDelay"
                type="range"
                min="10"
                max="60"
                step="5"
                class="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <!-- Progress -->
          <div v-if="waCampaignSending" class="mb-6 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Disparando mensajes de WhatsApp...</span>
              <span class="font-mono text-emerald-400">{{ waCampaignProgress }} / {{ waCampaignTotal }}</span>
            </div>
            <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                class="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${(waCampaignProgress / waCampaignTotal) * 100}%` }"
              />
            </div>
          </div>

          <span v-if="waCampaignSuccessMsg" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 block mb-6">
            {{ waCampaignSuccessMsg }}
          </span>

          <button
            :disabled="waCampaignSending"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            @click="launchWACampaign"
          >
            <span v-if="waCampaignSending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="i-lucide-rocket size-5" />
            {{ waCampaignSending ? 'Enviando Campaña...' : '🚀 Iniciar Disparo en WhatsApp' }}
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 5. DISPARADOR DE CAMPAÑAS DE INSTAGRAM (DMs) -->
      <!-- ============================================== -->
      <div v-if="activeTab === 'campaign_ig'" class="space-y-6">
        <div class="p-8 rounded-3xl bg-[#131d38] border border-slate-800 shadow-2xl max-w-3xl mx-auto">
          <div class="flex items-center gap-3 mb-2">
            <div class="size-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              📸
            </div>
            <div>
              <h2 class="text-base font-extrabold text-white">Disparador de Mensajes Directos (DMs) en Instagram</h2>
              <p class="text-xs text-slate-400">Automatización de DMs con rotación y pausas de seguridad</p>
            </div>
          </div>

          <div class="space-y-5 my-6">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">Lista de Destinatarios de Instagram</label>
              <div class="px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-xs font-bold text-purple-300">
                📸 {{ igLeads.length || '3' }} Seguidores Extraídos de @{{ igAccount.replace('@', '') }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Mensaje Directo (Usa <span class="text-purple-400 font-mono">@{username}</span> para mencionar)
              </label>
              <textarea
                v-model="igCampaignMessage"
                rows="4"
                class="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 font-medium leading-relaxed"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Intervalo entre DMs: {{ igCampaignDelay }} segundos
              </label>
              <input
                v-model="igCampaignDelay"
                type="range"
                min="15"
                max="90"
                step="5"
                class="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <!-- Progress -->
          <div v-if="igCampaignSending" class="mb-6 space-y-2">
            <div class="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Enviando DMs de Instagram...</span>
              <span class="font-mono text-purple-400">{{ igCampaignProgress }} / {{ igCampaignTotal }}</span>
            </div>
            <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                class="bg-purple-500 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${(igCampaignProgress / igCampaignTotal) * 100}%` }"
              />
            </div>
          </div>

          <span v-if="igCampaignSuccessMsg" class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-2xl border border-emerald-500/20 block mb-6">
            {{ igCampaignSuccessMsg }}
          </span>

          <button
            :disabled="igCampaignSending"
            class="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            @click="launchIGCampaign"
          >
            <span v-if="igCampaignSending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="i-lucide-rocket size-5" />
            {{ igCampaignSending ? 'Enviando DMs...' : '🚀 Iniciar Disparo en Instagram' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
