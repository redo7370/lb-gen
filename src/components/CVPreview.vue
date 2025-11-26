<script setup lang="ts">
import { computed } from 'vue'

interface PersonalData {
  name: string
  geburtsdatum: string
  geburtsort: string
  adresse: string
  telefon: string
  email: string
}

interface DynamicItem {
  id: number
  title: string
  subtitle: string
  dateFrom: string
  dateTo: string
  description?: string
}

interface KursItem {
  id: number
  title: string
  anbieter: string
  datum: string
}

interface AuszeichnungItem {
  id: number
  title: string
  verliehen: string
  datum: string
}

const props = defineProps<{
  personalData: PersonalData
  ausbildungen: DynamicItem[]
  berufserfahrungen: DynamicItem[]
  kurse: KursItem[]
  auszeichnungen: AuszeichnungItem[]
  kenntnisse: string
  sprachen: string
  interessen: string
}>()

const geburtsText = computed(() => {
  if (!props.personalData.geburtsdatum && !props.personalData.geburtsort) return ''
  let text = ''
  if (props.personalData.geburtsdatum) {
    text += new Date(props.personalData.geburtsdatum).toLocaleDateString('de-DE')
  }
  if (props.personalData.geburtsort) {
    text += (props.personalData.geburtsdatum ? ', ' : '') + props.personalData.geburtsort
  }
  return text
})

const kenntnisseArray = computed(() => {
  return props.kenntnisse
    .split(',')
    .map((k: string) => k.trim())
    .filter((k: string) => k)
})

const sprachenArray = computed(() => {
  return props.sprachen
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s)
})

const interessenArray = computed(() => {
  return props.interessen
    .split(',')
    .map((i: string) => i.trim())
    .filter((i: string) => i)
})

const hasAnyAusbildung = computed(() => {
  return props.ausbildungen.some(
    (item: DynamicItem) =>
      item.title || item.subtitle || item.dateFrom || item.dateTo || item.description,
  )
})

const hasAnyBerufserfahrung = computed(() => {
  return props.berufserfahrungen.some(
    (item: DynamicItem) =>
      item.title || item.subtitle || item.dateFrom || item.dateTo || item.description,
  )
})

const hasAnyKurs = computed(() => {
  return props.kurse.some((item: KursItem) => item.title || item.anbieter || item.datum)
})

const hasAnyAuszeichnung = computed(() => {
  return props.auszeichnungen.some(
    (item: AuszeichnungItem) => item.title || item.verliehen || item.datum,
  )
})
</script>

<template>
  <div class="cv-preview">
    <!-- Header mit Namen -->
    <div class="cv-header">
      <h1>{{ personalData.name || 'Ihr Name' }}</h1>
    </div>

    <!-- Zweispalten Layout -->
    <div class="cv-content">
      <!-- Linke Spalte -->
      <div class="cv-sidebar">
        <!-- Persönliche Informationen -->
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

        <!-- Kenntnisse -->
        <div class="sidebar-section" v-if="kenntnisseArray.length > 0">
          <h2>Kenntnisse</h2>
          <div class="sidebar-tags">
            <div v-for="(kenntnis, index) in kenntnisseArray" :key="index" class="sidebar-tag">
              {{ kenntnis }}
            </div>
          </div>
        </div>

        <!-- Sprachen -->
        <div class="sidebar-section" v-if="sprachenArray.length > 0">
          <h2>Sprachen</h2>
          <div class="sidebar-list">
            <div v-for="(sprache, index) in sprachenArray" :key="index" class="sidebar-list-item">
              {{ sprache }}
            </div>
          </div>
        </div>

        <!-- Interessen -->
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

      <!-- Hauptbereich rechts -->
      <div class="cv-main">
        <!-- Berufserfahrung -->
        <div v-if="hasAnyBerufserfahrung" class="main-section">
          <h2>Berufserfahrung</h2>
          <div
            v-for="item in berufserfahrungen"
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

        <!-- Ausbildung -->
        <div v-if="hasAnyAusbildung" class="main-section">
          <h2>Ausbildung</h2>
          <div
            v-for="item in ausbildungen"
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

        <!-- Kurse & Zertifikate -->
        <div v-if="hasAnyKurs" class="main-section">
          <h2>Kurse & Zertifikate</h2>
          <div
            v-for="item in kurse"
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

        <!-- Auszeichnungen -->
        <div v-if="hasAnyAuszeichnung" class="main-section">
          <h2>Auszeichnungen</h2>
          <div
            v-for="item in auszeichnungen"
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
/* Match PDF Template Styles */
.cv-preview {
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  font-family: 'Arial', 'Helvetica', sans-serif;
  color: #000;
  font-size: 11pt;
  line-height: 1.4;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.cv-header {
  background: #2c3e50;
  color: white;
  padding: 30px 40px;
  flex-shrink: 0;
}

.cv-header h1 {
  margin: 0;
  font-size: 32pt;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Content Layout */
.cv-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Linke Spalte (Sidebar) */
.cv-sidebar {
  width: 280px;
  background: #f5f5f5;
  padding: 30px 25px;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section {
  margin-bottom: 30px;
}

.sidebar-section h2 {
  font-size: 13pt;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-item {
  margin-bottom: 15px;
}

.sidebar-label {
  font-size: 9pt;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.sidebar-value {
  font-size: 10pt;
  color: #000;
  line-height: 1.4;
  word-wrap: break-word;
}

.sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sidebar-tag {
  background: #2c3e50;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 9pt;
  font-weight: 500;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-list-item {
  font-size: 10pt;
  color: #000;
  padding-left: 15px;
  position: relative;
  line-height: 1.4;
}

.sidebar-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2c3e50;
  font-weight: 700;
}

/* Hauptbereich */
.cv-main {
  flex: 1;
  padding: 30px 40px;
  overflow-y: auto;
}

.main-section {
  margin-bottom: 30px;
}

.main-section h2 {
  font-size: 16pt;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 3px solid #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.main-item {
  margin-bottom: 20px;
}

.main-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 15px;
}

.main-item-title-group {
  flex: 1;
}

.main-item-title-group h3 {
  font-size: 12pt;
  font-weight: 700;
  color: #000;
  margin: 0 0 4px 0;
}

.main-item-subtitle {
  font-size: 11pt;
  color: #555;
  font-style: italic;
  margin: 0;
}

.main-item-date {
  font-size: 10pt;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 4px;
}

.main-item-description {
  font-size: 10pt;
  color: #333;
  line-height: 1.6;
  margin-top: 8px;
  text-align: justify;
}

@media (max-width: 968px) {
  .cv-content {
    flex-direction: column;
  }

  .cv-sidebar {
    width: 100%;
  }
}
</style>
