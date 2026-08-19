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

const userEmail = computed(() => currentUser.value?.email || 'inhubflow@gmail.com');
const userName = computed(() => currentUser.value?.available_name || currentUser.value?.name || 'InHub Admin');
const userInitial = computed(() => (userEmail.value ? userEmail.value.charAt(0).toUpperCase() : 'I'));

const supportedLanguages = [
  { code: 'pt_BR', label: 'Português (BR)', flag: '🇧🇷', short: 'PT-BR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
];

const currentLang = computed(() => {
  const loc = (locale.value || 'pt_BR').toLowerCase();
  if (loc.includes('pt')) return { flag: '🇧🇷', short: 'PT-BR' };
  if (loc.includes('es')) return { flag: '🇪🇸', short: 'ES' };
  if (loc.includes('en')) return { flag: '🇺🇸', short: 'EN' };
  return { flag: '🇧🇷', short: 'PT-BR' };
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

const toggleTheme = () => {
  const ninja = document.querySelector('ninja-keys');
  if (ninja) {
    ninja.open({ parent: 'appearance_settings' });
  } else {
    document.documentElement.classList.toggle('dark');
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
  <header class="linki-replica-header">
    <!-- Left Section -->
    <div class="header-left">
      <!-- Left Pill Badge -->
      <div class="product-badge">
        <svg class="badge-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
          <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-6.054-2.685z"/>
        </svg>
        <span>InHub Omnichannel</span>
      </div>
    </div>

    <!-- Right Controls Section -->
    <div class="header-right">
      <!-- 1. App Switcher Button (4 Squares Icon) -->
      <div ref="suiteRef" class="popover-container">
        <button
          type="button"
          class="control-btn"
          title="InHubFlow Suite"
          @click="isSuiteOpen = !isSuiteOpen"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M4 4H10V10H4V4ZM4 14H10V20H4V14ZM14 4H20V10H14V4ZM14 14H20V20H14V14ZM2 3C2 2.44772 2.44772 2 3 2H11C11.5523 2 12 2.44772 12 3V11C12 11.5523 11.5523 12 11 12H3C2.44772 12 2 11.5523 2 11V3ZM2 13C2 12.4477 2.44772 12 3 12H11C11.5523 12 12 12.4477 12 13V21C12 21.5523 11.5523 22 11 22H3C2.44772 22 2 21.5523 2 21V13ZM12 3C12 2.44772 12.4477 2 13 2H21C21.5523 2 22 2.44772 22 3V11C22 11.5523 21.5523 12 21 12H13C12.4477 12 12 11.5523 12 11V3ZM12 13C12 12.4477 12.4477 12 13 12H21C21.5523 12 22 12.4477 22 13V21C22 21.5523 21.5523 22 21 22H13C12.4477 22 12 21.5523 12 21V13Z"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div v-if="isSuiteOpen" class="dropdown-popover suite-dropdown">
          <div class="dropdown-header">
            <span>InHubFlow Suite</span>
          </div>

          <div class="dropdown-body">
            <!-- Linki Outreach B2B -->
            <a href="https://b2b.inhubflow.online" target="_blank" class="suite-item">
              <div class="suite-icon blue-bg">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-6.054-2.685z"/>
                </svg>
              </div>
              <div class="suite-text">
                <p class="suite-title">InHub Outreach</p>
                <p class="suite-desc">LinkedIn & Cold Email B2B</p>
              </div>
            </a>

            <!-- Chatwoot Omnichannel B2C (Active) -->
            <div class="suite-item active-app">
              <div class="suite-icon green-solid">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3Z"/>
                </svg>
              </div>
              <div class="suite-text">
                <div class="title-with-badge">
                  <p class="suite-title green-text">InHub Omnichannel</p>
                  <span class="active-badge">Activo</span>
                </div>
                <p class="suite-desc">WhatsApp, Instagram & Live Chat</p>
              </div>
            </div>

            <!-- InHubFlow Landing -->
            <a href="https://inhubflow.online" target="_blank" class="suite-item">
              <div class="suite-icon purple-bg">
                ⚡
              </div>
              <div class="suite-text">
                <p class="suite-title">InHubFlow Portal</p>
                <p class="suite-desc">Planes, Precios & Facturación</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- 2. Dark/Light Mode Button -->
      <button
        type="button"
        class="control-btn"
        title="Alternar Tema"
        @click="toggleTheme"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10 7C10 10.866 13.134 14 17 14C18.7909 14 20.4309 13.3278 21.6823 12.2223C21.8845 13.4308 22 14.6983 22 16C22 20.4183 18.4183 24 14 24C9.58172 24 6 20.4183 6 16C6 11.8317 9.18667 8.39794 13.2384 8.03362C12.4578 8.65089 11.8009 9.42878 11.3195 10.3155C10.4908 9.32439 10 8.2173 10 7Z"/>
        </svg>
      </button>

      <!-- 3. Language Selector Button -->
      <div ref="langRef" class="popover-container">
        <button
          type="button"
          class="control-btn lang-btn"
          @click="isLangOpen = !isLangOpen"
        >
          <span class="flag-icon">{{ currentLang.flag }}</span>
          <span class="lang-text">{{ currentLang.short }}</span>
        </button>

        <div v-if="isLangOpen" class="dropdown-popover lang-dropdown">
          <div class="dropdown-header">
            <span>Idioma / Language</span>
          </div>
          <div class="dropdown-body">
            <RouterLink
              :to="{ name: 'profile_settings_index' }"
              class="suite-item"
              @click="isLangOpen = false"
            >
              <div class="suite-text">
                <p class="suite-title">🇧🇷 Português (Brasil)</p>
              </div>
            </RouterLink>
            <RouterLink
              :to="{ name: 'profile_settings_index' }"
              class="suite-item"
              @click="isLangOpen = false"
            >
              <div class="suite-text">
                <p class="suite-title">🇪🇸 Español</p>
              </div>
            </RouterLink>
            <RouterLink
              :to="{ name: 'profile_settings_index' }"
              class="suite-item"
              @click="isLangOpen = false"
            >
              <div class="suite-text">
                <p class="suite-title">🇺🇸 English</p>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 4. User Profile Pill Button (with Solid Gradient Box Avatar) -->
      <div ref="userRef" class="popover-container">
        <button
          type="button"
          class="user-btn"
          @click="isUserOpen = !isUserOpen"
        >
          <div class="user-avatar-square">
            <span>{{ userInitial }}</span>
          </div>
          <span class="user-email-text">{{ userEmail }}</span>
        </button>

        <div v-if="isUserOpen" class="dropdown-popover user-dropdown">
          <div class="dropdown-header">
            <p class="user-name-bold">{{ userName }}</p>
            <p class="user-email-sub">{{ userEmail }}</p>
          </div>
          <div class="dropdown-body">
            <RouterLink
              :to="{ name: 'profile_settings_index' }"
              class="suite-item"
              @click="isUserOpen = false"
            >
              <div class="suite-text">
                <p class="suite-title">⚙️ Configuración de Perfil</p>
              </div>
            </RouterLink>
            <button
              type="button"
              class="suite-item logout-btn"
              @click="handleLogout"
            >
              <div class="suite-text">
                <p class="suite-title red-text">🚪 Cerrar Sesión</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Linki Exact Header Replica Styling */
.linki-replica-header {
  height: 64px;
  min-height: 64px;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-sizing: border-box;
  z-index: 40;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

:global(.dark) .linki-replica-header {
  background: rgba(15, 23, 42, 0.9);
  border-bottom-color: #1e293b;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Left Pill Badge matching Linki */
.product-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  border-radius: 8px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

:global(.dark) .product-badge {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.badge-icon {
  flex-shrink: 0;
}

/* Right Controls */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .header-right {
    gap: 0.75rem;
  }
}

.popover-container {
  position: relative;
}

/* Square Control Button */
.control-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  padding: 0;
  box-sizing: border-box;
}

:global(.dark) .control-btn {
  background-color: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.control-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

:global(.dark) .control-btn:hover {
  background-color: #334155;
  color: #ffffff;
}

/* Language Button */
.lang-btn {
  width: auto;
  padding: 0 10px;
  gap: 6px;
}

.flag-icon {
  font-size: 14px;
  line-height: 1;
}

.lang-text {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
}

:global(.dark) .lang-text {
  color: #cbd5e1;
}

/* User Button */
.user-btn {
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 4px 12px 4px 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

:global(.dark) .user-btn {
  background-color: #1e293b;
  border-color: #334155;
}

.user-btn:hover {
  background-color: #f3f4f6;
}

:global(.dark) .user-btn:hover {
  background-color: #334155;
}

.user-avatar-square {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.user-email-text {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .user-email-text {
  color: #e2e8f0;
}

/* Dropdown Popovers */
.dropdown-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  z-index: 50;
  box-sizing: border-box;
}

:global(.dark) .dropdown-popover {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

.suite-dropdown {
  width: 280px;
}

.lang-dropdown {
  width: 190px;
}

.user-dropdown {
  width: 220px;
}

.dropdown-header {
  padding: 6px 10px 8px 10px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 4px;
}

:global(.dark) .dropdown-header {
  border-bottom-color: #334155;
}

.dropdown-header span {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.user-name-bold {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

:global(.dark) .user-name-bold {
  color: #ffffff;
}

.user-email-sub {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.suite-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  transition: background-color 0.15s ease;
}

.suite-item:hover {
  background-color: #f3f4f6;
}

:global(.dark) .suite-item:hover {
  background-color: #334155;
}

.suite-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.blue-bg {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.green-solid {
  background: #10b981;
  color: #ffffff;
}

.purple-bg {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.suite-text {
  flex: 1;
  min-width: 0;
}

.suite-title {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

:global(.dark) .suite-title {
  color: #f8fafc;
}

.suite-desc {
  font-size: 10px;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.active-badge {
  font-size: 9px;
  font-weight: 700;
  background: #10b981;
  color: #ffffff;
  padding: 1px 5px;
  border-radius: 4px;
}

.green-text {
  color: #059669 !important;
}

.red-text {
  color: #ef4444 !important;
}
</style>
