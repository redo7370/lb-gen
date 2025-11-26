<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'

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

// Content overflow detection for PDF
const pdfTemplateRef = ref<HTMLElement | null>(null)
const isCompact = ref(false)

// Check if content fits on one page
const checkContentHeight = () => {
  nextTick(() => {
    if (pdfTemplateRef.value) {
      const contentHeight = pdfTemplateRef.value.scrollHeight
      const a4HeightMm = 297
      const mmToPx = 3.7795275591 // 96 DPI conversion
      const a4HeightPx = a4HeightMm * mmToPx

      // If content exceeds A4 height, apply compact mode
      isCompact.value = contentHeight > a4HeightPx
    }
  })
}

// Watch for changes in content
watch(
  () => [
    props.personalData,
    props.ausbildungen,
    props.berufserfahrungen,
    props.kurse,
    props.auszeichnungen,
    props.kenntnisse,
    props.sprachen,
    props.interessen,
  ],
  () => {
    checkContentHeight()
  },
  { deep: true },
)

onMounted(() => {
  checkContentHeight()
})
</script>

<template>
  <div
    class="pdf-template"
    :class="{ 'light-mode': !isDarkMode, compact: isCompact }"
    ref="pdfTemplateRef"
  >
    <!-- Header mit Namen -->
    <div class="pdf-header">
      <div class="header-content">
        <div v-if="personalData.photoUrl" class="header-photo">
          <img :src="personalData.photoUrl" alt="Profilfoto" />
        </div>
        <h1>{{ personalData.name || 'Ihr Name' }}</h1>
      </div>
    </div>

    <!-- Zweispalten Layout -->
    <div class="pdf-content">
      <!-- Linke Spalte -->
      <div class="pdf-sidebar">
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
      <div class="pdf-main">
        <!-- Ausbildung -->
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

        <!-- Berufserfahrung -->
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

        <!-- Ausbildung -->
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
/* PDF Template Styles - Optimiert für PDF Export */
.pdf-template {
  width: 210mm;
  min-height: 297mm;
  background: white;
  font-family: 'Arial', 'Helvetica', sans-serif;
  color: #000;
  font-size: 10pt;
  line-height: 1.4;
  margin: 0 auto;
  position: relative;
}

/* Header */
.pdf-header {
  background: #2c3e50;
  color: white;
  padding: 20mm 15mm;
  margin-bottom: 0;
}

.light-mode .pdf-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15mm;
}

.header-photo {
  flex-shrink: 0;
  width: 35mm;
  height: 35mm;
  border-radius: 50%;
  overflow: hidden;
  border: 2mm solid white;
  background: white;
}

.header-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pdf-header h1 {
  margin: 0;
  font-size: 28pt;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Content Layout */
.pdf-content {
  display: flex;
  min-height: 240mm;
}

/* Linke Spalte (Sidebar) */
.pdf-sidebar {
  width: 70mm;
  background: #f5f5f5;
  padding: 10mm 8mm;
  box-sizing: border-box;
}

.light-mode .pdf-sidebar {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.sidebar-section {
  margin-bottom: 8mm;
}

.sidebar-section h2 {
  font-size: 12pt;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4mm 0;
  padding-bottom: 2mm;
  border-bottom: 2px solid #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.light-mode .sidebar-section h2 {
  color: #667eea;
  border-bottom-color: #667eea;
}

.sidebar-item {
  margin-bottom: 4mm;
}

.sidebar-label {
  font-size: 8pt;
  font-weight: 700;
  color: #555;
  text-transform: uppercase;
  margin-bottom: 1mm;
  letter-spacing: 0.3px;
}

.sidebar-value {
  font-size: 9pt;
  color: #000;
  line-height: 1.3;
  word-wrap: break-word;
}

.sidebar-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2mm;
}

.sidebar-tag {
  background: #2c3e50;
  color: white;
  padding: 2mm 3mm;
  border-radius: 2mm;
  font-size: 8pt;
  font-weight: 500;
}

.light-mode .sidebar-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 2mm;
}

.sidebar-list-item {
  font-size: 9pt;
  color: #000;
  padding-left: 4mm;
  position: relative;
  line-height: 1.3;
}

.sidebar-list-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #2c3e50;
  font-weight: 700;
}

.light-mode .sidebar-list-item::before {
  color: #667eea;
}

/* Hauptbereich */
.pdf-main {
  flex: 1;
  padding: 10mm 12mm;
  box-sizing: border-box;
}

.main-section {
  margin-bottom: 8mm;
  page-break-inside: avoid;
}

.main-section h2 {
  font-size: 14pt;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 5mm 0;
  padding-bottom: 2mm;
  border-bottom: 2.5px solid #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.light-mode .main-section h2 {
  color: #667eea;
  border-bottom-color: #667eea;
}

.main-item {
  margin-bottom: 5mm;
  page-break-inside: avoid;
}

.main-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2mm;
  gap: 4mm;
}

.main-item-title-group {
  flex: 1;
}

.main-item-title-group h3 {
  font-size: 11pt;
  font-weight: 700;
  color: #000;
  margin: 0 0 1mm 0;
}

.main-item-subtitle {
  font-size: 10pt;
  color: #555;
  font-style: italic;
  margin: 0;
}

.main-item-date {
  font-size: 9pt;
  color: #666;
  font-weight: 600;
  white-space: nowrap;
  background: #f0f0f0;
  padding: 1mm 3mm;
  border-radius: 2mm;
}

.light-mode .main-item-date {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  font-weight: 700;
}

.main-item-description {
  font-size: 9pt;
  color: #333;
  line-height: 1.5;
  margin-top: 2mm;
  text-align: justify;
}

/* Print optimizations */
@media print {
  .pdf-template {
    width: 210mm;
    height: 297mm;
    margin: 0;
    box-shadow: none;
  }
}

/* Compact mode - reduces spacing and font sizes to fit content on one page */
.pdf-template.compact {
  font-size: 9pt;
  line-height: 1.25;
  max-height: 297mm;
  overflow: hidden;
}

.pdf-template.compact .pdf-header {
  padding: 15mm 12mm;
}

.pdf-template.compact .pdf-header h1 {
  font-size: 24pt;
}

.pdf-template.compact .header-content {
  gap: 10mm;
}

.pdf-template.compact .header-photo {
  width: 28mm;
  height: 28mm;
  border-width: 1.5mm;
}

.pdf-template.compact .pdf-sidebar {
  padding: 8mm 6mm;
}

.pdf-template.compact .sidebar-section {
  margin-bottom: 6mm;
}

.pdf-template.compact .sidebar-section h2 {
  font-size: 11pt;
  margin-bottom: 3mm;
  padding-bottom: 1.5mm;
}

.pdf-template.compact .sidebar-item {
  margin-bottom: 3mm;
}

.pdf-template.compact .sidebar-label {
  font-size: 7pt;
  margin-bottom: 0.5mm;
}

.pdf-template.compact .sidebar-value {
  font-size: 8.5pt;
  line-height: 1.3;
}

.pdf-template.compact .pdf-main {
  padding: 8mm 10mm;
}

.pdf-template.compact .main-section {
  margin-bottom: 6mm;
}

.pdf-template.compact .main-section h2 {
  font-size: 12pt;
  margin-bottom: 3.5mm;
  padding-bottom: 1.5mm;
  border-bottom-width: 2px;
}

.pdf-template.compact .main-item {
  margin-bottom: 3.5mm;
}

.pdf-template.compact .main-item-header {
  margin-bottom: 1.5mm;
  gap: 3mm;
}

.pdf-template.compact .main-item-title-group h3 {
  font-size: 10pt;
  margin-bottom: 0.5mm;
}

.pdf-template.compact .main-item-subtitle {
  font-size: 9pt;
}

.pdf-template.compact .main-item-date {
  font-size: 8pt;
  padding: 0.8mm 2.5mm;
}

.pdf-template.compact .main-item-description {
  font-size: 8.5pt;
  line-height: 1.35;
  margin-top: 1.5mm;
}
</style>
