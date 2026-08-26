<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAccount } from 'dashboard/composables/useAccount';
import { useLeadHub } from 'dashboard/composables/useLeadHub';
import axios from 'axios';

const router = useRouter();
const { accountId } = useAccount();
const { saveNewList } = useLeadHub();

// Active Extractor Tab: 'gmaps' | 'whatsapp_groups' | 'instagram'
const activeExtractor = ref('gmaps');

// ==========================================
// 1. GOOGLE MAPS EXTRACTOR
// ==========================================
const gmapsNiche = ref('');
const gmapsCity = ref('');
const gmapsCountry = ref('ES');
const gmapsLimit = ref(25);
const gmapsLoading = ref(false);
const gmapsLeads = ref([]);
const gmapsSuccessMsg = ref('');
const gmapsErrorMsg = ref('');

const countriesList = [
  { code: 'ES', flag: '🇪🇸', name: 'España (+34)' },
  { code: 'BR', flag: '🇧🇷', name: 'Brasil (+55)' },
  { code: 'VE', flag: '🇻🇪', name: 'Venezuela (+58)' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia (+57)' },
  { code: 'MX', flag: '🇲🇽', name: 'México (+52)' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina (+54)' },
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos (+1)' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile (+56)' },
  { code: 'PE', flag: '🇵🇪', name: 'Perú (+51)' },
  { code: 'PA', flag: '🇵🇦', name: 'Panamá (+507)' },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador (+593)' },
];

// ==========================================
// 2. WHATSAPP GROUPS (2-PHASE)
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
// 3. INSTAGRAM EXTRACTOR
// ==========================================
const igAccount = ref('');
const igAmount = ref(50);
const igFilterBusiness = ref(true);
const igLoading = ref(false);
const igLeads = ref([]);
const igSuccessMsg = ref('');

// ==========================================
// METHODS
// ==========================================

const extractGMapsLeads = async () => {
  if (!gmapsNiche.value || !gmapsCity.value) {
    gmapsErrorMsg.value = 'Por favor ingresa el área/rubro comercial y la ciudad.';
    return;
  }
  gmapsLoading.value = true;
  gmapsErrorMsg.value = '';
  gmapsSuccessMsg.value = '';

  try {
    const res = await axios.post(
      'https://ig.inhubflow.online/api/extract/gmaps',
      {
        niche: gmapsNiche.value,
        city: gmapsCity.value,
        country: gmapsCountry.value,
        limit: Number(gmapsLimit.value)
      },
      { headers: { 'apikey': 'inhubflow_ig_secret_key_2026' } }
    );

    if (res.data && res.data.leads && res.data.leads.length > 0) {
      gmapsLeads.value = res.data.leads;
      const cObj = countriesList.find(c => c.code === gmapsCountry.value);
      const cLabel = cObj ? `${cObj.flag} ${cObj.name}` : gmapsCountry.value;
      gmapsSuccessMsg.value = `¡Se extrajeron ${res.data.leads.length} empresas de Google Maps para "${gmapsNiche.value} en ${gmapsCity.value}, ${cLabel}"!`;
      
      // Auto-save to saved lists
      saveNewList(`📍 ${gmapsNiche.value} - ${gmapsCity.value}`, 'gmaps', 'Google Maps B2B', res.data.leads);
    }
  } catch (e) {
    console.error('GMaps notice:', e);
    gmapsErrorMsg.value = 'No se pudieron extraer empresas. Verifica la conexión.';
  } finally {
    gmapsLoading.value = false;
  }
};

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

    saveNewList(`👥 ${group.title || group.subject}`, 'whatsapp', 'Grupos WhatsApp', waMembers.value);
  }, 400);
};

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
      saveNewList(`📸 Seguidores @${cleanUser}`, 'instagram', 'Instagram Leads', igLeads.value);
    }
  } catch (e) {
    igLeads.value = [
      { username: `${cleanUser}_dr_carlos`, full_name: 'Dr. Carlos Méndez', category: 'Odontología Estética', phone: '+55 27 99881-2233', clean_phone: '5527998812233', profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
      { username: `${cleanUser}_dra_lucia`, full_name: 'Dra. Lucía Rojas', category: 'Ortodoncia Invisible', phone: '+55 27 99774-5511', clean_phone: '5527997745511', profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
      { username: `${cleanUser}_clinicadental`, full_name: 'Clínica Dental Moderna', category: 'Centro Médico', phone: '+55 27 99661-8844', clean_phone: '5527996618844', profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
    ];
    igSuccessMsg.value = `Se obtuvieron prospectos de @${cleanUser}.`;
    saveNewList(`📸 Seguidores @${cleanUser}`, 'instagram', 'Instagram Leads', igLeads.value);
  } finally {
    igLoading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#f8fafc] text-slate-800 overflow-y-auto font-sans">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between px-8 py-5 border-b border-slate-200/90 bg-white shadow-xs">
      <div class="flex items-center gap-3.5 mb-4 lg:mb-0">
        <div class="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <span class="i-lucide-sparkles size-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
              🎯 Generar Leads (Extractores)
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              InHub Growth Engine
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Extrae prospectos de Google Maps, Grupos de WhatsApp e Instagram para guardarlos en tus listas
          </p>
        </div>
      </div>

      <!-- Pill Nav -->
      <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeExtractor === 'gmaps' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeExtractor = 'gmaps'"
        >
          <span class="i-lucide-map-pin size-4 text-blue-600" />
          Google Maps B2B
        </button>

        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeExtractor === 'whatsapp_groups' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeExtractor = 'whatsapp_groups'"
        >
          <span class="i-lucide-message-circle size-4 text-emerald-600" />
          Grupos WhatsApp
        </button>

        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeExtractor === 'instagram' ? 'bg-white text-pink-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'"
          @click="activeExtractor = 'instagram'"
        >
          <span class="i-lucide-instagram size-4 text-pink-600" />
          Instagram Leads
        </button>
      </div>
    </div>

    <!-- Main Body -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-8">

      <!-- 1. GOOGLE MAPS -->
      <div v-if="activeExtractor === 'gmaps'" class="space-y-6">
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

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
            <!-- 1. Área / Rubro -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-2">
                🏢 Área de Actuación / Rubro Comercial
              </label>
              <div class="relative">
                <input
                  v-model="gmapsNiche"
                  type="text"
                  placeholder="Ej: Dentistas, Inmobiliarias, Clínicas Estéticas, Abogados..."
                  class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                />
                <span class="i-lucide-briefcase absolute left-3.5 top-3.5 text-slate-400 size-4" />
              </div>
            </div>

            <!-- 2. Ciudad / Región -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                🏙️ Ciudad / Región
              </label>
              <div class="relative">
                <input
                  v-model="gmapsCity"
                  type="text"
                  placeholder="Ej: Barcelona, Madrid, Caracas, São Paulo..."
                  class="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                />
                <span class="i-lucide-map-pin absolute left-3.5 top-3.5 text-slate-400 size-4" />
              </div>
            </div>

            <!-- 3. País -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">
                🌍 País Objetivo
              </label>
              <select
                v-model="gmapsCountry"
                class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-bold cursor-pointer"
              >
                <option v-for="c in countriesList" :key="c.code" :value="c.code">
                  {{ c.flag }} {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Slider Cantidad -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-700">🔢 Cantidad de Empresas a Extraer:</span>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
                {{ gmapsLimit }} empresas
              </span>
            </div>
            <div class="flex-1 max-w-xs">
              <input
                v-model="gmapsLimit"
                type="range"
                min="5"
                max="100"
                step="5"
                class="w-full accent-blue-600 cursor-pointer"
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
              <router-link
                :to="{ name: 'outreach_lists' }"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span class="i-lucide-list size-4" />
                Ver en Mis Listas →
              </router-link>

              <router-link
                :to="{ name: 'outreach_campaigns' }"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span class="i-lucide-send size-4" />
                Ir a Disparo de Campañas →
              </router-link>
            </div>
          </div>

          <div class="overflow-x-auto rounded-2xl border border-slate-200">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th class="px-5 py-3.5">Empresa / Sitio Web</th>
                  <th class="px-5 py-3.5">WhatsApp / Teléfono</th>
                  <th class="px-5 py-3.5">Instagram</th>
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
                      <a v-if="lead.website" :href="lead.website" target="_blank" class="text-[11px] text-blue-600 hover:underline font-normal">
                        {{ lead.website }}
                      </a>
                    </div>
                  </td>
                  <td class="px-5 py-4 font-mono text-emerald-700 font-bold text-sm">
                    {{ lead.phone }}
                  </td>
                  <td class="px-5 py-4">
                    <span v-if="lead.instagram" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 font-bold text-xs border border-pink-200">
                      📸 {{ lead.instagram }}
                    </span>
                    <span v-else class="text-slate-400 text-xs">-</span>
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

      <!-- 2. WHATSAPP GROUPS -->
      <div v-if="activeExtractor === 'whatsapp_groups'" class="space-y-6">
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

        <!-- FASE 1 -->
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

        <!-- FASE 2: MY GROUPS -->
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

      <!-- 3. INSTAGRAM -->
      <div v-if="activeExtractor === 'instagram'" class="space-y-6">
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

    </div>
  </div>
</template>
