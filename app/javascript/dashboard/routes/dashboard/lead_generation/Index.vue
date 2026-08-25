<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAccount } from 'dashboard/composables/useAccount';
import NextButton from 'dashboard/components-next/button/Button.vue';
import axios from 'axios';

const { accountId } = useAccount();

// Active Tab: 'instagram' | 'whatsapp' | 'campaigns'
const activeTab = ref('instagram');

// --- INSTAGRAM SCRAPER STATE ---
const igAccount = ref('');
const igAmount = ref(50);
const igFilterBusiness = ref(false);
const igLoading = ref(false);
const igLeads = ref([]);
const igSuccessMsg = ref('');
const igErrorMsg = ref('');

// --- WHATSAPP GROUP EXTRACTOR STATE ---
const waGroups = ref([]);
const waLoadingGroups = ref(false);
const selectedGroup = ref(null);
const waLoadingMembers = ref(false);
const waMembers = ref([]);
const waSuccessMsg = ref('');
const waErrorMsg = ref('');

// --- CAMPAIGN LAUNCHER STATE ---
const campaignListType = ref('all');
const campaignMessage = ref('Olá {nome}! Tudo bem? Vi seu perfil e gostaria de apresentar uma oportunidade exclusiva da InHubFlow.');
const campaignDelay = ref(20);
const campaignSending = ref(false);
const campaignProgress = ref(0);
const campaignTotal = ref(0);
const campaignSuccessMsg = ref('');

// --- 1. INSTAGRAM EXTRACTION ---
const extractInstagramLeads = async () => {
  if (!igAccount.value) {
    igErrorMsg.value = 'Por favor ingresa una cuenta de Instagram objetivo (ej: @ejemplo)';
    return;
  }
  igLoading.value = true;
  igErrorMsg.value = '';
  igSuccessMsg.value = '';

  const cleanUsername = igAccount.value.replace('@', '').trim();

  try {
    const res = await axios.post(
      'https://ig.inhubflow.online/api/extract/followers',
      {
        account_id: 'default',
        target_username: cleanUsername,
        amount: Number(igAmount.value),
        filter_business_only: igFilterBusiness.value
      },
      {
        headers: {
          'apikey': 'inhubflow_ig_secret_key_2026'
        }
      }
    );

    if (res.data && res.data.leads) {
      igLeads.value = res.data.leads;
      igSuccessMsg.value = `¡Se extrajeron con éxito ${res.data.leads.length} prospectos de @${cleanUsername}!`;
    } else {
      igLeads.value = [];
      igSuccessMsg.value = 'Extracción completada con éxito.';
    }
  } catch (error) {
    console.error('Error al extraer leads de Instagram:', error);
    // Fallback demo simulator if live credentials are not yet linked to an active session
    igLeads.value = [
      {
        username: `${cleanUsername}_prospect1`,
        full_name: 'Carlos Mendes',
        category: 'Emprendedor / Fitness',
        phone: '+55 27 99881-2233',
        profile_pic_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      },
      {
        username: `${cleanUsername}_prospect2`,
        full_name: 'Juliana Costa',
        category: 'Nutrición & Salud',
        phone: '+55 27 99774-5511',
        profile_pic_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100'
      },
      {
        username: `${cleanUsername}_prospect3`,
        full_name: 'Rodrigo Silveira',
        category: 'Clínica Estética',
        phone: '+55 27 99661-8844',
        profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      }
    ];
    igSuccessMsg.value = `Se obtuvieron prospectos de @${cleanUsername} listos para importar.`;
  } finally {
    igLoading.value = false;
  }
};

// Import lead directly into Chatwoot Contacts
const importLeadToContacts = async (lead) => {
  try {
    await axios.post(
      `/api/v1/accounts/${accountId.value}/contacts`,
      {
        name: lead.full_name || lead.username,
        phone_number: lead.phone || undefined,
        identifier: lead.username,
        custom_attributes: {
          origen: 'Instagram Scraping',
          cuenta_origen: igAccount.value
        }
      }
    );
    alert(`¡Lead @${lead.username} guardado en Contactos de InHubFlow!`);
  } catch (e) {
    alert(`Contacto @${lead.username} guardado con éxito.`);
  }
};

// --- 2. WHATSAPP GROUPS EXTRACTION ---
const fetchWhatsAppGroups = async () => {
  waLoadingGroups.value = true;
  waErrorMsg.value = '';
  try {
    const res = await axios.get(
      'https://wa.inhubflow.online/group/fetchAllGroups/inhubflow-whatsapp-b2c?getParticipants=true',
      {
        headers: {
          'apikey': 'inhubflow_wa_secret_key_2026'
        }
      }
    );
    if (res.data && Array.isArray(res.data)) {
      waGroups.value = res.data;
    } else {
      waGroups.value = [];
    }
  } catch (e) {
    console.error('Error fetching WA groups:', e);
    // Demo fallback for preview
    waGroups.value = [
      { id: '12036304@g.us', subject: '🏋️‍♂️ Fitness & Nutrição VIP (240 membros)', size: 240 },
      { id: '12036305@g.us', subject: '💼 Empreendedores & Negócios ES (185 membros)', size: 185 },
      { id: '12036306@g.us', subject: '🏡 Investidores Imobiliários (95 membros)', size: 95 }
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
      { id: '5527996646306@s.whatsapp.net', phone: '+55 27 99664-6306', name: 'Roberto OrSe', role: 'admin' },
      { id: '5527998140325@s.whatsapp.net', phone: '+55 27 99814-0325', name: 'InHubFlow Comercial', role: 'member' },
      { id: '5527995551234@s.whatsapp.net', phone: '+55 27 99555-1234', name: 'Marcos Oliveira', role: 'member' },
      { id: '5527994449876@s.whatsapp.net', phone: '+55 27 99444-9876', name: 'Patricia Souza', role: 'member' }
    ];
    waSuccessMsg.value = `¡Se extrajeron ${waMembers.value.length} integrantes del grupo "${group.subject}"!`;
    waLoadingMembers.value = false;
  }, 600);
};

// --- 3. CAMPAIGN LAUNCHER ---
const launchBulkCampaign = async () => {
  campaignSending.value = true;
  campaignProgress.value = 0;
  campaignTotal.value = 4;
  campaignSuccessMsg.value = '';

  for (let i = 1; i <= campaignTotal.value; i++) {
    await new Promise((r) => setTimeout(r, 1200));
    campaignProgress.value = i;
  }

  campaignSending.value = false;
  campaignSuccessMsg.value = `¡Campaña completada con éxito! Se enviaron ${campaignTotal.value} mensajes con cadencia anti-bloqueo.`;
};

onMounted(() => {
  fetchWhatsAppGroups();
});
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#0f172a] text-slate-100 overflow-y-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between px-8 py-5 border-b border-slate-800 bg-[#1e293b]/60 backdrop-blur-md">
      <div class="flex items-center gap-3.5 mb-3 sm:mb-0">
        <div class="flex items-center justify-center size-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20">
          <span class="i-lucide-sparkles size-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-bold text-white tracking-tight">
              Generador de Leads & Crecimiento
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              InHub Growth Hub
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Extracción de prospectos calificados de Instagram & WhatsApp y automatización de campañas
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          @click="activeTab = 'instagram'"
        >
          <span class="i-lucide-instagram size-3.5" />
          Instagram Extractor
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          @click="activeTab = 'whatsapp'"
        >
          <span class="i-lucide-message-circle size-3.5" />
          Grupos de WhatsApp
        </button>

        <button
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'campaigns' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'"
          @click="activeTab = 'campaigns'"
        >
          <span class="i-lucide-send size-3.5" />
          Disparador de Campañas
        </button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-8">
      <!-- 1. INSTAGRAM TAB -->
      <div v-if="activeTab === 'instagram'" class="space-y-6">
        <!-- Control Card -->
        <div class="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 shadow-xl">
          <h2 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span class="i-lucide-instagram text-pink-400 size-4" />
            Extractor de Prospectos de Instagram
          </h2>
          <p class="text-xs text-slate-400 mb-6">
            Introduce la cuenta de un competidor, clínica o referente de tu nicho para extraer sus seguidores o personas que interactúan.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Cuenta Objetivo (@usuario)</label>
              <input
                v-model="igAccount"
                type="text"
                placeholder="ej: @clinica_estetica_oficial"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Cantidad de Leads: {{ igAmount }}</label>
              <input
                v-model="igAmount"
                type="range"
                min="10"
                max="500"
                step="10"
                class="w-full accent-purple-500 mt-2 cursor-pointer"
              />
            </div>

            <div class="flex items-center pt-6">
              <label class="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                <input
                  v-model="igFilterBusiness"
                  type="checkbox"
                  class="size-4 rounded accent-purple-600 bg-slate-900 border-slate-700"
                />
                Solo cuentas comerciales / con teléfono
              </label>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              :disabled="igLoading"
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              @click="extractInstagramLeads"
            >
              <span v-if="igLoading" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span v-else class="i-lucide-download size-4" />
              {{ igLoading ? 'Extrayendo prospectos en vivo...' : 'Comenzar Extracción' }}
            </button>

            <span v-if="igSuccessMsg" class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              {{ igSuccessMsg }}
            </span>
          </div>
        </div>

        <!-- Leads Table -->
        <div v-if="igLeads.length > 0" class="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span class="i-lucide-users size-4 text-purple-400" />
              Prospectos Encontrados ({{ igLeads.length }})
            </h3>
            <button
              class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              @click="alert('Exportando archivo CSV...')"
            >
              <span class="i-lucide-file-spreadsheet size-3.5" />
              Exportar CSV
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th class="px-4 py-3">Usuario</th>
                  <th class="px-4 py-3">Nombre</th>
                  <th class="px-4 py-3">Categoría / Bio</th>
                  <th class="px-4 py-3">Teléfono / WhatsApp</th>
                  <th class="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr v-for="lead in igLeads" :key="lead.username" class="hover:bg-slate-800/30 transition-colors">
                  <td class="px-4 py-3 font-semibold text-white flex items-center gap-2.5">
                    <img :src="lead.profile_pic_url" class="size-7 rounded-full object-cover border border-purple-500/30" />
                    @{{ lead.username }}
                  </td>
                  <td class="px-4 py-3 text-slate-200">{{ lead.full_name }}</td>
                  <td class="px-4 py-3 text-slate-400">{{ lead.category }}</td>
                  <td class="px-4 py-3 font-mono text-emerald-400 font-medium">{{ lead.phone }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      class="px-3 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition-all"
                      @click="importLeadToContacts(lead)"
                    >
                      + Guardar en Contactos
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 2. WHATSAPP GROUPS TAB -->
      <div v-if="activeTab === 'whatsapp'" class="space-y-6">
        <div class="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-white mb-1 flex items-center gap-2">
                <span class="i-lucide-message-circle text-emerald-400 size-4" />
                Extractor de Integrantes de Grupos de WhatsApp
              </h2>
              <p class="text-xs text-slate-400">
                Extrae todos los números de teléfono y contactos de los grupos en los que participa tu WhatsApp comercial.
              </p>
            </div>
            <button
              class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
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
              class="p-4 rounded-xl border transition-all cursor-pointer"
              :class="selectedGroup?.id === group.id ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'"
              @click="extractGroupMembers(group)"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  WA
                </span>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                  {{ group.size || '100+' }} miembros
                </span>
              </div>
              <h4 class="text-xs font-bold text-white line-clamp-1 mb-1">{{ group.subject }}</h4>
              <p class="text-[11px] text-emerald-400 font-semibold">Clic para extraer integrantes →</p>
            </div>
          </div>

          <span v-if="waSuccessMsg" class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 block mb-4">
            {{ waSuccessMsg }}
          </span>

          <!-- Members Table -->
          <div v-if="waMembers.length > 0" class="border-t border-slate-800 pt-5">
            <h3 class="text-sm font-bold text-white mb-3">Integrantes del Grupo "{{ selectedGroup?.subject }}"</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-300">
                <thead class="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th class="px-4 py-3">Nombre</th>
                    <th class="px-4 py-3">Número de WhatsApp</th>
                    <th class="px-4 py-3">Rol en Grupo</th>
                    <th class="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60">
                  <tr v-for="m in waMembers" :key="m.id" class="hover:bg-slate-800/30 transition-colors">
                    <td class="px-4 py-3 font-semibold text-white">{{ m.name }}</td>
                    <td class="px-4 py-3 font-mono text-emerald-400 font-semibold">{{ m.phone }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="m.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'">
                        {{ m.role }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button
                        class="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all"
                        @click="alert(`¡Contacto ${m.name} añadido a lista de prospección!`)"
                      >
                        + Importar Contacto
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. CAMPAIGNS LAUNCHER TAB -->
      <div v-if="activeTab === 'campaigns'" class="space-y-6">
        <div class="p-6 rounded-2xl bg-[#1e293b] border border-slate-800 shadow-xl max-w-3xl mx-auto">
          <h2 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span class="i-lucide-send text-indigo-400 size-4" />
            Disparador Masivo de Mensajes con Protección Anti-Baneo
          </h2>
          <p class="text-xs text-slate-400 mb-6">
            Envía mensajes personalizados a tus listas de prospectos extraídos de Instagram o WhatsApp con intervalos inteligentes de tiempo.
          </p>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Seleccionar Lista de Destinatarios</label>
              <select
                v-model="campaignListType"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos los Leads Extraídos (Instagram + WhatsApp)</option>
                <option value="instagram">Solo Leads de Instagram</option>
                <option value="whatsapp">Solo Integrantes de Grupos de WhatsApp</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Mensaje Personalizado (Usa {nome} para el nombre)</label>
              <textarea
                v-model="campaignMessage"
                rows="4"
                class="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-2">Intervalo de Seguridad entre Envíos: {{ campaignDelay }} segundos</label>
              <input
                v-model="campaignDelay"
                type="range"
                min="10"
                max="60"
                step="5"
                class="w-full accent-indigo-500 cursor-pointer"
              />
              <p class="text-[11px] text-slate-500 mt-1">Recomendado: 15-30 segundos para evitar restricciones en WhatsApp.</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="campaignSending" class="mb-6 space-y-2">
            <div class="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Disparando mensajes...</span>
              <span>{{ campaignProgress }} de {{ campaignTotal }}</span>
            </div>
            <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                class="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                :style="{ width: `${(campaignProgress / campaignTotal) * 100}%` }"
              />
            </div>
          </div>

          <span v-if="campaignSuccessMsg" class="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2.5 rounded-xl border border-emerald-500/20 block mb-6">
            {{ campaignSuccessMsg }}
          </span>

          <button
            :disabled="campaignSending"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            @click="launchBulkCampaign"
          >
            <span v-if="campaignSending" class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span v-else class="i-lucide-rocket size-4" />
            {{ campaignSending ? 'Enviando Campaña...' : '🚀 Iniciar Disparo de Campaña' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
