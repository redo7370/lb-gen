<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import CVPreview from './CVPreview.vue'
import CVPDFTemplate from './CVPDFTemplate.vue'
import html2pdf from 'html2pdf.js'

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
const sprachen = ref('')
const interessen = ref('')
const isDarkMode = ref(true)

let ausbildungCounter = 0
let berufserfahrungCounter = 0
let kurseCounter = 0
let auszeichnungenCounter = 0

const cvPreviewRef = ref<HTMLElement | null>(null)
const cvPdfTemplateRef = ref<HTMLElement | null>(null)

// LocalStorage Funktionen
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('cv-data')
    if (saved) {
      const data = JSON.parse(saved)
      Object.assign(personalData, data.personalData || {})
      ausbildungen.value = data.ausbildungen || []
      berufserfahrungen.value = data.berufserfahrungen || []
      kurse.value = data.kurse || []
      auszeichnungen.value = data.auszeichnungen || []
      kenntnisse.value = data.kenntnisse || ''
      sprachen.value = data.sprachen || ''
      interessen.value = data.interessen || ''
      isDarkMode.value = data.isDarkMode ?? true

      // Update counters
      ausbildungCounter = Math.max(0, ...ausbildungen.value.map((item: DynamicItem) => item.id)) + 1
      berufserfahrungCounter =
        Math.max(0, ...berufserfahrungen.value.map((item: DynamicItem) => item.id)) + 1
      kurseCounter = Math.max(0, ...kurse.value.map((item: KursItem) => item.id)) + 1
      auszeichnungenCounter =
        Math.max(0, ...auszeichnungen.value.map((item: AuszeichnungItem) => item.id)) + 1
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
      isDarkMode: isDarkMode.value,
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
    isDarkMode,
  ],
  () => {
    saveToLocalStorage()
  },
  { deep: true },
)

// Daten beim Start laden
onMounted(() => {
  loadFromLocalStorage()
})

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
}

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
  if (parts.length === 2) {
    const month = parseInt(parts[0])
    const year = parseInt(parts[1])
    if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
      return new Date(year, month - 1).getTime()
    }
  }

  // Format: YYYY
  if (parts.length === 1) {
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
  <div class="container">
    <div class="header">
      <h1>Lebenslauf Generator</h1>
      <p>Erstellen Sie Ihren professionellen Lebenslauf</p>
    </div>

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
        <div class="form-group">
          <label>Sprachen (durch Komma getrennt)</label>
          <textarea
            v-model="sprachen"
            placeholder="Deutsch (Muttersprache), Englisch (fließend), etc."
          ></textarea>
        </div>

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
          :is-dark-mode="isDarkMode"
          @toggle-theme="toggleTheme"
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
        :is-dark-mode="isDarkMode"
      />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  text-align: center;
  flex-shrink: 0;
}

.header h1 {
  font-size: 1.8em;
  margin-bottom: 5px;
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
  background: #f8f9fa;
  overflow-y: auto;
  flex-shrink: 0;
}

.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #e8e8e8;
  padding: 20px;
  min-width: 0;
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
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
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
  border: 3px solid #667eea;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
  border: 3px dashed #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-upload-placeholder:hover {
  border-color: #5568d3;
  background: #f0f1f5;
  transform: scale(1.05);
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
  color: #667eea;
  font-weight: 600;
}

.photo-input {
  display: none;
}

.section-title {
  font-size: 1.5em;
  color: #667eea;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.dynamic-item {
  background: #fff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  position: relative;
  transition: all 0.3s ease;
}

.dynamic-item.has-date-error {
  border-color: #dc3545;
  background: #fff5f5;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  padding: 12px 30px;
  display: block;
  margin: 0 auto 15px auto;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  flex-shrink: 0;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(102, 126, 234, 0.6);
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
