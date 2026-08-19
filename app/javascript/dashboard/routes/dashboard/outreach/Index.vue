<script setup>
import { ref, computed } from 'vue';
import { useAccount } from 'dashboard/composables/useAccount';
import { useMapGetter } from 'dashboard/composables/store';
import { FEATURE_FLAGS } from 'dashboard/featureFlags';
import NextButton from 'dashboard/components-next/button/Button.vue';

const { accountId, currentAccount } = useAccount();
const isFeatureEnabledonAccount = useMapGetter(
  'accounts/isFeatureEnabledonAccount'
);

const isOutreachEnabled = computed(() => {
  return isFeatureEnabledonAccount.value(
    accountId.value,
    FEATURE_FLAGS.B2B_OUTREACH
  );
});

// Admin preview toggle for testing purposes
const previewActive = ref(false);
const showWorkspace = computed(() => isOutreachEnabled.value || previewActive.value);

const iframeLoading = ref(true);
const iframeUrl = computed(() => {
  const host = window.location.hostname;
  const port = '3456';
  const protocol = window.location.protocol;
  return `${protocol}//${host}:${port}/?accountId=${accountId.value}&embed=true`;
});

const onIframeLoaded = () => {
  iframeLoading.value = false;
};
</script>

<template>
  <div class="flex flex-col flex-1 h-full w-full min-h-0 bg-n-surface-1 overflow-y-auto">
    <!-- Active B2B Outreach Workspace (Plan Pro) -->
    <template v-if="showWorkspace">
      <div class="flex items-center justify-between px-6 py-3 border-b border-n-strong bg-n-surface-2">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center size-8 rounded-lg bg-blue-500/10 text-blue-500 font-bold">
            <span class="i-lucide-send size-4" />
          </div>
          <div>
            <h1 class="text-sm font-semibold text-n-slate-12">
              Prospección B2B & Outreach (LinkedIn & Cold Email)
            </h1>
            <p class="text-xs text-n-slate-11">
              Espacio de trabajo conectado a la Cuenta #{{ accountId }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span
            v-if="previewActive && !isOutreachEnabled"
            class="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20"
          >
            Modo Vista Previa (Admin)
          </span>
          <NextButton
            variant="faded"
            color="slate"
            size="sm"
            @click="iframeLoading = true"
          >
            <span class="i-lucide-refresh-cw size-3.5 mr-1" />
            Recargar Módulo
          </NextButton>
        </div>
      </div>

      <!-- Embedded App Container -->
      <div class="relative flex-1 w-full min-h-0 overflow-hidden bg-n-surface-1">
        <div
          v-if="iframeLoading"
          class="absolute inset-0 flex flex-col items-center justify-center bg-n-surface-1/80 backdrop-blur-sm z-10"
        >
          <div class="size-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p class="text-xs text-n-slate-11">Cargando motor de prospección B2B...</p>
        </div>
        <iframe
          :key="iframeUrl"
          :src="iframeUrl"
          class="w-full h-full border-0"
          allow="clipboard-read; clipboard-write"
          @load="onIframeLoaded"
        />
      </div>
    </template>

    <!-- Plan B2C Paywall / Upgrade Screen (Plan Base) -->
    <template v-else>
      <div class="flex flex-col items-center justify-center flex-1 max-w-4xl mx-auto px-6 py-12 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#465fff]/10 text-[#465fff] border border-[#465fff]/25 mb-6 shadow-sm">
          <span class="i-lucide-sparkles size-3.5" />
          Módulo B2B Pro · InHubFlow
        </div>

        <!-- Heading -->
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-n-slate-12 mb-4 font-sans">
          Escala tus ventas B2B con Prospección Automatizada en LinkedIn
        </h1>
        <p class="text-base text-n-slate-11 max-w-2xl mb-10">
          Tu plan actual (B2C) incluye WhatsApp, Instagram y Chat en vivo. Desbloquea el <strong class="text-n-slate-12">Plan B2B</strong> para generar reuniones calificadas automáticamente con tomadores de decisión.
        </p>

        <!-- Feature Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-12">
          <!-- Card 1 -->
          <div class="p-6 rounded-2xl bg-n-surface-2 border border-n-strong hover:border-[#465fff]/40 transition-all shadow-sm">
            <div class="size-11 rounded-xl bg-[#465fff]/10 text-[#465fff] flex items-center justify-center mb-4">
              <span class="i-lucide-linkedin size-5" />
            </div>
            <h3 class="text-base font-semibold text-n-slate-12 mb-2">Automatización de LinkedIn</h3>
            <p class="text-xs leading-relaxed text-n-slate-11">
              Visitas a perfiles, envío de solicitudes de conexión y mensajes de seguimiento con cadencia y protección anti-baneo.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="p-6 rounded-2xl bg-n-surface-2 border border-n-strong hover:border-[#465fff]/40 transition-all shadow-sm">
            <div class="size-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <span class="i-lucide-mail size-5" />
            </div>
            <h3 class="text-base font-semibold text-n-slate-12 mb-2">Secuencias de Cold Email</h3>
            <p class="text-xs leading-relaxed text-n-slate-11">
              Combina LinkedIn y correo electrónico en flujos paralelos con pruebas A/B y calentamiento progresivo de cuentas.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="p-6 rounded-2xl bg-n-surface-2 border border-n-strong hover:border-[#465fff]/40 transition-all shadow-sm">
            <div class="size-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <span class="i-lucide-database-zap size-5" />
            </div>
            <h3 class="text-base font-semibold text-n-slate-12 mb-2">Enriquecimiento con Apollo</h3>
            <p class="text-xs leading-relaxed text-n-slate-11">
              Importa listas de Sales Navigator y obtén emails corporativos verificados y datos de la empresa en un solo clic.
            </p>
          </div>
        </div>

        <!-- CTA & Actions -->
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <NextButton
            variant="solid"
            color="blue"
            size="lg"
            class="px-8 font-semibold shadow-lg shadow-blue-500/20"
          >
            <span class="i-lucide-rocket size-4 mr-2" />
            Actualizar a Plan B2B
          </NextButton>

          <NextButton
            variant="faded"
            color="slate"
            size="lg"
            @click="previewActive = !previewActive"
          >
            <span class="i-lucide-eye size-4 mr-2" />
            {{ previewActive ? 'Ocultar Vista Previa' : 'Vista Previa del Módulo' }}
          </NextButton>
        </div>

        <p class="text-xs text-n-slate-10 mt-4">
          Activación inmediata sin interrupción del servicio.
        </p>
      </div>
    </template>
  </div>
</template>
