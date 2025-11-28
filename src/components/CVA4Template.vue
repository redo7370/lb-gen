<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCVData, type CVProps } from '@/composables/useCVData'

// Props - NO isSPADark accepted!
const props = defineProps<Omit<CVProps, 'isSPADark'>>()

// Define emits
const emit = defineEmits<{
  darkModeChange: [value: boolean]
}>()

// Internal A4 dark mode state - COMPLETELY ISOLATED
const isA4Dark = ref(false)

// Load from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem('cv-a4-dark-mode')
  if (saved !== null) {
    isA4Dark.value = saved === 'true'
    console.log('📂 Loaded A4 Dark Mode from localStorage:', isA4Dark.value)
  }
})

// Toggle handler - stays internal
const toggleA4Dark = () => {
  isA4Dark.value = !isA4Dark.value
  localStorage.setItem('cv-a4-dark-mode', String(isA4Dark.value))
  emit('darkModeChange', isA4Dark.value)
  console.log('✨ A4 Template Dark Mode:', isA4Dark.value)
}

// Expose toggle method to parent
defineExpose({
  toggleA4Dark,
  isA4Dark,
})

// Use shared CV data logic
const {
  geburtsText,
  kenntnisseArray,
  interessenArray,
  sortedAusbildungen,
  sortedBerufserfahrungen,
  sortedKurse,
  sortedAuszeichnungen,
  hasAnyAusbildung,
  hasAnyBerufserfahrung,
  hasAnyKurs,
  hasAnyAuszeichnung,
  hasAnySprache,
  getLevelValue,
} = useCVData(props)
</script>

<template>
  <!-- A4 Sheet - Completely isolated from SPA dark mode -->
  <div class="cv-a4-template" :class="{ 'dark-mode': isA4Dark }" :data-dark="isA4Dark">
    <!-- Header -->
    <div class="cv-header">
      <div class="header-content">
        <div v-if="personalData.photoUrl" class="header-photo">
          <img :src="personalData.photoUrl" alt="Profilfoto" />
        </div>
        <h1>{{ personalData.name || 'Ihr Name' }}</h1>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="cv-content">
      <!-- Sidebar -->
      <div class="cv-sidebar">
        <!-- Contact -->
        <div class="sidebar-section">
          <h2>Kontakt</h2>
          <div class="sidebar-item" v-if="geburtsText">
            <div class="sidebar-label">Geburt</div>
            <div class="sidebar-value">{{ geburtsText }}</div>
          </div>
          <div class="sidebar-item" v-if="personalData.adresse">
            <div class="sidebar-label">Adresse</div>
            <div class="sidebar-value">{{ personalData.adresse }}</div>
          </div>
          <div class="sidebar-item" v-if="personalData.telefon">
            <div class="sidebar-label">Telefon</div>
            <div class="sidebar-value">{{ personalData.telefon }}</div>
          </div>
          <div class="sidebar-item" v-if="personalData.email">
            <div class="sidebar-label">E-Mail</div>
            <div class="sidebar-value">{{ personalData.email }}</div>
          </div>
        </div>

        <!-- Skills -->
        <div class="sidebar-section" v-if="kenntnisseArray.length > 0">
          <h2>Kenntnisse</h2>
          <div class="sidebar-tags">
            <div v-for="(kenntnis, index) in kenntnisseArray" :key="index" class="sidebar-tag">
              {{ kenntnis }}
            </div>
          </div>
        </div>

        <!-- Languages -->
        <div class="sidebar-section" v-if="hasAnySprache">
          <h2>Sprachen</h2>
          <div class="language-items">
            <div
              v-for="item in sprachen"
              :key="item.id"
              class="language-item"
              v-show="item.sprache"
            >
              <div class="language-name">
                {{ item.sprache }} <span class="niveau-text">({{ item.niveau }})</span>
              </div>
              <div class="language-level">
                <div class="level-bars">
                  <div
                    v-for="i in 5"
                    :key="i"
                    class="level-bar"
                    :class="{
                      filled: i <= getLevelValue(item.niveau),
                      'native-bar': item.niveau === 'Muttersprache' && i === 5,
                    }"
                  ></div>
                  <div
                    v-if="item.niveau === 'Muttersprache'"
                    class="level-bar native-extra filled"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interests -->
        <div class="sidebar-section" v-if="interessenArray.length > 0">
          <h2>Interessen</h2>
          <div class="sidebar-list">
            <div
              v-for="(interesse, index) in interessenArray"
              :key="index"
              class="sidebar-list-item"
            >
              {{ interesse }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="cv-main">
        <!-- Education -->
        <div v-if="hasAnyAusbildung" class="main-section">
          <h2>Ausbildung</h2>
          <div
            v-for="item in sortedAusbildungen"
            :key="item.id"
            class="main-item"
            v-show="item.title || item.subtitle || item.dateFrom || item.dateTo || item.description"
          >
            <div class="main-item-header">
              <div class="main-item-title-group">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <div v-if="item.subtitle" class="main-item-subtitle">{{ item.subtitle }}</div>
              </div>
              <div v-if="item.dateFrom || item.dateTo" class="main-item-date">
                {{ item.dateFrom }}{{ item.dateFrom && item.dateTo ? ' - ' : '' }}{{ item.dateTo }}
              </div>
            </div>
            <div v-if="item.description" class="main-item-description">{{ item.description }}</div>
          </div>
        </div>

        <!-- Work Experience -->
        <div v-if="hasAnyBerufserfahrung" class="main-section">
          <h2>Berufserfahrung</h2>
          <div
            v-for="item in sortedBerufserfahrungen"
            :key="item.id"
            class="main-item"
            v-show="item.title || item.subtitle || item.dateFrom || item.dateTo || item.description"
          >
            <div class="main-item-header">
              <div class="main-item-title-group">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <div v-if="item.subtitle" class="main-item-subtitle">{{ item.subtitle }}</div>
              </div>
              <div v-if="item.dateFrom || item.dateTo" class="main-item-date">
                {{ item.dateFrom }}{{ item.dateFrom && item.dateTo ? ' - ' : '' }}{{ item.dateTo }}
              </div>
            </div>
            <div v-if="item.description" class="main-item-description">{{ item.description }}</div>
          </div>
        </div>

        <!-- Courses -->
        <div v-if="hasAnyKurs" class="main-section">
          <h2>Kurse & Zertifikate</h2>
          <div
            v-for="item in sortedKurse"
            :key="item.id"
            class="main-item"
            v-show="item.title || item.anbieter || item.datum"
          >
            <div class="main-item-header">
              <div class="main-item-title-group">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <div v-if="item.anbieter" class="main-item-subtitle">{{ item.anbieter }}</div>
              </div>
              <div v-if="item.datum" class="main-item-date">{{ item.datum }}</div>
            </div>
          </div>
        </div>

        <!-- Awards -->
        <div v-if="hasAnyAuszeichnung" class="main-section">
          <h2>Auszeichnungen</h2>
          <div
            v-for="item in sortedAuszeichnungen"
            :key="item.id"
            class="main-item"
            v-show="item.title || item.verliehen || item.datum"
          >
            <div class="main-item-header">
              <div class="main-item-title-group">
                <h3 v-if="item.title">{{ item.title }}</h3>
                <div v-if="item.verliehen" class="main-item-subtitle">{{ item.verliehen }}</div>
              </div>
              <div v-if="item.datum" class="main-item-date">{{ item.datum }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A4 Template - ISOLATED STYLES */
.cv-a4-template {
  background: white !important;
  font-family: 'Arial', 'Helvetica', sans-serif;
  color: #000 !important;
  font-size: 11pt;
  line-height: 1.4;
  width: 210mm;
  min-height: 297mm;
  display: flex;
  flex-direction: column;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
  isolation: isolate;
}

.cv-a4-template.dark-mode {
  background: #1a1a1a !important;
  color: #e0e0e0 !important;
}

/* Header */
.cv-a4-template .cv-header {
  background: #2d3748;
  color: white;
  padding: 30px 40px;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.cv-a4-template.dark-mode .cv-header {
  background: #0f172a;
}

.cv-a4-template .header-content {
  display: flex;
  align-items: center;
  gap: 25px;
}

.cv-a4-template .header-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

.cv-a4-template .header-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cv-a4-template .cv-header h1 {
  margin: 0;
  font-size: 32pt;
  font-weight: 700;
}

/* Content */
.cv-a4-template .cv-content {
  display: flex;
  flex: 1;
}

/* Sidebar */
.cv-a4-template .cv-sidebar {
  width: 280px;
  background: #f8fafc;
  padding: 30px 25px;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

.cv-a4-template.dark-mode .cv-sidebar {
  background: #1e293b;
}

.cv-a4-template .sidebar-section {
  margin-bottom: 30px;
}

.cv-a4-template .sidebar-section h2 {
  font-size: 13pt;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #2d3748;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-section h2 {
  color: #e2e8f0;
  border-bottom-color: #475569;
}

.cv-a4-template .sidebar-item {
  margin-bottom: 15px;
}

.cv-a4-template .sidebar-label {
  font-size: 9pt;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-label {
  color: #94a3b8;
}

.cv-a4-template .sidebar-value {
  font-size: 10pt;
  color: #1e293b;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-value {
  color: #cbd5e0;
}

.cv-a4-template .sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cv-a4-template .sidebar-tag {
  background: #2d3748;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 9pt;
  transition: background-color 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-tag {
  background: #475569;
}

.cv-a4-template .sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-a4-template .sidebar-list-item {
  font-size: 10pt;
  color: #1e293b;
  padding-left: 15px;
  position: relative;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-list-item {
  color: #cbd5e0;
}

.cv-a4-template .sidebar-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2d3748;
  font-weight: 700;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .sidebar-list-item::before {
  color: #94a3b8;
}

/* Languages */
.cv-a4-template .language-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cv-a4-template .language-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cv-a4-template .language-name {
  font-size: 10pt;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .language-name {
  color: #cbd5e0;
}

.cv-a4-template .niveau-text {
  font-size: 8pt;
  font-weight: 400;
  color: #999;
}

.cv-a4-template .level-bars {
  display: flex;
  gap: 3px;
}

.cv-a4-template .level-bar {
  width: 28px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 2px;
  transition: background-color 0.3s ease;
}

.cv-a4-template .level-bar.filled {
  background: #2d3748;
}

.cv-a4-template.dark-mode .level-bar {
  background: #334155;
}

.cv-a4-template.dark-mode .level-bar.filled {
  background: #94a3b8;
}

.cv-a4-template .level-bar.native-extra {
  background: #dc3545;
  width: 32px;
  height: 9px;
  border: 2px solid #dc3545;
}

/* Main Content */
.cv-a4-template .cv-main {
  flex: 1;
  padding: 30px 40px;
  background: white;
  transition: background-color 0.3s ease;
}

.cv-a4-template.dark-mode .cv-main {
  background: #1a1a1a;
}

.cv-a4-template .main-section {
  margin-bottom: 30px;
}

.cv-a4-template .main-section h2 {
  font-size: 16pt;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 3px solid #2d3748;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.cv-a4-template.dark-mode .main-section h2 {
  color: #e2e8f0;
  border-bottom-color: #475569;
}

.cv-a4-template .main-item {
  margin-bottom: 20px;
}

.cv-a4-template .main-item-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 8px;
}

.cv-a4-template .main-item-title-group {
  flex: 1;
}

.cv-a4-template .main-item-title-group h3 {
  font-size: 12pt;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .main-item-title-group h3 {
  color: #f1f5f9;
}

.cv-a4-template .main-item-subtitle {
  font-size: 11pt;
  color: #64748b;
  font-style: italic;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .main-item-subtitle {
  color: #94a3b8;
}

.cv-a4-template .main-item-date {
  font-size: 10pt;
  color: #475569;
  font-weight: 600;
  background: #e2e8f0;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.cv-a4-template.dark-mode .main-item-date {
  background: #334155;
  color: #cbd5e0;
}

.cv-a4-template .main-item-description {
  font-size: 10pt;
  color: #334155;
  line-height: 1.6;
  text-align: justify;
  transition: color 0.3s ease;
}

.cv-a4-template.dark-mode .main-item-description {
  color: #cbd5e0;
}
</style>
