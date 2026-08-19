<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';
import { useI18n } from 'vue-i18n';
import Auth from 'dashboard/api/auth';

const currentUser = useMapGetter('getCurrentUser');
const { locale } = useI18n();

const isSuiteOpen = ref(false);
const isUserOpen = ref(false);
const isLangOpen = ref(false);

const suiteRef = ref(null);
const userRef = ref(null);
const langRef = ref(null);

const userEmail = computed(() => currentUser.value?.email || 'admin@inhubflow.online');
const userName = computed(() => currentUser.value?.available_name || currentUser.value?.name || 'InHub Admin');
const userAvatar = computed(() => currentUser.value?.avatar_url || '');
const userInitial = computed(() => (userName.value ? userName.value.charAt(0).toUpperCase() : 'I'));

const currentLocaleLabel = computed(() => {
  const loc = (locale.value || 'pt_BR').toLowerCase();
  if (loc.includes('pt')) return 'PT-BR';
  if (loc.includes('es')) return 'ES';
  if (loc.includes('en')) return 'EN';
  return 'ES';
});

const handleClickOutside = (event) => {
  if (suiteRef.value && !suiteRef.value.contains(event.target)) {
    isSuiteOpen.value = false;
  }
  if (userRef.value && !userRef.value.contains(event.target)) {
    isUserOpen.value = false;
  }
  if (langRef.value && !langRef.value.contains(event.target)) {
    isLangOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleLogout = () => {
  Auth.logout();
};
</script>

<template>
  <header class="flex shrink-0 h-16 w-full items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 px-4 sm:px-6 backdrop-blur-md transition-colors z-30">
    <!-- Left Section: InHub Omnichannel Pill Badge -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-xs">
          <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>InHub Omnichannel</span>
          <span class="text-[10px] text-emerald-500/80 uppercase font-semibold pl-1">B2C</span>
        </div>
      </div>
    </div>

    <!-- Right Section: Controls matching Linki style -->
    <div class="flex items-center gap-2.5 sm:gap-3">
      <!-- 1. App Switcher (InHubFlow Suite) -->
      <div ref="suiteRef" class="relative">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xs"
          title="InHubFlow Suite Apps"
          @click="isSuiteOpen = !isSuiteOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="isSuiteOpen"
          class="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-xl backdrop-blur-md z-50 animate-fadeIn"
        >
          <div class="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              InHubFlow Suite
            </p>
          </div>

          <div class="space-y-1">
            <!-- App 1: Linki B2B -->
            <a
              href="https://b2b.inhubflow.online"
              target="_blank"
              class="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-base font-bold">
                🚀
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-xs font-bold text-gray-900 dark:text-white truncate">
                  InHub Outreach (B2B)
                </p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  LinkedIn & Cold Email Sequences
                </p>
              </div>
            </a>

            <!-- App 2: Chatwoot B2C (Active) -->
            <div class="flex items-center gap-3 rounded-xl p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white text-base font-bold">
                💬
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                  InHub Omnichannel (B2C)
                </p>
                <p class="text-[11px] text-emerald-600 dark:text-emerald-400 truncate">
                  WhatsApp, Instagram & SDR IA (Activo)
                </p>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-500" />
            </div>

            <!-- App 3: InHubFlow Landing -->
            <a
              href="https://inhubflow.online"
              target="_blank"
              class="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/60"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-base font-bold">
                ⚡
              </div>
              <div class="flex-1 min-w-0 text-left">
                <p class="text-xs font-bold text-gray-900 dark:text-white truncate">
                  InHubFlow Portal
                </p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                  Planes, Precios & Facturación
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- 2. Language Badge -->
      <div class="flex h-10 items-center gap-1.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        <span>{{ currentLocaleLabel }}</span>
      </div>

      <!-- 3. User Avatar Pill matching Linki -->
      <div ref="userRef" class="relative">
        <button
          type="button"
          class="flex h-10 items-center gap-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5 pr-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xs"
          @click="isUserOpen = !isUserOpen"
        >
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs">
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="userName"
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ userInitial }}</span>
          </div>
          <span class="max-w-[140px] sm:max-w-[180px] truncate text-xs font-bold text-gray-800 dark:text-gray-200">
            {{ userEmail }}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- User Dropdown Menu -->
        <div
          v-if="isUserOpen"
          class="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 shadow-xl z-50 animate-fadeIn"
        >
          <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
            <p class="text-xs font-bold text-gray-900 dark:text-white truncate">
              {{ userName }}
            </p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {{ userEmail }}
            </p>
          </div>

          <RouterLink
            :to="{ name: 'profile_settings_index' }"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="isUserOpen = false"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Configuración de Perfil</span>
          </RouterLink>

          <button
            type="button"
            class="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            @click="handleLogout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}
</style>
