<template>
  <div class="inhub-app-switcher">
    <button
      class="app-switcher-button"
      @click="toggleDropdown"
      aria-label="InHubFlow App Switcher"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
        />
      </svg>
      <span>InHubFlow</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-4 h-4"
        :class="{ 'rotate-180': isOpen }"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="app-switcher-dropdown" @click.stop>
        <a
          href="http://localhost:3456"
          target="_blank"
          class="app-item"
          @click="handleAppSwitch('linki')"
        >
          <div class="app-icon linki">L</div>
          <div class="app-info">
            <div class="app-name">Linki</div>
            <div class="app-description">B2B Outreach Engine</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4 text-gray-400"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </a>

        <a
          href="http://localhost:3001"
          class="app-item active"
          @click="handleAppSwitch('chatwoot')"
        >
          <div class="app-icon chatwoot">C</div>
          <div class="app-info">
            <div class="app-name">Chatwoot</div>
            <div class="app-description">B2C Omnichannel Suite</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 text-brand-500"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </a>

        <div class="border-t border-gray-200 dark:border-gray-700 my-2"></div>

        <div class="px-3 py-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            InHubFlow Suite v1.0.0
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'InHubFlowAppSwitcher',
  data() {
    return {
      isOpen: false,
    };
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false;
      }
    },
    handleAppSwitch(appName) {
      console.log(`Switching to ${appName}`);
      this.isOpen = false;
    },
  },
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.w-4 {
  width: 1rem;
}

.h-4 {
  height: 1rem;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.app-item.active {
  background: var(--color-gray-50);
}

.dark .app-item.active {
  background: rgba(255, 255, 255, 0.05);
}

.text-brand-500 {
  color: var(--color-brand-500);
}

.text-gray-400 {
  color: var(--color-gray-400);
}

.text-gray-500 {
  color: var(--color-gray-500);
}

.text-xs {
  font-size: 0.75rem;
}

.border-t {
  border-top-width: 1px;
}

.border-gray-200 {
  border-color: var(--color-gray-200);
}

.dark .border-gray-700 {
  border-color: var(--color-gray-700);
}

.my-2 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
