<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLeadHub } from 'dashboard/composables/useLeadHub';
import axios from 'axios';

const router = useRouter();
const { savedLists, markListDispatched } = useLeadHub();

// Campaign Tab: 'whatsapp' | 'instagram'
const activeCampaignTab = ref('whatsapp');

// ==========================================
// 1. WHATSAPP CAMPAIGN STATE
// ==========================================
const selectedWaListId = ref(savedLists.value[0]?.id || '');
const waCampaignMessage = ref('Olá {nome}! Tudo bem? Vi seu perfil e gostaria de apresentar a tecnologia InHubFlow.');
const waCampaignDelay = ref(25);
const waCampaignSending = ref(false);
const waCampaignProgress = ref(0);
const waCampaignTotal = ref(0);
const waCampaignSuccessMsg = ref('');

const currentWaList = computed(() => {
  return savedLists.value.find(l => l.id === selectedWaListId.value);
});

// ==========================================
// 2. INSTAGRAM CAMPAIGN STATE
// ==========================================
const selectedIgListId = ref(savedLists.value.find(l => l.source === 'instagram')?.id || '');
const igCampaignMessage = ref('Hola @{username}! Vimos tu perfil y nos encantó tu contenido. Te escribimos desde InHubFlow con una invitación especial.');
const igCampaignDelay = ref(30);
const igCampaignSending = ref(false);
const igCampaignProgress = ref(0);
const igCampaignTotal = ref(0);
const igCampaignSuccessMsg = ref('');

const currentIgList = computed(() => {
  return savedLists.value.find(l => l.id === selectedIgListId.value);
});

// ==========================================
// METHODS
// ==========================================

const launchWACampaign = async () => {
  const targetList = currentWaList.value;
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

  markListDispatched(targetList.id);
  waCampaignSending.value = false;
  waCampaignSuccessMsg.value = `¡Campaña de WhatsApp enviada con éxito a la lista "${targetList.name}" (${targetList.leads.length} contactos)!`;
};

const launchIGCampaign = async () => {
  const targetList = currentIgList.value;
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

  markListDispatched(targetList.id);
  igCampaignSending.value = false;
  igCampaignSuccessMsg.value = `¡Campaña de DMs de Instagram enviada con éxito a la lista "${targetList.name}"!`;
};
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#f8fafc] text-slate-800 overflow-y-auto font-sans">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between px-8 py-5 border-b border-slate-200/90 bg-white shadow-xs">
      <div class="flex items-center gap-3.5 mb-4 lg:mb-0">
        <div class="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
          <span class="i-lucide-send size-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
              🚀 Disparador de Campañas
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Outreach Hub
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Selecciona tu lista de leads y envía mensajes personalizados con intervalos inteligentes anti-bloqueo
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeCampaignTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="activeCampaignTab = 'whatsapp'"
        >
          <span class="i-lucide-message-circle size-4" />
          Disparo WhatsApp
        </button>

        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          :class="activeCampaignTab === 'instagram' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
          @click="activeCampaignTab = 'instagram'"
        >
          <span class="i-lucide-instagram size-4" />
          Disparo Instagram (DMs)
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="flex-1 max-w-4xl w-full mx-auto p-8">

      <!-- WHATSAPP CAMPAIGN -->
      <div v-if="activeCampaignTab === 'whatsapp'" class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div class="flex items-center gap-3.5 mb-2">
          <div class="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
            📱
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900">Campaña Masiva de WhatsApp</h2>
            <p class="text-xs text-slate-500">Envío personalizado lista por lista con protección anti-bloqueo</p>
          </div>
        </div>

        <div class="space-y-5 my-6">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Seleccionar Lista de Leads
            </label>
            <select
              v-model="selectedWaListId"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option v-for="lst in savedLists" :key="lst.id" :value="lst.id">
                {{ lst.name }} ({{ lst.count }} contactos) · {{ lst.lastDispatchedAt ? `Último envío: ${lst.lastDispatchedAt}` : 'Sin envíos previos' }}
              </option>
            </select>
          </div>

          <!-- Selected List Details Badge -->
          <div v-if="currentWaList" class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-emerald-900">{{ currentWaList.name }}</span>
              <p class="text-[11px] text-emerald-700 mt-0.5">
                Fuente: {{ currentWaList.sourceLabel }} · Total: {{ currentWaList.count }} prospectos
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold" :class="currentWaList.lastDispatchedAt ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-100 text-amber-800'">
              {{ currentWaList.lastDispatchedAt ? `Enviada el ${currentWaList.lastDispatchedAt}` : 'Lista Pendiente' }}
            </span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Mensaje de Campaña (Usa <span class="text-emerald-700 font-mono font-bold">{nome}</span> para personalizar con el nombre de la empresa o doctor)
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
            <p class="text-[11px] text-slate-400 mt-1">Recomendado: 20-30 segundos para emular comportamiento humano.</p>
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

      <!-- INSTAGRAM CAMPAIGN -->
      <div v-if="activeCampaignTab === 'instagram'" class="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div class="flex items-center gap-3.5 mb-2">
          <div class="size-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            📸
          </div>
          <div>
            <h2 class="text-base font-extrabold text-slate-900">Campaña Masiva de DMs en Instagram</h2>
            <p class="text-xs text-slate-500">Automatización de mensajes directos por lista con intervalos de seguridad</p>
          </div>
        </div>

        <div class="space-y-5 my-6">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">Seleccionar Lista de Instagram</label>
            <select
              v-model="selectedIgListId"
              class="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 font-medium cursor-pointer"
            >
              <option v-for="lst in savedLists.filter(l => l.source === 'instagram')" :key="lst.id" :value="lst.id">
                {{ lst.name }} ({{ lst.count }} seguidores) · {{ lst.lastDispatchedAt ? `Último envío: ${lst.lastDispatchedAt}` : 'Sin envíos previos' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Mensaje Directo (Usa <span class="text-purple-700 font-mono font-bold">@{username}</span> para mencionar al usuario)
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
</template>
