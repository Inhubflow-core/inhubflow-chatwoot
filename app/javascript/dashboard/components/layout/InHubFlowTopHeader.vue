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

const currentLang = computed(() => {
  const loc = (locale.value || 'pt_BR').toLowerCase();
  if (loc.includes('pt')) return { code: 'BR', label: 'PT-BR' };
  if (loc.includes('es')) return { code: 'ES', label: 'ES' };
  if (loc.includes('en')) return { code: 'US', label: 'EN' };
  return { code: 'BR', label: 'PT-BR' };
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
  document.title = 'Dashboard B2C';
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
  <header class="linki-exact-header">
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

    <!-- Right Controls Section (Exact Linki Component Replica) -->
    <div class="header-right">
      <!-- 1. App Switcher Button (RiApps2Line exact 4-circles SVG) -->
      <div ref="suiteRef" class="popover-container">
        <button
          type="button"
          class="control-btn"
          title="InHubFlow Suite"
          @click="isSuiteOpen = !isSuiteOpen"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M7 11.5C4.51472 11.5 2.5 9.48528 2.5 7C2.5 4.51472 4.51472 2.5 7 2.5C9.48528 2.5 11.5 4.51472 11.5 7C11.5 9.48528 9.48528 11.5 7 11.5ZM7 21.5C4.51472 21.5 2.5 19.4853 2.5 17C2.5 14.5147 4.51472 12.5 7 12.5C9.48528 12.5 11.5 14.5147 11.5 17C11.5 19.4853 9.48528 21.5 7 21.5ZM17 11.5C14.5147 11.5 12.5 9.48528 12.5 7C12.5 4.51472 14.5147 2.5 17 2.5C19.4853 2.5 21.5 4.51472 21.5 7C21.5 9.48528 19.4853 11.5 17 11.5ZM17 21.5C14.5147 21.5 12.5 19.4853 12.5 17C12.5 14.5147 14.5147 12.5 17 12.5C19.4853 12.5 21.5 14.5147 21.5 17C21.5 19.4853 19.4853 21.5 17 21.5ZM7 9.5C8.38071 9.5 9.5 8.38071 9.5 7C9.5 5.61929 8.38071 4.5 7 4.5C5.61929 4.5 4.5 5.61929 4.5 7C4.5 8.38071 5.61929 9.5 7 9.5ZM7 19.5C8.38071 19.5 9.5 18.3807 9.5 17C9.5 15.6193 8.38071 14.5 7 14.5C5.61929 14.5 4.5 15.6193 4.5 17C4.5 18.3807 5.61929 19.5 7 19.5ZM17 9.5C18.3807 9.5 19.5 8.38071 19.5 7C19.5 5.61929 18.3807 4.5 17 4.5C16.0074 4.5 15 5.50736 15 6.75V9H17.25ZM17 19.5C18.3807 19.5 19.5 18.3807 19.5 17C19.5 15.6193 18.3807 14.5 17 14.5C15.6193 14.5 14.5 15.6193 14.5 17C14.5 18.3807 15.6193 19.5 17 19.5Z"/>
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

      <!-- 2. Dark/Light Mode Button (RiMoonLine exact outline SVG) -->
      <button
        type="button"
        class="control-btn"
        title="Alternar Tema"
        @click="toggleTheme"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7ZM4 12C4 16.4183 7.58172 20 12 20C15.0583 20 17.7158 18.2839 19.062 15.7621C18.3945 15.9187 17.7035 16 17 16C12.0294 16 8 11.9706 8 7C8 6.29648 8.08133 5.60547 8.2379 4.938C5.71611 6.28423 4 8.9417 4 12Z"/>
        </svg>
      </button>

      <!-- 3. Language Selector Button (BR / PT-BR text style) -->
      <div ref="langRef" class="popover-container">
        <button
          type="button"
          class="control-btn lang-btn"
          @click="isLangOpen = !isLangOpen"
        >
          <span class="country-badge">{{ currentLang.code }}</span>
          <span class="lang-text">{{ currentLang.label }}</span>
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
.linki-exact-header {
  height: 64px;
  min-height: 64px;
  max-height: 64px;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-sizing: border-box;
  z-index: 40;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);
}

:global(.dark) .linki-exact-header {
  background: #0f172a;
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
  padding: 5px 12px;
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
  gap: 0.6rem;
}

.popover-container {
  position: relative;
}

/* Square Control Button matching Linki exactly */
.control-btn {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
  box-sizing: border-box;
}

:global(.dark) .control-btn {
  background-color: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.control-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

:global(.dark) .control-btn:hover {
  background-color: #334155;
  color: #ffffff;
}

/* Language Button matching Linki */
.lang-btn {
  width: auto;
  min-width: unset;
  padding: 0 12px;
  gap: 8px;
}

.country-badge {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lang-text {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
}

:global(.dark) .lang-text {
  color: #f1f5f9;
}

/* User Button matching Linki */
.user-btn {
  height: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  padding: 4px 14px 4px 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

:global(.dark) .user-btn {
  background-color: #1e293b;
  border-color: #334155;
}

.user-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

:global(.dark) .user-btn:hover {
  background-color: #334155;
}

.user-avatar-square {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.25);
  flex-shrink: 0;
}

.user-email-text {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
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
  border: 1px solid #e2e8f0;
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
  border-bottom: 1px solid #f1f5f9;
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
  color: #94a3b8;
}

.user-name-bold {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

:global(.dark) .user-name-bold {
  color: #ffffff;
}

.user-email-sub {
  font-size: 11px;
  color: #64748b;
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
  background-color: #f8fafc;
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
  color: #0f172a;
  margin: 0;
}

:global(.dark) .suite-title {
  color: #f8fafc;
}

.suite-desc {
  font-size: 10px;
  color: #64748b;
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
