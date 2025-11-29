<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import CVPreview from './CVPreview.vue'
import CVPDFTemplate from './CVPDFTemplate.vue'
import html2pdf from 'html2pdf.js'
import type {
  PersonalData,
  DynamicItem,
  KursItem,
  AuszeichnungItem,
  SprachItem,
} from '@/composables/useCVData'

const personalData = reactive<PersonalData>({
  name: '',
  geburtsdatum: '',
  geburtsort: '',
  adresse: '',
  telefon: '',
  email: '',
  photoUrl: '',
})

const ausbildungen = ref<DynamicItem[]>([])
const berufserfahrungen = ref<DynamicItem[]>([])
const kurse = ref<KursItem[]>([])
const auszeichnungen = ref<AuszeichnungItem[]>([])
const kenntnisse = ref('')
const sprachen = ref<SprachItem[]>([])
const interessen = ref('')
const isSPADark = ref(false) // SPA Dark Mode ONLY - Navbar, Form, Preview Background

let ausbildungCounter = 0
let berufserfahrungCounter = 0
let kurseCounter = 0
let auszeichnungenCounter = 0
let sprachenCounter = 0

const cvPreviewRef = ref<HTMLElement | null>(null)
const cvPdfTemplateRef = ref<HTMLElement | null>(null)

// LocalStorage Funktionen
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('cv-data')
    if (saved) {
      const data = JSON.parse(saved)

      // Personal Data
      Object.assign(personalData, data.personalData || {})

      // Listen
      ausbildungen.value = data.ausbildungen || []
      berufserfahrungen.value = data.berufserfahrungen || []
      kurse.value = data.kurse || []
      auszeichnungen.value = data.auszeichnungen || []

      // Migration: Wenn sprachen ein String ist, zu leerem Array konvertieren
      if (typeof data.sprachen === 'string') {
        sprachen.value = []
      } else {
        sprachen.value = data.sprachen || []
      }

      // Texte
      kenntnisse.value = data.kenntnisse || ''
      interessen.value = data.interessen || ''

      // SPA Dark Mode only
      isSPADark.value = data.isSPADark ?? false

      // Counter aktualisieren
      ausbildungCounter =
        ausbildungen.value.length > 0
          ? Math.max(...ausbildungen.value.map((item: DynamicItem) => item.id)) + 1
          : 0
      berufserfahrungCounter =
        berufserfahrungen.value.length > 0
          ? Math.max(...berufserfahrungen.value.map((item: DynamicItem) => item.id)) + 1
          : 0
      kurseCounter =
        kurse.value.length > 0 ? Math.max(...kurse.value.map((item: KursItem) => item.id)) + 1 : 0
      auszeichnungenCounter =
        auszeichnungen.value.length > 0
          ? Math.max(...auszeichnungen.value.map((item: AuszeichnungItem) => item.id)) + 1
          : 0
      sprachenCounter =
        sprachen.value.length > 0
          ? Math.max(...sprachen.value.map((item: SprachItem) => item.id)) + 1
          : 0
    }
  } catch (error) {
    console.error('Fehler beim Laden der Daten:', error)
  }
}

function saveToLocalStorage() {
  try {
    const data = {
      personalData,
      ausbildungen: ausbildungen.value,
      berufserfahrungen: berufserfahrungen.value,
      kurse: kurse.value,
      auszeichnungen: auszeichnungen.value,
      kenntnisse: kenntnisse.value,
      sprachen: sprachen.value,
      interessen: interessen.value,
      isSPADark: isSPADark.value, // Only SPA dark mode
    }
    localStorage.setItem('cv-data', JSON.stringify(data))
  } catch (error) {
    console.error('Fehler beim Speichern der Daten:', error)
  }
}

// Watch für automatisches Speichern
watch(
  [
    personalData,
    ausbildungen,
    berufserfahrungen,
    kurse,
    auszeichnungen,
    kenntnisse,
    sprachen,
    interessen,
    isSPADark, // Only SPA Dark Mode
  ],
  () => {
    saveToLocalStorage()
  },
  { deep: true },
)

// Daten beim Start laden
onMounted(() => {
  // Bereinige alte gecachte Daten, wenn nötig
  const saved = localStorage.getItem('cv-data')
  if (saved) {
    const data = JSON.parse(saved)
    // Wenn alte isDarkMode vorhanden ist, migriere zu SPA Dark Mode
    if (data.isDarkMode !== undefined && data.isSPADarkMode === undefined) {
      data.isSPADarkMode = false
      delete data.isDarkMode
      delete data.isCVDarkMode // Remove old CV dark mode
      localStorage.setItem('cv-data', JSON.stringify(data))
    }
  }

  loadFromLocalStorage()
})

// Toggle SPA Dark Mode - for Navbar, Form, Preview-Section Background
function toggleTheme() {
  isSPADark.value = !isSPADark.value
}

// CV Template handles its own dark mode internally - no function needed here

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      personalData.photoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removePhoto() {
  personalData.photoUrl = ''
}

// Hilfsfunktion zum Parsen von Datumsangaben
function parseDate(dateStr: string): number | null {
  if (!dateStr) return null

  // "heute", "aktuell", "present" = aktuelles Datum
  const heute =
    dateStr.toLowerCase().includes('heute') ||
    dateStr.toLowerCase().includes('aktuell') ||
    dateStr.toLowerCase().includes('present')
  if (heute) return Date.now()

  // Format: MM/YYYY
  const parts = dateStr.split(/[\/\-\.]/).map((p) => p.trim())
  if (parts.length === 2 && parts[0] && parts[1]) {
    const month = parseInt(parts[0])
    const year = parseInt(parts[1])
    if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
      return new Date(year, month - 1).getTime()
    }
  }

  // Format: YYYY
  if (parts.length === 1 && parts[0]) {
    const year = parseInt(parts[0])
    if (!isNaN(year) && year > 1900 && year < 2100) {
      return new Date(year, 0).getTime()
    }
  }

  return null
}

// Validiert, ob das Von-Datum vor dem Bis-Datum liegt
function validateDateRange(dateFrom: string, dateTo: string): boolean {
  if (!dateFrom || !dateTo) return true // Keine Validierung wenn eines fehlt

  const fromTime = parseDate(dateFrom)
  const toTime = parseDate(dateTo)

  if (fromTime === null || toTime === null) return true // Ungültiges Format wird nicht als Fehler gewertet

  return fromTime <= toTime
}

// Computed: Finde alle Einträge mit Datumsfehlern
const dateErrors = ref<Set<number>>(new Set())

function checkAllDates() {
  const errors = new Set<number>()

  // Prüfe Ausbildungen
  ausbildungen.value.forEach((item: DynamicItem) => {
    if (!validateDateRange(item.dateFrom, item.dateTo)) {
      errors.add(item.id)
    }
  })

  // Prüfe Berufserfahrungen
  berufserfahrungen.value.forEach((item: DynamicItem) => {
    if (!validateDateRange(item.dateFrom, item.dateTo)) {
      errors.add(item.id)
    }
  })

  dateErrors.value = errors
}

// Überwache Änderungen an den Daten
watch(
  [ausbildungen, berufserfahrungen],
  () => {
    checkAllDates()
  },
  { deep: true },
)

function addAusbildung() {
  ausbildungen.value.push({
    id: ausbildungCounter++,
    title: '',
    subtitle: '',
    dateFrom: '',
    dateTo: '',
    description: '',
  })
}

function removeAusbildung(id: number) {
  ausbildungen.value = ausbildungen.value.filter((item: DynamicItem) => item.id !== id)
}

function addBerufserfahrung() {
  berufserfahrungen.value.push({
    id: berufserfahrungCounter++,
    title: '',
    subtitle: '',
    dateFrom: '',
    dateTo: '',
    description: '',
  })
}

function removeBerufserfahrung(id: number) {
  berufserfahrungen.value = berufserfahrungen.value.filter((item: DynamicItem) => item.id !== id)
}

function addKurs() {
  kurse.value.push({
    id: kurseCounter++,
    title: '',
    anbieter: '',
    datum: '',
  })
}

function removeKurs(id: number) {
  kurse.value = kurse.value.filter((item: KursItem) => item.id !== id)
}

function addAuszeichnung() {
  auszeichnungen.value.push({
    id: auszeichnungenCounter++,
    title: '',
    verliehen: '',
    datum: '',
  })
}

function removeAuszeichnung(id: number) {
  auszeichnungen.value = auszeichnungen.value.filter((item: AuszeichnungItem) => item.id !== id)
}

function addSprache() {
  sprachen.value.push({
    id: sprachenCounter++,
    sprache: '',
    niveau: 'Grundkenntnisse',
  })
}

function removeSprache(id: number) {
  sprachen.value = sprachen.value.filter((item: SprachItem) => item.id !== id)
}

async function exportPDF() {
  // Get the actual DOM element from the Vue component ref
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vueComponent = cvPdfTemplateRef.value as any
  const templateElement = vueComponent?.$el || vueComponent

  if (!templateElement) {
    console.error('PDF Template Element not found')
    return
  }

  // Temporarily make visible for rendering
  const container = templateElement.closest('.pdf-container')
  if (container) {
    container.style.position = 'fixed'
    container.style.left = '0'
    container.style.top = '0'
    container.style.visibility = 'visible'
    container.style.zIndex = '-1'
  }

  const opt = {
    margin: 0,
    filename: 'Lebenslauf.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: {
      unit: 'mm' as const,
      format: 'a4' as const,
      orientation: 'portrait' as const,
      compress: true,
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break' },
  }

  try {
    await html2pdf().set(opt).from(templateElement).save()
  } catch (error) {
    console.error('PDF Export Error:', error)
    alert('Fehler beim PDF-Export. Bitte versuchen Sie es erneut.')
  } finally {
    // Hide again after rendering
    if (container) {
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '-9999px'
      container.style.visibility = 'hidden'
      container.style.zIndex = ''
    }
  }
}
</script>

<template>
  <div class="container" :class="{ 'dark-mode': isSPADark }">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-brand">
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

    <div class="content">
      <!-- Form Section -->
      <div class="form-section">
        <h2 class="section-title">Persönliche Daten</h2>

        <!-- Foto Upload -->
        <div class="form-group photo-upload-section">
          <label>Profilfoto</label>
          <div class="photo-upload-container">
            <div v-if="personalData.photoUrl" class="photo-preview">
              <img :src="personalData.photoUrl" alt="Profilfoto" />
              <button
                type="button"
                class="btn-remove-photo"
                @click="removePhoto"
                title="Foto entfernen"
              >
                ✕
              </button>
            </div>
            <div v-else class="photo-upload-placeholder">
              <label for="photo-upload" class="photo-upload-label">
                <span>Foto hochladen</span>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="photo-input"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Name</label>
          <input type="text" v-model="personalData.name" placeholder="Max Mustermann" />
        </div>
        <div class="two-column">
          <div class="form-group">
            <label>Geburtsdatum</label>
            <input type="date" v-model="personalData.geburtsdatum" />
          </div>
          <div class="form-group">
            <label>Geburtsort</label>
            <input type="text" v-model="personalData.geburtsort" placeholder="Berlin" />
          </div>
        </div>
        <div class="form-group">
          <label>Adresse</label>
          <input
            type="text"
            v-model="personalData.adresse"
            placeholder="Musterstraße 123, 12345 Berlin"
          />
        </div>
        <div class="two-column">
          <div class="form-group">
            <label>Telefon</label>
            <input type="tel" v-model="personalData.telefon" placeholder="+49 123 456789" />
          </div>
          <div class="form-group">
            <label>E-Mail</label>
            <input type="email" v-model="personalData.email" placeholder="max@beispiel.de" />
          </div>
        </div>

        <!-- Ausbildung -->
        <h2 class="section-title">Ausbildung</h2>
        <div
          class="dynamic-item"
          v-for="item in ausbildungen"
          :key="item.id"
          :class="{ 'has-date-error': dateErrors.has(item.id) }"
        >
          <button class="btn btn-remove" @click="removeAusbildung(item.id)">✕</button>
          <div class="form-group">
            <label>Abschluss/Titel</label>
            <input type="text" v-model="item.title" placeholder="Bachelor of Science" />
          </div>
          <div class="form-group">
            <label>Institution</label>
            <input type="text" v-model="item.subtitle" placeholder="Universität Berlin" />
          </div>
          <div class="two-column">
            <div class="form-group">
              <label>Von</label>
              <input type="text" v-model="item.dateFrom" placeholder="09/2015" />
            </div>
            <div class="form-group">
              <label>Bis</label>
              <input type="text" v-model="item.dateTo" placeholder="07/2018" />
            </div>
          </div>
          <div v-if="dateErrors.has(item.id)" class="date-error-message">
            ⚠️ Fehler: Das End-Datum muss nach dem Start-Datum liegen!
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea v-model="item.description" placeholder="Details zur Ausbildung..."></textarea>
          </div>
        </div>
        <button class="btn btn-add" @click="addAusbildung">+ Ausbildung hinzufügen</button>

        <!-- Berufserfahrung -->
        <h2 class="section-title">Berufserfahrung</h2>
        <div
          class="dynamic-item"
          v-for="item in berufserfahrungen"
          :key="item.id"
          :class="{ 'has-date-error': dateErrors.has(item.id) }"
        >
          <button class="btn btn-remove" @click="removeBerufserfahrung(item.id)">✕</button>
          <div class="form-group">
            <label>Position</label>
            <input type="text" v-model="item.title" placeholder="Software Entwickler" />
          </div>
          <div class="form-group">
            <label>Unternehmen</label>
            <input type="text" v-model="item.subtitle" placeholder="Tech GmbH" />
          </div>
          <div class="two-column">
            <div class="form-group">
              <label>Von</label>
              <input type="text" v-model="item.dateFrom" placeholder="01/2019" />
            </div>
            <div class="form-group">
              <label>Bis</label>
              <input type="text" v-model="item.dateTo" placeholder="Heute" />
            </div>
          </div>
          <div v-if="dateErrors.has(item.id)" class="date-error-message">
            ⚠️ Fehler: Das End-Datum muss nach dem Start-Datum liegen!
          </div>
          <div class="form-group">
            <label>Beschreibung</label>
            <textarea
              v-model="item.description"
              placeholder="Aufgaben und Verantwortlichkeiten..."
            ></textarea>
          </div>
        </div>
        <button class="btn btn-add" @click="addBerufserfahrung">
          + Berufserfahrung hinzufügen
        </button>

        <!-- Kurse/Zertifikate -->
        <h2 class="section-title">Kurse & Zertifikate</h2>
        <div class="dynamic-item" v-for="item in kurse" :key="item.id">
          <button class="btn btn-remove" @click="removeKurs(item.id)">✕</button>
          <div class="form-group">
            <label>Kurs/Zertifikat</label>
            <input
              type="text"
              v-model="item.title"
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div class="form-group">
            <label>Anbieter</label>
            <input type="text" v-model="item.anbieter" placeholder="Amazon Web Services" />
          </div>
          <div class="form-group">
            <label>Datum</label>
            <input type="text" v-model="item.datum" placeholder="06/2023" />
          </div>
        </div>
        <button class="btn btn-add" @click="addKurs">+ Kurs/Zertifikat hinzufügen</button>

        <!-- Auszeichnungen -->
        <h2 class="section-title">Auszeichnungen</h2>
        <div class="dynamic-item" v-for="item in auszeichnungen" :key="item.id">
          <button class="btn btn-remove" @click="removeAuszeichnung(item.id)">✕</button>
          <div class="form-group">
            <label>Auszeichnung</label>
            <input type="text" v-model="item.title" placeholder="Mitarbeiter des Jahres" />
          </div>
          <div class="form-group">
            <label>Verliehen von</label>
            <input type="text" v-model="item.verliehen" placeholder="Tech GmbH" />
          </div>
          <div class="form-group">
            <label>Datum</label>
            <input type="text" v-model="item.datum" placeholder="12/2022" />
          </div>
        </div>
        <button class="btn btn-add" @click="addAuszeichnung">+ Auszeichnung hinzufügen</button>

        <!-- Kenntnisse -->
        <h2 class="section-title">Kenntnisse</h2>
        <div class="form-group">
          <label>Kenntnisse (durch Komma getrennt)</label>
          <textarea
            v-model="kenntnisse"
            placeholder="JavaScript, Python, Projektmanagement, etc."
          ></textarea>
        </div>

        <!-- Sprachen -->
        <h2 class="section-title">Sprachen</h2>
        <div class="dynamic-item" v-for="item in sprachen" :key="item.id">
          <button class="btn btn-remove" @click="removeSprache(item.id)">✕</button>
          <div class="form-group">
            <label>Sprache</label>
            <input type="text" v-model="item.sprache" placeholder="z.B. Deutsch" />
          </div>
          <div class="form-group">
            <label>Niveau</label>
            <select v-model="item.niveau" class="niveau-select">
              <option value="Grundkenntnisse">Grundkenntnisse</option>
              <option value="Konversationsfähig">Konversationsfähig</option>
              <option value="Gut">Gut</option>
              <option value="Professionell">Professionell</option>
              <option value="Fließend">Fließend</option>
              <option value="Muttersprache">Muttersprache</option>
            </select>
          </div>
        </div>
        <button class="btn btn-add" @click="addSprache">+ Sprache hinzufügen</button>

        <!-- Interessen -->
        <h2 class="section-title">Interessen</h2>
        <div class="form-group">
          <label>Interessen (durch Komma getrennt)</label>
          <textarea v-model="interessen" placeholder="Lesen, Sport, Reisen, etc."></textarea>
        </div>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <button class="btn btn-export" @click="exportPDF">📥 Als PDF exportieren</button>
        <!-- CVPreview manages its own CV template dark mode internally -->
        <CVPreview
          ref="cvPreviewRef"
          :personal-data="personalData"
          :ausbildungen="ausbildungen"
          :berufserfahrungen="berufserfahrungen"
          :kurse="kurse"
          :auszeichnungen="auszeichnungen"
          :kenntnisse="kenntnisse"
          :sprachen="sprachen"
          :interessen="interessen"
          :is-s-p-a-dark="isSPADark"
        />
      </div>
    </div>

    <!-- Hidden PDF Template for Export -->
    <div class="pdf-container">
      <CVPDFTemplate
        ref="cvPdfTemplateRef"
        :personal-data="personalData"
        :ausbildungen="ausbildungen"
        :berufserfahrungen="berufserfahrungen"
        :kurse="kurse"
        :auszeichnungen="auszeichnungen"
        :kenntnisse="kenntnisse"
        :sprachen="sprachen"
        :interessen="interessen"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  background: #f8fafc;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
}

.container.dark-mode {
  background: #0f172a;
}

.navbar {
  background: #2d3748;
  color: white;
  padding: 15px 30px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.container.dark-mode .navbar {
  background: #1e293b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.navbar-brand h1 {
  font-size: 1.5em;
  margin: 0;
  font-weight: 600;
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

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.form-section {
  width: 420px;
  padding: 25px;
  background: white;
  overflow-y: auto;
  flex-shrink: 0;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.container.dark-mode .form-section {
  background: #1e293b;
  color: #f1f5f9;
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #e2e8f0;
  padding: 20px;
  min-width: 0;
  transition: background-color 0.3s ease;
}

.container.dark-mode .preview-section {
  background: #0f172a;
}

.preview-section > :last-child {
  flex: 1;
  overflow: hidden;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #1e293b;
  transition: color 0.3s ease;
}

.container.dark-mode .form-group label {
  color: #f1f5f9;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #cbd5e0;
  border-radius: 5px;
  font-size: 14px;
  background: white;
  color: #1e293b;
  transition:
    border-color 0.3s,
    background-color 0.3s,
    color 0.3s;
}

.container.dark-mode .form-group input,
.container.dark-mode .form-group textarea {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #2d3748;
}

.container.dark-mode .form-group input:focus,
.container.dark-mode .form-group textarea:focus {
  border-color: #64748b;
  background: #475569;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

/* Photo Upload Styles */
.photo-upload-section {
  margin-bottom: 20px;
}

.photo-upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.photo-preview {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #2d3748;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.container.dark-mode .photo-preview {
  border-color: #64748b;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-photo {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-remove-photo:hover {
  background: rgba(255, 59, 48, 1);
  transform: scale(1.1);
}

.photo-upload-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px dashed #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
}

.container.dark-mode .photo-upload-placeholder {
  border-color: #64748b;
  background: #334155;
}

.photo-upload-placeholder:hover {
  border-color: #1e293b;
  background: #f1f5f9;
  transform: scale(1.05);
}

.container.dark-mode .photo-upload-placeholder:hover {
  border-color: #94a3b8;
  background: #475569;
}

.photo-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: center;
  padding: 20px;
}

.upload-icon {
  font-size: 32px;
}

.photo-upload-label span:last-child {
  font-size: 14px;
  color: #2d3748;
  font-weight: 600;
  transition: color 0.3s ease;
}

.container.dark-mode .photo-upload-label span:last-child {
  color: #cbd5e0;
}

.photo-input {
  display: none;
}

.section-title {
  font-size: 1.5em;
  color: #2d3748;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #2d3748;
  transition:
    color 0.3s ease,
    border-color 0.3s ease;
}

.container.dark-mode .section-title {
  color: #e2e8f0;
  border-bottom-color: #64748b;
}

.dynamic-item {
  background: #f8fafc;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  border: 1px solid #cbd5e0;
  position: relative;
  transition: all 0.3s ease;
}

.container.dark-mode .dynamic-item {
  background: #334155;
  border-color: #475569;
}

.dynamic-item.has-date-error {
  border-color: #dc3545;
  background: #fff5f5;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.container.dark-mode .dynamic-item.has-date-error {
  background: #4a2020;
  border-color: #ff6b6b;
}

.date-error-message {
  background: #dc3545;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-add {
  background: #28a745;
  color: white;
  margin-top: 10px;
}

.btn-add:hover {
  background: #218838;
}

.btn-remove {
  background: #dc3545;
  color: white;
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  font-size: 12px;
}

.btn-remove:hover {
  background: #c82333;
}

.btn-export {
  background: #2d3748;
  color: white;
  font-size: 16px;
  padding: 12px 30px;
  display: block;
  margin: 0 auto 15px auto;
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.4);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.container.dark-mode .btn-export {
  background: #475569;
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.6);
}

.btn-export:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(45, 55, 72, 0.6);
}

.container.dark-mode .btn-export:hover {
  background: #64748b;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Sprachniveau Auswahl und Vorschau */
.niveau-select {
  width: 100%;
  padding: 10px;
  border: 2px solid #cbd5e0;
  border-radius: 5px;
  font-size: 14px;
  background: white;
  color: #1e293b;
  cursor: pointer;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;
}

.container.dark-mode .niveau-select {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

@media (max-width: 968px) {
  .content {
    flex-direction: column;
  }

  .two-column {
    grid-template-columns: 1fr;
  }
}

/* Hide PDF template from view */
.pdf-container {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 210mm;
  min-height: 297mm;
  visibility: hidden;
  overflow: visible;
  pointer-events: none;
}
</style>
