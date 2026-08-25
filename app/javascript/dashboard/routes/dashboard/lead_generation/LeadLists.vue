<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLeadHub } from 'dashboard/composables/useLeadHub';

const router = useRouter();
const { savedLists, deleteList } = useLeadHub();

const selectedViewingList = ref(null);

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
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-[#f8fafc] text-slate-800 overflow-y-auto font-sans">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between px-8 py-5 border-b border-slate-200/90 bg-white shadow-xs">
      <div class="flex items-center gap-3.5 mb-4 lg:mb-0">
        <div class="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20">
          <span class="i-lucide-list size-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-slate-900 tracking-tight">
              📋 Listas de Leads Guardadas
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {{ savedLists.length }} Listas Activas
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Histórico y administración de todas tus extracciones de Google Maps, Grupos de WhatsApp e Instagram
          </p>
        </div>
      </div>

      <router-link
        :to="{ name: 'outreach_dashboard_index' }"
        class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
      >
        <span class="i-lucide-plus size-4" />
        + Extraer Nuevos Leads
      </router-link>
    </div>

    <!-- Main Container -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6">
      <!-- Lists Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="list in savedLists"
          :key="list.id"
          class="p-6 rounded-3xl bg-white border-2 transition-all flex flex-col justify-between shadow-xs"
          :class="selectedViewingList?.id === list.id ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200/90 hover:border-indigo-300'"
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
          <div class="flex items-center gap-2 pt-4 border-t border-slate-100">
            <button
              class="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              @click="selectedViewingList = list"
            >
              👁️ Ver Contactos
            </button>
            <button
              class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              title="Descargar CSV"
              @click="downloadCSVForList(list)"
            >
              <span class="i-lucide-download size-4 text-slate-700" />
            </button>
            <router-link
              :to="{ name: 'outreach_campaigns' }"
              class="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
              title="Lanzar Campaña"
            >
              <span class="i-lucide-send size-4" />
            </router-link>
            <button
              class="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
              title="Eliminar Lista"
              @click="deleteList(list.id)"
            >
              <span class="i-lucide-trash-2 size-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Selected List Contacts Table -->
      <div v-if="selectedViewingList" class="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm mt-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
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
            <router-link
              :to="{ name: 'outreach_campaigns' }"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span class="i-lucide-send size-4" />
              Disparar Campaña WhatsApp →
            </router-link>
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
</template>
