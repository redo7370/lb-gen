<script setup lang="ts">
import { computed } from 'vue'

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

interface SprachItem {
  id: number
  sprache: string
  niveau:
    | 'Grundkenntnisse'
    | 'Konversationsfähig'
    | 'Gut'
    | 'Professionell'
    | 'Fließend'
    | 'Muttersprache'
}

const props = defineProps<{
  personalData: PersonalData
  ausbildungen: DynamicItem[]
  berufserfahrungen: DynamicItem[]
  kurse: KursItem[]
  auszeichnungen: AuszeichnungItem[]
  kenntnisse: string
  sprachen: SprachItem[]
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

const hasAnySprache = computed(() => {
  return props.sprachen.length > 0 && props.sprachen.some((item: SprachItem) => item.sprache)
})

// Konvertiert Sprachniveau zu numerischem Wert für Balkenanzeige
function getLevelValue(niveau: string): number {
  const levels: { [key: string]: number } = {
    Grundkenntnisse: 1,
    Konversationsfähig: 2,
    Gut: 3,
    Professionell: 4,
    Fließend: 5,
    Muttersprache: 6,
  }
  return levels[niveau] || 0
}

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
  <div class="pdf-template" :class="{ 'light-mode': !isDarkMode }">
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

/* Sprachen mit Niveau-Balken (PDF-optimiert) */
.language-items {
  display: flex;
  flex-direction: column;
  gap: 3mm;
}

.language-item {
  display: flex;
  flex-direction: column;
  gap: 1.5mm;
}

.language-name {
  font-size: 3mm;
  font-weight: 600;
  color: #000;
}

.niveau-text {
  font-size: 2.3mm;
  font-weight: 400;
  color: #999;
}

.language-level {
  display: flex;
  align-items: center;
}

.level-bars {
  display: flex;
  gap: 1mm;
  align-items: center;
}

.level-bar {
  width: 8mm;
  height: 2.5mm;
  background: #e0e0e0;
  border-radius: 0.5mm;
}

.level-bar.filled {
  background: #2c3e50;
}

.light-mode .level-bar.filled {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-bar.native-bar {
  background: #2c3e50;
}

.light-mode .level-bar.native-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-bar.native-extra {
  background: #dc3545;
  width: 9mm;
  height: 3mm;
  border: 0.5mm solid #dc3545;
}

.light-mode .level-bar.native-extra {
  background: #dc3545;
  border-color: #dc3545;
}

/* Rechte Spalte (Hauptbereich) */
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
  page-break-after: avoid;
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

/* Print optimizations - Ermöglicht automatische Seitenumbrüche */
@media print {
  .pdf-template {
    width: 210mm;
    margin: 0;
    box-shadow: none;
  }

  .pdf-header {
    page-break-after: avoid;
  }

  .pdf-content {
    page-break-inside: auto;
  }
}
</style>
