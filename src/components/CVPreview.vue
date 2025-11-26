<script setup lang="ts">
import { computed, ref } from 'vue'

interface PersonalData {
  name: string
  geburtsdatum: string
  geburtsort: string
  adresse: string
  telefon: string
  email: string
  photoUrl: string
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
  isDarkMode: boolean
}>()

const emit = defineEmits<{
  'toggle-theme': []
}>()

// Zoom und Pan State
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// Zoom Funktionen
const zoomIn = () => {
  if (zoom.value < 2) {
    zoom.value = Math.min(zoom.value + 0.1, 2)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.max(zoom.value - 0.1, 0.5)
  }
}

const resetZoom = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

// Pan Funktionen
const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) {
    // Nur linke Maustaste
    isDragging.value = true
    dragStartX.value = e.clientX - panX.value
    dragStartY.value = e.clientY - panY.value
    e.preventDefault()
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    panX.value = e.clientX - dragStartX.value
    panY.value = e.clientY - dragStartY.value
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    zoom.value = Math.max(0.5, Math.min(2, zoom.value + delta))
  }
}

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

// Hilfsfunktion zum Parsen von Datumsangaben
const parseDate = (dateStr: string): number => {
  if (!dateStr) return 0
  // Versuche verschiedene Formate: MM/YYYY, YYYY, oder "heute"/"aktuell"
  const heute =
    dateStr.toLowerCase().includes('heute') ||
    dateStr.toLowerCase().includes('aktuell') ||
    dateStr.toLowerCase().includes('present')
  if (heute) return Date.now()

  const parts = dateStr.split(/[\/\-\.]/)
  if (parts.length === 2) {
    // MM/YYYY Format
    const month = parseInt(parts[0])
    const year = parseInt(parts[1])
    return new Date(year, month - 1).getTime()
  } else if (parts.length === 1) {
    // Nur Jahr
    const year = parseInt(parts[0])
    return new Date(year, 0).getTime()
  }
  return 0
}

// Sortierte Listen (neueste zuerst)
const sortedAusbildungen = computed(() => {
  return [...props.ausbildungen].sort((a, b) => {
    const dateA = parseDate(a.dateTo || a.dateFrom)
    const dateB = parseDate(b.dateTo || b.dateFrom)
    return dateB - dateA
  })
})

const sortedBerufserfahrungen = computed(() => {
  return [...props.berufserfahrungen].sort((a, b) => {
    const dateA = parseDate(a.dateTo || a.dateFrom)
    const dateB = parseDate(b.dateTo || b.dateFrom)
    return dateB - dateA
  })
})

const sortedKurse = computed(() => {
  return [...props.kurse].sort((a, b) => {
    const dateA = parseDate(a.datum)
    const dateB = parseDate(b.datum)
    return dateB - dateA
  })
})

const sortedAuszeichnungen = computed(() => {
  return [...props.auszeichnungen].sort((a, b) => {
    const dateA = parseDate(a.datum)
    const dateB = parseDate(b.datum)
    return dateB - dateA
  })
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
  <div class="cv-preview-wrapper">
    <!-- Zoom Controls -->
    <div class="zoom-controls">
      <button @click="zoomOut" class="zoom-btn" title="Verkleinern">−</button>
      <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
      <button @click="zoomIn" class="zoom-btn" title="Vergrößern">+</button>
      <button @click="resetZoom" class="zoom-btn reset-btn" title="Zurücksetzen">↺</button>
    </div>

    <!-- Scrollable Container -->
    <div
      class="cv-preview-container"
      ref="containerRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @wheel="handleWheel"
      :class="{ dragging: isDragging }"
    >
      <div
        class="cv-preview-page"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }"
      >
        <div class="cv-preview" :class="{ 'light-mode': !isDarkMode }">
          <!-- Theme Toggle Button -->
          <button class="theme-toggle" @click="emit('toggle-theme')" type="button">
            <span v-if="isDarkMode">☀️ Light</span>
            <span v-else>🌙 Dark</span>
          </button>
          <!-- Header mit Namen -->
          <div class="cv-header">
            <div class="header-content">
              <div v-if="personalData.photoUrl" class="header-photo">
                <img :src="personalData.photoUrl" alt="Profilfoto" />
              </div>
              <h1>{{ personalData.name || 'Ihr Name' }}</h1>
            </div>
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
                  <div
                    v-for="(kenntnis, index) in kenntnisseArray"
                    :key="index"
                    class="sidebar-tag"
                  >
                    {{ kenntnis }}
                  </div>
                </div>
              </div>

              <!-- Sprachen -->
              <div class="sidebar-section" v-if="sprachenArray.length > 0">
                <h2>Sprachen</h2>
                <div class="sidebar-list">
                  <div
                    v-for="(sprache, index) in sprachenArray"
                    :key="index"
                    class="sidebar-list-item"
                  >
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
              <!-- Ausbildung -->
              <div v-if="hasAnyAusbildung" class="main-section">
                <h2>Ausbildung</h2>
                <div
                  v-for="item in sortedAusbildungen"
                  :key="item.id"
                  class="main-item"
                  v-show="
                    item.title || item.subtitle || item.dateFrom || item.dateTo || item.description
                  "
                >
                  <div class="main-item-header">
                    <div class="main-item-title-group">
                      <h3 v-if="item.title">{{ item.title }}</h3>
                      <div v-if="item.subtitle" class="main-item-subtitle">{{ item.subtitle }}</div>
                    </div>
                    <div v-if="item.dateFrom || item.dateTo" class="main-item-date">
                      {{ item.dateFrom }}{{ item.dateFrom && item.dateTo ? ' - ' : ''
                      }}{{ item.dateTo }}
                    </div>
                  </div>
                  <div v-if="item.description" class="main-item-description">
                    {{ item.description }}
                  </div>
                </div>
              </div>

              <!-- Berufserfahrung -->
              <div v-if="hasAnyBerufserfahrung" class="main-section">
                <h2>Berufserfahrung</h2>
                <div
                  v-for="item in sortedBerufserfahrungen"
                  :key="item.id"
                  class="main-item"
                  v-show="
                    item.title || item.subtitle || item.dateFrom || item.dateTo || item.description
                  "
                >
                  <div class="main-item-header">
                    <div class="main-item-title-group">
                      <h3 v-if="item.title">{{ item.title }}</h3>
                      <div v-if="item.subtitle" class="main-item-subtitle">{{ item.subtitle }}</div>
                    </div>
                    <div v-if="item.dateFrom || item.dateTo" class="main-item-date">
                      {{ item.dateFrom }}{{ item.dateFrom && item.dateTo ? ' - ' : ''
                      }}{{ item.dateTo }}
                    </div>
                  </div>
                  <div v-if="item.description" class="main-item-description">
                    {{ item.description }}
                  </div>
                </div>
              </div>

              <!-- Kurse & Zertifikate -->
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

              <!-- Auszeichnungen -->
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
                      <div v-if="item.verliehen" class="main-item-subtitle">
                        {{ item.verliehen }}
                      </div>
                    </div>
                    <div v-if="item.datum" class="main-item-date">{{ item.datum }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Wrapper für die gesamte Preview */
.cv-preview-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  overflow: hidden;
}

/* Zoom Controls */
.zoom-controls {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 8px 12px;
  border-radius: 25px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #667eea;
  color: white;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.zoom-btn:hover {
  background: #5568d3;
  transform: scale(1.1);
}

.zoom-btn:active {
  transform: scale(0.95);
}

.reset-btn {
  background: #6c757d;
}

.reset-btn:hover {
  background: #5a6268;
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: #333;
}

/* Scrollable Container */
.cv-preview-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  cursor: grab;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 20px 20px;
}

.cv-preview-container.dragging {
  cursor: grabbing;
  user-select: none;
}

/* A4 Page */
.cv-preview-page {
  transform-origin: center center;
  transition: transform 0.05s ease-out;
  will-change: transform;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

/* Match PDF Template Styles */
.cv-preview {
  background: white;
  font-family: 'Arial', 'Helvetica', sans-serif;
  color: #000;
  font-size: 11pt;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  position: relative;
  /* A4 Format: 210mm x 297mm */
  width: 210mm;
  min-height: 297mm;
}

/* Theme Toggle Button */
.theme-toggle {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #ddd;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 10pt;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.light-mode .theme-toggle {
  background: rgba(44, 62, 80, 0.9);
  color: white;
  border-color: #2c3e50;
}

.light-mode .theme-toggle:hover {
  background: rgba(44, 62, 80, 1);
}

/* Header */
.cv-header {
  background: #2c3e50;
  color: white;
  padding: 30px 40px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.light-mode .cv-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 25px;
}

.header-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.header-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  transition: all 0.3s ease;
  overflow-y: auto;
  flex-shrink: 0;
}

.light-mode .cv-sidebar {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
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
  transition: all 0.3s ease;
}

.light-mode .sidebar-section h2 {
  color: #667eea;
  border-bottom-color: #667eea;
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
  transition: all 0.3s ease;
}

.light-mode .sidebar-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  transition: all 0.3s ease;
}

.light-mode .sidebar-list-item::before {
  color: #667eea;
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
  transition: all 0.3s ease;
}

.light-mode .main-section h2 {
  color: #667eea;
  border-bottom-color: #667eea;
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
  transition: all 0.3s ease;
}

.light-mode .main-item-date {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  font-weight: 700;
}

.main-item-description {
  font-size: 10pt;
  color: #333;
  line-height: 1.6;
  margin-top: 8px;
  text-align: justify;
}

/* Responsive - deaktiviert für A4 Preview */
@media print {
  .zoom-controls {
    display: none;
  }

  .cv-preview-wrapper {
    background: white;
  }

  .cv-preview-container {
    padding: 0;
  }

  .cv-preview-page {
    transform: none !important;
    box-shadow: none;
  }
}
</style>
