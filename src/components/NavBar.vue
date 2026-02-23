<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCVStore } from '@/composables/useCVStore'

const router = useRouter()
const { isSPADark, toggleTheme } = useCVStore()

function goHome() {
  router.push('/')
}
</script>

<template>
  <nav class="navbar" :class="{ dark: isSPADark }">
    <div class="navbar-content">
      <div class="navbar-brand" @click="goHome" role="button" tabindex="0">
        <h1>Lebenslauf Generator</h1>
      </div>
      <div class="navbar-actions">
        <button class="theme-toggle-btn" @click="toggleTheme" type="button">
          <span v-if="isSPADark">☀️ Light Mode</span>
          <span v-else>🌙 Dark Mode</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #2d3748;
  color: white;
  padding: 15px 30px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.navbar.dark {
  background: #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.navbar-brand {
  cursor: pointer;
  user-select: none;
}

.navbar-brand:hover h1 {
  opacity: 0.85;
}

.navbar-brand h1 {
  font-size: 1.5em;
  margin: 0;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.navbar-actions {
  display: flex;
  gap: 10px;
}

.theme-toggle-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}
</style>
